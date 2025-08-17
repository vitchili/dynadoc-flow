<?php

namespace App\Infrastructure\Http\Controllers;

use App\Application\DTOs\AuthInputDTO;
use App\Application\Handlers\StoreAuthHandler;
use App\Infrastructure\Http\Requests\StoreAuthRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends BaseController
{
    public function login(StoreAuthRequest $request, StoreAuthHandler $handler): JsonResponse
    {
        $output = $handler->execute(new AuthInputDTO(
            email: $request->validated('email'),
            password: $request->validated('password'),
        ));

        $cookie = cookie(
            name: 'token',
            value: $output->token,
            minutes: (int) env('JWT_TTL', 21000) / 60,
            path: '/',
            domain: null,
            secure: false,
            httpOnly: true,
            sameSite: 'Strict'
        );

        return $this->successResponse([
            'id' => $output->id,
            'name' => $output->name,
            'email' => $output->email,
        ])->cookie($cookie);
    }

    public function logout(): JsonResponse
    {
        return response()
        ->json(['message' => 'Logged out'])
        ->cookie('token', '', -1);
    }

}