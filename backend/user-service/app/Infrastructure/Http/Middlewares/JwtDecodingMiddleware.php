<?php

namespace App\Infrastructure\Http\Middlewares;

use App\Application\Services\JwtDecoderService;
use Closure;

class JwtDecodingMiddleware
{
    public function handle($request, Closure $next)
    {
        $token = $request->cookie('token');

        if (!$token) {
            return response()->json(['error' => 'Token ausente'], 401);
        }

        $claims = app(JwtDecoderService::class)->decode($token);

        $request->attributes->set('loggedUser', $claims);

        return $next($request);
    }
}
