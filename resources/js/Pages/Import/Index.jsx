import AppLayout from '@/Layouts/AppLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle, Loader2, ChevronDown } from 'lucide-react';

const SEMESTER_OPTIONS = ['1st Sem', '2nd Sem', 'Summer'];
const PROGRAM_OPTIONS = ['BSIT', 'BSCS', 'BSIS', 'BSECE', 'BSED', 'BEED'];

export default function Index({ importLogs = [] }) {
    const [isDragging, setIsDragging] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef(null);

    const { data, setData, errors, reset } = useForm({
        file: null,
        semester: '1st Sem',
        school_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    });

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (validateFile(file)) {
                setData('file', file);
            }
        }
    }, [setData]);

    const handleFileSelect = (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            if (validateFile(file)) {
                setData('file', file);
            } else {
                e.target.value = '';
            }
        }
    };

    const validateFile = (file) => {
        const allowedTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        const allowedExtensions = ['.csv', '.xlsx'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        const extension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(extension)) {
            alert('Invalid file type. Please upload a .csv or .xlsx file.');
            return false;
        }

        if (file.size > maxSize) {
            alert('File size exceeds 5MB limit.');
            return false;
        }

        return true;
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handlePreview = async (e) => {
        e.preventDefault();
        if (!data.file) {
            alert('Please select a file first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('semester', data.semester);
        formData.append('school_year', data.school_year);

        try {
            const response = await fetch(route('import.preview'), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setPreviewData(result);
                setShowPreview(true);
            } else {
                alert(result.message || 'Preview failed. Please check your file and try again.');
            }
        } catch (error) {
            console.error('Preview error:', error);
            alert('An error occurred during preview. Please try again.');
        }
    };

    const handleConfirmImport = async () => {
        if (!data.file) return;

        setImporting(true);

        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('semester', data.semester);
        formData.append('school_year', data.school_year);

        try {
            const response = await fetch(route('import.store'), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setImporting(false);
                setShowPreview(false);
                reset('file');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setPreviewData(null);
                router.reload();
            } else {
                setImporting(false);
                alert(result.message || 'Import failed. Please try again.');
            }
        } catch (error) {
            console.error('Import error:', error);
            setImporting(false);
            alert('An error occurred during import. Please try again.');
        }
    };

    const handleCancelPreview = () => {
        setShowPreview(false);
        setPreviewData(null);
        reset('file');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            processing: 'bg-blue-100 text-blue-700',
            done: 'bg-green-100 text-green-700',
            failed: 'bg-red-100 text-red-700',
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <AppLayout
            header={
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Import CSV / Excel</h2>
                </div>
            }
        >
            <Head title="Import CSV / Excel" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <p className="mb-8 text-gray-600">Upload student grade records.</p>

                    {/* Upload Card */}
                    <div className="mb-8 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Upload File</h3>

                            {!showPreview ? (
                                <div className="space-y-6">
                                    {/* Drag and Drop Zone */}
                                    <div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                                            isDragging
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            id="file"
                                            accept=".csv,.xlsx"
                                            onChange={handleFileSelect}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <label htmlFor="file" className="cursor-pointer">
                                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                                                <Upload className="h-8 w-8" />
                                            </div>
                                            <p className="text-lg font-medium text-gray-900">Drag & drop your file here, or click to browse</p>
                                            <p className="mt-1 text-sm text-gray-500">CSV or XLSX format • Maximum 5MB</p>
                                        </label>
                                    </div>

                                    {data.file && (
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-6 w-6 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{data.file.name}</p>
                                                    <p className="text-sm text-gray-500">{formatFileSize(data.file.size)}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    reset('file');
                                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                                }}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Semester and School Year Dropdowns */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel htmlFor="semester" value="Semester" />
                                            <div className="relative mt-1">
                                                <select
                                                    id="semester"
                                                    value={data.semester}
                                                    onChange={(e) => setData('semester', e.target.value)}
                                                    className="block w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                                >
                                                    {SEMESTER_OPTIONS.map((sem) => (
                                                        <option key={sem} value={sem}>{sem}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                                </div>
                                            </div>
                                            <InputError message={errors.semester} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="school_year" value="School Year" />
                                            <TextInput
                                                id="school_year"
                                                type="text"
                                                className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-green-500"
                                                placeholder="e.g., 2024-2025"
                                                value={data.school_year}
                                                onChange={(e) => setData('school_year', e.target.value)}
                                            />
                                            <InputError message={errors.school_year} className="mt-2" />
                                        </div>
                                    </div>

                                    <PrimaryButton onClick={handlePreview} disabled={importing || !data.file} className="w-full">
                                        Upload and Preview
                                    </PrimaryButton>
                                </div>
                            ) : (
                                /* Preview Table */
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-lg font-semibold text-gray-900">Preview Data</h4>
                                        <SecondaryButton onClick={handleCancelPreview}>Cancel</SecondaryButton>
                                    </div>

                                    {previewData && (
                                        <div className="space-y-4">
                                            {/* Summary */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="p-4 bg-blue-50 rounded-lg">
                                                    <p className="text-sm text-blue-700">Total Rows in File</p>
                                                    <p className="text-2xl font-bold text-blue-900">{previewData.total_rows}</p>
                                                </div>
                                                <div className="p-4 bg-green-50 rounded-lg">
                                                    <p className="text-sm text-green-700">Valid Rows</p>
                                                    <p className="text-2xl font-bold text-green-900">{previewData.valid_rows}</p>
                                                </div>
                                                <div className="p-4 bg-red-50 rounded-lg">
                                                    <p className="text-sm text-red-700">Rows with Errors</p>
                                                    <p className="text-2xl font-bold text-red-900">{previewData.errors?.length || 0}</p>
                                                </div>
                                            </div>

                                            {/* Preview Table */}
                                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student ID</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Program</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Year</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Semester</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">School Year</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Grade</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendance</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {previewData.rows?.map((row, index) => {
                                                            const rowErrors = previewData.errors?.filter(e => e.row === index + 2) || [];
                                                            const hasErrors = rowErrors.length > 0;
                                                            return (
                                                                <tr key={index} className={hasErrors ? 'bg-red-50' : ''}>
                                                                    <td className="px-4 py-3 text-sm text-gray-900">{row.student_id}</td>
                                                                    <td className="px-4 py-3 text-sm text-gray-900">{row.student_name}</td>
                                                                    <td className="px-4 py-3 text-sm text-gray-900">{row.program}</td>
                                                                    <td className="px-4 py-3 text-sm text-gray-900">{row.year_level}</td>
                                                                    <td className="px-4 py-3 text-sm text-gray-900">{row.subject}</td>
                                                                    <td className="px-4 py-3 text-sm text-gray-900">{row.semester}</td>
                                                                    <td className="px-4 py-3 text-sm text-gray-900">{row.school_year}</td>
                                                                    <td className="px-4 py-3 text-sm text-gray-900">{row.grade}</td>
                                                                    <td className="px-4 py-3 text-sm text-gray-900">{row.attendance_rate}</td>
                                                                    <td className="px-4 py-3 text-sm">
                                                                        {hasErrors ? (
                                                                            <span className="flex items-center gap-1 text-red-600">
                                                                                <AlertCircle className="h-4 w-4" />
                                                                                {rowErrors.map(e => e.message).join('; ')}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="flex items-center gap-1 text-green-600">
                                                                                <CheckCircle className="h-4 w-4" />
                                                                                Valid
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <PrimaryButton onClick={handleConfirmImport} disabled={importing} className="w-full">
                                                {importing ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Importing...
                                                    </>
                                                ) : (
                                                    'Confirm Import'
                                                )}
                                            </PrimaryButton>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Import History */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Import History</h3>
                            {importLogs.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No imports yet.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Filename</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Semester</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">School Year</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Success</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Failed</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Skipped</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Imported By</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {importLogs.map((log) => (
                                                <tr key={log.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.created_at}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.filename}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.semester}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.school_year}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.total_rows}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700">{log.success_rows}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-700">{log.failed_rows}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-700">{log.skipped_rows}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(log.status)}`}>
                                                            {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.imported_by}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}