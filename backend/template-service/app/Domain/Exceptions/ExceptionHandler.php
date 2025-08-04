<?php

declare(strict_types=1);

namespace App\Domain\Exceptions;

use Illuminate\Foundation\Exceptions\Handler;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ExceptionHandler extends Handler
{
    public function render($request, \Throwable $e): Response
    {
        // if ($e instanceof NotFoundHttpException || $e instanceof NotFoundException) {
        //     return response()->json([
        //         'message' => 'Operation Successfully',
        //         'description' => $e->getMessage(),
        //     ], Response::HTTP_NOT_FOUND);
        // }

        // if ($e instanceof ValidationException) {
        //     return response()->json([
        //         'message' => 'Invalid or not provided fields',
        //         'errors' => $e->errors(),
        //     ], Response::HTTP_UNPROCESSABLE_ENTITY);
        // }

        // if ($e instanceof BadRequestException) {
        //     return response()->json([
        //         'message' => 'Operation Failed',
        //         'description' => $e->getMessage(),
        //     ], Response::HTTP_BAD_REQUEST);
        // }

        // if ($e instanceof TenantIdNotProvidedException || $e instanceof InvalidTenantIdException) {
        //     return response()->json([
        //         'message' => 'Operation Failed',
        //         'description' => 'Invalid or missing Tenant Id',
        //     ], Response::HTTP_BAD_REQUEST);
        // }

        // if ($e instanceof UnauthenticatedException || $e instanceof InvalidCredentialsException) {
        //     return response()->json([
        //         'message' => 'Operation Failed',
        //         'description' => $e->getMessage(),
        //     ], Response::HTTP_UNAUTHORIZED);
        // }

        // if ($e instanceof ConflictException) {
        //     return response()->json([
        //         'message' => 'Operation Failed',
        //         'description' => $e->getMessage(),
        //     ], Response::HTTP_CONFLICT);
        // }

        return response()->json([
            'message' => 'Operation Failed',
            'description' => app()->environment(['local', 'testing']) ? $e->getMessage() : 'Internal Server Error',
        ], Response::HTTP_INTERNAL_SERVER_ERROR);
    }
}
