<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class ImportLog extends Model
{
    protected $fillable = [
        'filename',
        'imported_by',
        'total_rows',
        'success_rows',
        'failed_rows',
        'skipped_rows',
        'semester',
        'school_year',
        'status',
        'error_summary',
    ];

    protected $casts = [
        'total_rows' => 'integer',
        'success_rows' => 'integer',
        'failed_rows' => 'integer',
        'skipped_rows' => 'integer',
        'error_summary' => 'array',
    ];

    public function importedBy()
    {
        return $this->belongsTo(User::class, 'imported_by');
    }
}