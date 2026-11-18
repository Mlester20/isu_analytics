# PROJECT TEMPLATE

## Student Academic Performance Analytics Dashboard

**Stack:** Laravel 11 + Inertia.js (Vue 3 or React) + MySQL + Chart.js

---

## Project Title

**Student Academic Performance Analytics Dashboard: A Data-Driven Decision Support System for Academic Monitoring**

## Project Overview

Educational institutions collect large amounts of student performance data every semester. However, raw data stored in spreadsheets is difficult to analyze and interpret.

This project develops a web-based analytics dashboard using **Laravel and Inertia.js** that imports student academic records from CSV files and transforms them into meaningful visualizations and reports for academic decision-making.

The system assists faculty members and administrators in identifying trends, monitoring performance, and detecting students who may require academic intervention.

## Scope of the Project

The system shall:

- Upload CSV files
- Store data in MySQL
- Generate statistical summaries
- Display dashboards
- Produce charts and visualizations
- Generate insights from the uploaded data

---

## Required Dataset Fields

Students may create their own CSV dataset or obtain one online (e.g., [UCI Student Performance](https://archive.ics.uci.edu/dataset/320/student+performance)).

**Minimum fields:**

```csv
student_id,student_name,program,year_level,subject,semester,school_year,grade,attendance_rate
2023-001,Juan Dela Cruz,BSIT,3,Database Systems,1st Sem,2026-2027,92,95
2023-002,Maria Santos,BSCS,2,Programming 3,1st Sem,2026-2027,87,90
```

**Minimum records:** 100

---

## Database Requirements

**Table name:** `student_grades`

| Field | Type |
|---|---|
| id | bigint, PK, auto-increment |
| student_id | string |
| student_name | string |
| program | string |
| year_level | unsignedTinyInteger |
| subject | string |
| semester | string |
| school_year | string |
| grade | decimal(5,2) |
| attendance_rate | decimal(5,2) |
| created_at / updated_at | timestamps |

### Migration

```php
// php artisan make:model StudentGrade -m
Schema::create('student_grades', function (Blueprint $table) {
    $table->id();
    $table->string('student_id')->index();
    $table->string('student_name');
    $table->string('program')->index();
    $table->unsignedTinyInteger('year_level');
    $table->string('subject')->index();
    $table->string('semester');
    $table->string('school_year');
    $table->decimal('grade', 5, 2);
    $table->decimal('attendance_rate', 5, 2);
    $table->timestamps();
});
```

### Model

```php
class StudentGrade extends Model
{
    protected $fillable = [
        'student_id','student_name','program','year_level',
        'subject','semester','school_year','grade','attendance_rate',
    ];
}
```

---

## System Architecture

```
CSV File
   │
   ▼
Laravel Application (Routes → Controller → Form Request validation)
   │
   ▼
MySQL Database (Eloquent / Migrations)
   │
   ▼
SQL Queries (Query Builder / raw SQL)
   │
   ▼
Analytics Engine (AnalyticsService class)
   │
   ▼
Inertia.js (props passed as JSON)
   │
   ▼
Vue/React Pages → Dashboard & Charts (Chart.js)
```

### Suggested Folder Structure

```
app/
├── Http/Controllers/
│   ├── DashboardController.php
│   └── ImportController.php
├── Models/StudentGrade.php
└── Services/AnalyticsService.php
resources/js/
├── Pages/
│   ├── Dashboard.vue
│   └── Import.vue
└── Components/
    ├── KpiCard.vue
    └── charts/ (GradeDistribution, ProgramAverage, ...)
routes/web.php
```

### Routes

```php
Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/import', [ImportController::class, 'create'])->name('import.create');
Route::post('/import', [ImportController::class, 'store'])->name('import.store');
```

### CSV Import Controller

```php
public function store(Request $request)
{
    $request->validate(['file' => 'required|file|mimes:csv,txt|max:10240']);

    $handle = fopen($request->file('file')->getRealPath(), 'r');
    $header = fgetcsv($handle);
    $rows = [];

    while (($row = fgetcsv($handle)) !== false) {
        $data = array_combine($header, $row);
        $rows[] = [
            'student_id'      => $data['student_id'],
            'student_name'    => $data['student_name'],
            'program'         => $data['program'],
            'year_level'      => (int) $data['year_level'],
            'subject'         => $data['subject'],
            'semester'        => $data['semester'],
            'school_year'     => $data['school_year'],
            'grade'           => (float) $data['grade'],
            'attendance_rate' => (float) $data['attendance_rate'],
            'created_at'      => now(),
            'updated_at'      => now(),
        ];
    }
    fclose($handle);

    foreach (array_chunk($rows, 500) as $chunk) {
        StudentGrade::insert($chunk);
    }

    return redirect()->route('dashboard')->with('success', count($rows).' records imported.');
}
```

### Dashboard Controller (Inertia)

```php
public function index(AnalyticsService $analytics)
{
    return Inertia::render('Dashboard', [
        'kpis'         => $analytics->kpis(),
        'stats'        => $analytics->descriptiveStats(),
        'distribution' => $analytics->gradeDistribution(),
        'byProgram'    => $analytics->averageByProgram(),
        'bySubject'    => $analytics->averageBySubject(),
        'top10'        => $analytics->topStudents(),
        'bottom10'     => $analytics->bottomStudents(),
        'atRisk'       => $analytics->atRiskStudents(),
        'insights'     => $analytics->insights(),
    ]);
}
```

---

## Dashboard Requirements

### Dashboard Header

Display: **Student Academic Performance Analytics Dashboard**

### KPI Cards

| # | KPI | Source |
|---|---|---|
| 1 | Total Students | `COUNT(DISTINCT student_id)` |
| 2 | Average Grade | `AVG(grade)` |
| 3 | Pass Rate | % of grades >= passing mark |
| 4 | Highest Grade | `MAX(grade)` |
| 5 | Average Attendance | `AVG(attendance_rate)` |
| 6 | At-Risk Students | count from risk rule |

### Charts

| # | Chart | Purpose | Recommended |
|---|---|---|---|
| 1 | Grade Distribution | Shows how grades are distributed | Histogram / Bar |
| 2 | Average Grade per Program | Compares programs | Bar Chart |
| 3 | Pass vs Fail | Shows pass rate | Pie / Doughnut |
| 4 | Attendance vs Grade | Shows correlation | Scatter Chart |
| 5 | Average Grade per Year Level | Shows progression | Line Chart |
| 6 | Average Grade per Subject | Finds difficult subjects | Horizontal Bar |

Example component (Vue 3 + vue-chartjs):

```vue
<script setup>
import { Bar } from 'vue-chartjs'
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const props = defineProps({ distribution: Array })
const data = {
  labels: props.distribution.map(d => d.range),
  datasets: [{ label: 'Students', data: props.distribution.map(d => d.total) }],
}
</script>

<template><Bar :data="data" /></template>
```

---

## Statistical Analysis Requirements

> Passing mark is assumed to be **75**. Change it in one config constant if your school uses a different one.

| Measure | Meaning |
|---|---|
| Mean | Average grade |
| Median | Middle grade |
| Mode | Most common grade |
| Standard Deviation | Grade variation |
| Pass Rate | Percentage passed |

```php
// app/Services/AnalyticsService.php
const PASSING = 75;

public function descriptiveStats(): array
{
    $grades = StudentGrade::pluck('grade')->map(fn ($g) => (float) $g);

    $mean   = $grades->avg();
    $median = $grades->median();
    $mode   = $grades->mode()[0] ?? null;
    $std    = StudentGrade::selectRaw('STDDEV_POP(grade) as sd')->value('sd');
    $pass   = $grades->filter(fn ($g) => $g >= self::PASSING)->count() / max($grades->count(), 1) * 100;

    return [
        'mean' => round($mean, 2), 'median' => $median, 'mode' => $mode,
        'std_dev' => round($std, 2), 'pass_rate' => round($pass, 2),
    ];
}
```

---

## SQL Requirements (Minimum)

**Query 1 — Top 10 Students (ORDER BY grade DESC)**

```sql
SELECT student_id, student_name, program, AVG(grade) AS avg_grade
FROM student_grades
GROUP BY student_id, student_name, program
ORDER BY avg_grade DESC
LIMIT 10;
```

**Query 2 — Bottom 10 Students (ORDER BY grade ASC)**

```sql
SELECT student_id, student_name, program, AVG(grade) AS avg_grade
FROM student_grades
GROUP BY student_id, student_name, program
ORDER BY avg_grade ASC
LIMIT 10;
```

**Query 3 — Average Grade per Program**

```sql
SELECT program, ROUND(AVG(grade), 2) AS avg_grade
FROM student_grades
GROUP BY program
ORDER BY avg_grade DESC;
```

**Query 4 — Grade Distribution**

```sql
SELECT CASE
         WHEN grade >= 90 THEN '90-100'
         WHEN grade >= 85 THEN '85-89'
         WHEN grade >= 80 THEN '80-84'
         WHEN grade >= 75 THEN '75-79'
         ELSE 'Below 75'
       END AS grade_range,
       COUNT(*) AS total
FROM student_grades
GROUP BY grade_range;
```

**Query 5 — Pass Rate**

```sql
SELECT ROUND(SUM(grade >= 75) / COUNT(*) * 100, 2) AS pass_rate
FROM student_grades;
```

**Query 6 — Average Grade per Subject**

```sql
SELECT subject, ROUND(AVG(grade), 2) AS avg_grade
FROM student_grades
GROUP BY subject
ORDER BY avg_grade ASC;
```

**Query 7 — Average Attendance per Program**

```sql
SELECT program, ROUND(AVG(attendance_rate), 2) AS avg_attendance
FROM student_grades
GROUP BY program;
```

**Query 8 — Standard Deviation**

```sql
SELECT ROUND(STDDEV_POP(grade), 2) AS std_dev FROM student_grades;
```

Laravel equivalent (Query Builder):

```php
public function topStudents(): Collection
{
    return StudentGrade::select('student_id', 'student_name', 'program')
        ->selectRaw('ROUND(AVG(grade),2) as avg_grade')
        ->groupBy('student_id', 'student_name', 'program')
        ->orderByDesc('avg_grade')
        ->limit(10)
        ->get();
}
```

---

## Required Enhancement (Option A): Academic Risk Prediction

Display students at risk based on grades (and attendance).

**Rule-based risk levels:**

| Level | Condition |
|---|---|
| High Risk | avg grade < 75 OR avg attendance < 75 |
| Medium Risk | avg grade 75–79 OR avg attendance 75–84 |
| Low Risk | otherwise |

```php
public function atRiskStudents(): Collection
{
    return StudentGrade::select('student_id', 'student_name', 'program')
        ->selectRaw('ROUND(AVG(grade),2) as avg_grade, ROUND(AVG(attendance_rate),2) as avg_att')
        ->groupBy('student_id', 'student_name', 'program')
        ->havingRaw('AVG(grade) < 80 OR AVG(attendance_rate) < 85')
        ->orderBy('avg_grade')
        ->get()
        ->map(function ($s) {
            $s->risk = ($s->avg_grade < 75 || $s->avg_att < 75) ? 'High' : 'Medium';
            return $s;
        });
}
```

Display as a table with color-coded badges (red = High, yellow = Medium).

---

## Setup Guide

```bash
composer create-project laravel/laravel student-analytics
cd student-analytics
composer require laravel/breeze --dev
php artisan breeze:install vue        # or react → Inertia stack
npm install chart.js vue-chartjs
```

`.env`:

```
DB_CONNECTION=mysql
DB_DATABASE=student_analytics
DB_USERNAME=root
DB_PASSWORD=
```

```bash
php artisan make:model StudentGrade -m
php artisan migrate
npm run dev
php artisan serve
```

---

## Appendix

Screenshots of the project:

- Screen 1 — Dashboard (KPI cards + charts)
- Screen 2 — CSV Import page
- Screen 3 — Top / Bottom 10 Students
- Screen 4 — At-Risk Students table
- Screen N — ...

---

# Portfolio Documentation

## Section 1: Project Background

- **What problem does the project solve?** Academic records in spreadsheets are hard to read, compare, and act on. The system turns raw CSV data into dashboards and insights.
- **Why is the project important?** It speeds up monitoring, helps detect struggling students early, and supports data-based decisions.

## Section 2: Beneficiaries

**Primary:** Students, Faculty Members
**Secondary:** Department Chairs, School Administrators

## Section 3: System Features

| Feature | Purpose | Benefit |
|---|---|---|
| CSV Import Module | Allows academic data to be uploaded into the system | Reduces manual encoding |
| Student Statistics | Provides instant academic summaries | Speeds up decision-making |
| Analytics Dashboard | Visualizes academic trends | Improves understanding of performance patterns |
| Academic Risk Prediction | Flags students at risk | Enables early intervention |

## Section 4: Community Impact

1. **How does the system help students?** Early detection of poor performance means students get support before failing.
2. **How does the system help teachers?** Instant class and subject statistics replace manual computation.
3. **How does the system improve academic quality?** Administrators can find weak subjects/programs and act on them using evidence.
4. **What future enhancements can be added?**
   - Machine-learning risk prediction (e.g., logistic regression)
   - Role-based login (admin, faculty, student)
   - PDF / Excel report export
   - Email alerts for at-risk students
   - Multi-semester trend comparison

---

# Defense Preparation (Q&A Notes)

1. **Why did you choose this dataset?** It has the minimum fields needed for grades, attendance, and program-level analysis, and it is realistic for school use. *(Explain whether yours is generated or from UCI.)*
2. **What database tables did you create?** `student_grades` (plus Laravel defaults: `users`, `migrations`, `sessions`).
3. **What SQL queries generate the dashboard?** Top/Bottom 10, average per program/subject, grade distribution (CASE WHEN), pass rate, standard deviation, attendance average.
4. **What statistical measures did you use?** Mean, median, mode, standard deviation, pass rate.
5. **What insights can administrators gain?** Which programs/subjects perform lowest, grade spread, attendance–grade relationship, number of at-risk students.
6. **How does the system support decision-making?** Visual summaries plus risk flags tell administrators where to focus tutoring and intervention.
7. **What enhancement did your group implement?** Option A — Academic Risk Prediction (rule-based on grade and attendance).
8. **How does this demonstrate System Integration and Architecture?** Integrates CSV input → Laravel backend → MySQL → SQL analytics → Inertia.js bridge → Vue/React + Chart.js frontend, with separated layers (routes, controllers, services, models, views).
9. **What are the limitations?** Rule-based risk (not true prediction), CSV format must match exactly, no authentication/roles yet, limited to uploaded data.
10. **What future improvements would you recommend?** ML-based prediction, role-based access, report export, real-time integration with the school's student information system.

---

# Deliverables Checklist

- [ ] CSV dataset (100+ records)
- [ ] `student_grades` migration + model
- [ ] CSV import (upload page + controller)
- [ ] 5+ KPI cards
- [ ] 5+ charts
- [ ] Descriptive statistics (mean, median, mode, std dev, pass rate)
- [ ] Minimum SQL queries (Top 10, Bottom 10, +more)
- [ ] Required enhancement (Option A: risk prediction)
- [ ] Screenshots in appendix
- [ ] Portfolio documentation (Sections 1–4)
- [ ] Answers to the 10 defense questions