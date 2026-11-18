<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Main analytics dashboard (placeholder for now).
     */
    public function index(): Response
    {
        return Inertia::render('Dashboard');
    }
}
