<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('student_grades', function (Blueprint $table) {
            $table->id();
            $table->string('student_id', 50);
            $table->string('student_name', 100);
            $table->string('program', 10);
            $table->tinyInteger('year_level');
            $table->string('subject', 100);
            $table->string('semester', 20);
            $table->string('school_year', 20);
            $table->decimal('grade', 5, 2);
            $table->decimal('attendance_rate', 5, 2);
            $table->foreignId('imported_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('import_batch_id', 36)->nullable();
            $table->timestamps();

            $table->index(['student_id', 'subject', 'semester', 'school_year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_grades');
    }
};