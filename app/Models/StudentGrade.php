<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentGrade extends Model
{
    protected $fillable = [
        'student_id',
        'student_name',
        'program',
        'year_level',
        'subject',
        'semester',
        'school_year',
        'grade',
        'attendance_rate',
        'imported_by',
        'import_batch_id',
    ];

    protected $casts = [
        'grade' => 'decimal:2',
        'attendance_rate' => 'decimal:2',
        'year_level' => 'integer',
    ];
}