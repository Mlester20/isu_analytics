<?php

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Spatie\Permission\Exceptions\UnauthorizedException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Spatie role/permission middleware aliases, e.g. ->middleware('role:admin')
        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Render a proper Inertia 403 page instead of the default Blade error view.
        // Covers both Spatie's UnauthorizedException (thrown by role/permission
        // middleware) and gate denials (AuthorizationException).
        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $e instanceof UnauthorizedException && ! $e instanceof AuthorizationException) {
                return null; // let Laravel handle everything else
            }

            if ($request->inertia()) {
                // Inertia XHR visit: JSON + X-Inertia header, client renders the page.
                return inertia('Errors/403')->toResponse($request);
            }

            // Full-page visit (or tests): keep the real 403 status code.
            return inertia('Errors/403')->toResponse($request)->setStatusCode(403);
        });
    })->create();
