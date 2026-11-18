<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

/**
 * Simple placeholder pages for features that come later
 * (CSV import, risk analytics, student grades).
 */
class PlaceholderController extends Controller
{
    public function import(): Response
    {
        return Inertia::render('Import/Index');
    }

    public function risk(): Response
    {
        return Inertia::render('Risk/Index');
    }

    public function myGrades(): Response
    {
        return Inertia::render('Grades/MyGrades');
    }
}
