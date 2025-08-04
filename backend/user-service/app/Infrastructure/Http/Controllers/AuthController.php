<?php

namespace App\Infrastructure\Http\Controllers;

use App\Application\DTOs\AuthInputDTO;
use App\Application\Handlers\StoreAuthHandler;
use App\Infrastructure\Http\Requests\StoreAuthRequest;
use Illuminate\Http\JsonResponse;

class AuthController extends BaseController
{
    public function login(StoreAuthRequest $request, StoreAuthHandler $handler): JsonResponse
    {
        $output = $handler->execute(new AuthInputDTO(
            email: $request->validated('email'),
            password: $request->validated('password'),
        ));

        return $this->successResponse($output);
    }
}