<?php

namespace App\Infrastructure\Http\Middlewares;

use App\Application\Services\JwtValidatorService;
use Closure;

class JwtAuthMiddleware
{
    public function handle($request, Closure $next)
    {
        $authHeader = $request->header('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json(['error' => 'Token ausente'], 401);
        }

        $token = str_replace('Bearer ', '', $authHeader);

        $claims = app(JwtValidatorService::class)->validate($token);

        if (!$claims) {
            return response()->json(['error' => 'Token inválido'], 401);
        }

        $claims['token'] = $token;

        $request->attributes->set('loggedUser', $claims);

        return $next($request);
    }
}
