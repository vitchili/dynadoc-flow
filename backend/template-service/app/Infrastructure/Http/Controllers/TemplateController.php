<?php

namespace App\Infrastructure\Http\Controllers;

use App\Application\Handlers\DestroyTemplateHandler;
use App\Application\Handlers\FindByFiltersTemplateHandler;
use App\Application\Handlers\StoreTemplateHandler;
use App\Application\Handlers\UpdateTemplateHandler;
use App\Application\DTOs\FindByFiltersTemplateInputDTO;
use App\Application\DTOs\StoreTemplateInputDTO;
use App\Application\DTOs\UpdateTemplateInputDTO;
use App\Infrastructure\Helpers\LoggedUserHelper;
use App\Infrastructure\Http\Requests\FindByFiltersTemplateRequest;
use App\Infrastructure\Http\Requests\StoreTemplateRequest;
use App\Infrastructure\Http\Requests\UpdateTemplateRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class TemplateController extends BaseController
{
    public function findByFilters(FindByFiltersTemplateRequest $request, FindByFiltersTemplateHandler $handler): JsonResponse
    {
        $output = $handler->execute(new FindByFiltersTemplateInputDTO(
            id: $request->validated('id'),
            name: $request->validated('name'),
            description: $request->validated('description'),
            companyId: app(LoggedUserHelper::class)->companyId()
        ));

        return $this->successResponse($output);
    }

    public function store(StoreTemplateRequest $request, StoreTemplateHandler $handler): JsonResponse
    {
        $output = $handler->execute(new StoreTemplateInputDTO(
            name: $request->validated('name'),
            description: $request->validated('description'),
            companyId: app(LoggedUserHelper::class)->companyId()
        ));

        return $this->successResponse($output, Response::HTTP_CREATED);
    }

    public function update(string $id, UpdateTemplateRequest $request, UpdateTemplateHandler $handler): JsonResponse
    {
        $output = $handler->execute(
            $id,
            new UpdateTemplateInputDTO(
                name: $request->validated('name'),
                description: $request->validated('description'),
            ));

        return $this->successResponse($output);
    }

    public function destroy(string $id, DestroyTemplateHandler $handler): JsonResponse
    {
        return $this->successResponse($handler->execute($id));
    }
}