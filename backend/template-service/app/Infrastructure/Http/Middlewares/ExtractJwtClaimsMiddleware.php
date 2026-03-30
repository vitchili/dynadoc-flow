<?php

declare(strict_types=1);

namespace App\Infrastructure\Http\Middlewares;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ExtractJwtClaimsMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $this->extractToken($request);

        if (!$token) {
            return response()->json(['error' => 'Missing token'], 401);
        }

        $payload = $this->decodePayload($token);

        if (!$payload) {
            return response()->json(['error' => 'Malformed token'], 401);
        }

        $request->attributes->set('loggedUser', $payload);

        return $next($request);
    }

    private function extractToken(Request $request): ?string
    {
        return $request->cookie('token') ?? $request->bearerToken();
    }

    private function decodePayload(string $token): ?array
    {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return null;
        }

        $payload = json_decode(
            base64_decode(strtr($parts[1], '-_', '+/')),
            true
        );

        return is_array($payload) ? $payload : null;
    }
}