<?php

namespace App\Infrastructure\Http\Middlewares;

use App\Application\Services\JwtValidatorService;
use Closure;

class JwtAuthMiddleware
{
    public function handle($request, Closure $next)
    {
        $authHeader = $request->header('Authorization');
        $token = null;

        if ($authHeader && str_starts_with($authHeader, 'Bearer ')) {
            $token = str_replace('Bearer ', '', $authHeader);
        }

        if (!$token) {
            $token = $request->cookie('token');
        }

        if (!$token) {
            return response()->json(['error' => 'Token ausente'], 401);
        }

        $claims = app(JwtValidatorService::class)->validate($token);

        if (!$claims) {
            return response()->json(['error' => 'Token inválido'], 401);
        }

        $request->attributes->set('loggedUser', $claims);

        return $next($request);
    }
}
