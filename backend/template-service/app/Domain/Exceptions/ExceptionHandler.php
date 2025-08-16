<?php

declare(strict_types=1);

namespace App\Domain\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ExceptionHandler extends Handler
{
    public function render($request, \Throwable $e): Response
    {
        if ($e instanceof AuthenticationException) {
            return response()->json([
                'message' => 'Operation Failed',
                'errors' => $e->getMessage(),
            ], Response::HTTP_UNAUTHORIZED);
        }

        if ($e instanceof ValidationException) {
            return response()->json([
                'message' => 'Invalid or not provided fields',
                'errors' => $e->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($e instanceof NotFoundHttpException || $e instanceof NotFoundHttpException) {
            return response()->json([
                'message' => 'Operation Successfully',
                'description' => $e->getMessage(),
            ], Response::HTTP_NOT_FOUND);
        }

        if ($e instanceof BadRequestException) {
            return response()->json([
                'message' => 'Operation Failed',
                'description' => $e->getMessage(),
            ], Response::HTTP_BAD_REQUEST);
        }

        if ($e instanceof AuthenticationException) {
            return response()->json([
                'message' => 'Operation Failed',
                'description' => $e->getMessage(),
            ], Response::HTTP_UNAUTHORIZED);
        }

        return response()->json([
            'message' => 'Operation Failed',
            'description' => app()->environment(['local', 'testing']) ? $e->getMessage() : 'Internal Server Error',
        ], Response::HTTP_INTERNAL_SERVER_ERROR);
    }
}
