<?php

declare(strict_types=1);

namespace App\Infrastructure\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Symfony\Component\HttpFoundation\Response;

class BaseController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    public function successResponse(mixed $data, int $statusCode = Response::HTTP_OK): JsonResponse
    {
        return response()->json([
            'message' => 'Success',
            'data' => $data,
        ], $statusCode);
    }
}
