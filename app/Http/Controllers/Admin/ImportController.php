<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ImportLog;
use App\Models\StudentGrade;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use League\Csv\Reader;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportController extends Controller
{
    public function index()
    {
        $importLogs = ImportLog::with('importedBy:id,name')
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'filename' => $log->filename,
                    'imported_by' => $log->importedBy?->name,
                    'total_rows' => $log->total_rows,
                    'success_rows' => $log->success_rows,
                    'failed_rows' => $log->failed_rows,
                    'skipped_rows' => $log->skipped_rows,
                    'semester' => $log->semester,
                    'school_year' => $log->school_year,
                    'status' => $log->status,
                    'created_at' => $log->created_at->format('M d, Y H:i'),
                ];
            });

        return inertia('Import/Index', [
            'importLogs' => $importLogs,
        ]);
    }

    public function preview(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx|max:5120',
            'semester' => ['required', Rule::in(['1st Sem', '2nd Sem', 'Summer'])],
            'school_year' => ['required', 'regex:/^\d{4}-\d{4}$/'],
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        $rows = [];

        if ($extension === 'csv') {
            $rows = $this->parseCsv($file);
        } else {
            $rows = $this->parseXlsx($file);
        }

        $requiredColumns = [
            'student_id', 'student_name', 'program', 'year_level',
            'subject', 'semester', 'school_year', 'grade', 'attendance_rate'
        ];

        if (empty($rows)) {
            return response()->json([
                'success' => false,
                'message' => 'No data rows found in the file. Please ensure the file contains data rows below the header.',
            ], 422);
        }

        $rawHeaders = array_keys($rows[0] ?? []);
        $headers = array_map(fn($h) => strtolower(trim(str_replace("\xEF\xBB\xBF", '', $h))), $rawHeaders);
        $missingColumns = array_diff($requiredColumns, $headers);

        if (!empty($missingColumns)) {
            return response()->json([
                'success' => false,
                'message' => 'Missing columns. Found: [' . implode(', ', $headers) . '] Required: [' . implode(', ', $requiredColumns) . ']',
            ], 422);
        }

        $validatedRows = [];
        $errors = [];
        $validCount = 0;

        foreach ($rows as $index => $row) {
            $rowNum = $index + 2; // 1-based, accounting for header
            $rowErrors = $this->validateRow($row, $rowNum);

            if (empty($rowErrors)) {
                $validatedRows[] = $row;
                $validCount++;
            } else {
                foreach ($rowErrors as $error) {
                    $errors[] = [
                        'row' => $rowNum,
                        'field' => $error['field'],
                        'message' => $error['message'],
                    ];
                }
            }
        }

        return response()->json([
            'success' => true,
            'headers' => $headers,
            'rows' => array_slice($validatedRows, 0, 10),
            'total_rows' => count($rows),
            'valid_rows' => $validCount,
            'errors' => $errors,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx|max:5120',
            'semester' => ['required', Rule::in(['1st Sem', '2nd Sem', 'Summer'])],
            'school_year' => ['required', 'regex:/^\d{4}-\d{4}$/'],
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        $rows = [];

        if ($extension === 'csv') {
            $rows = $this->parseCsv($file);
        } else {
            $rows = $this->parseXlsx($file);
        }

        $requiredColumns = [
            'student_id', 'student_name', 'program', 'year_level',
            'subject', 'semester', 'school_year', 'grade', 'attendance_rate'
        ];

        if (empty($rows)) {
            return response()->json([
                'success' => false,
                'message' => 'No data rows found in the file. Please ensure the file contains data rows below the header.',
            ], 422);
        }

        $rawHeaders = array_keys($rows[0] ?? []);
        $headers = array_map(fn($h) => strtolower(trim(str_replace("\xEF\xBB\xBF", '', $h))), $rawHeaders);
        $missingColumns = array_diff($requiredColumns, $headers);

        if (!empty($missingColumns)) {
            return response()->json([
                'success' => false,
                'message' => 'Missing columns. Found: [' . implode(', ', $headers) . '] Required: [' . implode(', ', $requiredColumns) . ']',
            ], 422);
        }

        $importBatchId = (string) \Illuminate\Support\Str::uuid();
        $importedBy = auth()->id();

        $validRows = [];
        $errorRows = [];
        $skippedCount = 0;

        foreach ($rows as $index => $row) {
            $rowNum = $index + 2;
            $rowErrors = $this->validateRow($row, $rowNum);

            if (!empty($rowErrors)) {
                foreach ($rowErrors as $error) {
                    $errorRows[] = [
                        'row' => $rowNum,
                        'field' => $error['field'],
                        'message' => $error['message'],
                        'data' => $row,
                    ];
                }
                continue;
            }

            // Check for duplicate
            $exists = StudentGrade::where('student_id', $row['student_id'])
                ->where('subject', $row['subject'])
                ->where('semester', $row['semester'])
                ->where('school_year', $row['school_year'])
                ->exists();

            if ($exists) {
                $skippedCount++;
                continue;
            }

            $validRows[] = [
                'student_id' => $row['student_id'],
                'student_name' => $row['student_name'],
                'program' => $row['program'],
                'year_level' => (int) $row['year_level'],
                'subject' => $row['subject'],
                'semester' => $row['semester'],
                'school_year' => $row['school_year'],
                'grade' => (float) $row['grade'],
                'attendance_rate' => (float) $row['attendance_rate'],
                'imported_by' => $importedBy,
                'import_batch_id' => $importBatchId,
            ];
        }

        $successCount = 0;

        if (!empty($validRows)) {
            DB::transaction(function () use ($validRows, &$successCount) {
                foreach (array_chunk($validRows, 500) as $chunk) {
                    StudentGrade::insert($chunk);
                    $successCount += count($chunk);
                }
            });
        }

        $failedCount = count($errorRows);

        $importLog = ImportLog::create([
            'filename' => $file->getClientOriginalName(),
            'imported_by' => $importedBy,
            'total_rows' => count($rows),
            'success_rows' => $successCount,
            'failed_rows' => $failedCount,
            'skipped_rows' => $skippedCount,
            'semester' => $request->semester,
            'school_year' => $request->school_year,
            'status' => $failedCount > 0 ? 'done' : 'done',
            'error_summary' => $errorRows,
        ]);

        return response()->json([
            'success' => true,
            'success_rows' => $successCount,
            'failed_rows' => $failedCount,
            'skipped_rows' => $skippedCount,
            'import_log_id' => $importLog->id,
        ]);
    }

    private function parseCsv($file): array
    {
        $csv = Reader::createFromPath($file->getRealPath(), 'r');
        $csv->setHeaderOffset(0);
        $records = iterator_to_array($csv->getRecords());
        // Re-index to 0-based array
        $records = array_values($records);

        // Normalize headers to lowercase for case-insensitive matching
        foreach ($records as &$record) {
            $normalized = [];
            foreach ($record as $key => $value) {
                $normalized[strtolower(trim($key))] = $value;
            }
            $record = $normalized;
        }

        return $records;
    }

    private function parseXlsx($file): array
    {
        $spreadsheet = IOFactory::load($file->getRealPath());
        $sheet = $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray();

        if (empty($rows)) {
            return [];
        }

        $headers = array_shift($rows);
        // Normalize headers to lowercase
        $headers = array_map(fn($h) => strtolower(trim($h)), $headers);
        $records = [];

        foreach ($rows as $row) {
            if (array_filter($row)) { // Skip empty rows
                $records[] = array_combine($headers, $row);
            }
        }

        return $records;
    }

    private function validateRow(array $row, int $rowNum): array
    {
        $errors = [];

        $validator = Validator::make($row, [
            'student_id' => 'required|string',
            'student_name' => 'required|string',
            'program' => ['required', Rule::in(['BSIT', 'BSCS', 'BSIS', 'BSECE', 'BSED', 'BEED'])],
            'year_level' => 'required|integer|between:1,4',
            'subject' => 'required|string',
            'semester' => ['required', Rule::in(['1st Sem', '2nd Sem', 'Summer'])],
            'school_year' => 'required|regex:/^\d{4}-\d{4}$/',
            'grade' => 'required|numeric|between:0,100',
            'attendance_rate' => 'required|numeric|between:0,100',
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->toArray() as $field => $messages) {
                foreach ($messages as $message) {
                    $errors[] = [
                        'field' => $field,
                        'message' => $message,
                    ];
                }
            }
        }

        return $errors;
    }
}