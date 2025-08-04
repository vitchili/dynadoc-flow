<?php

namespace App\Infrastructure\Http\Controllers;

use App\Application\Handlers\DestroyTagHandler;
use App\Application\Handlers\FindByFiltersTagHandler;
use App\Application\Handlers\StoreTagHandler;
use App\Application\Handlers\UpdateTagHandler;
use App\Application\DTOs\FindByFiltersTagInputDTO;
use App\Application\DTOs\StoreTagInputDTO;
use App\Application\DTOs\UpdateTagInputDTO;
use App\Domain\Enums\TagTypeEnum;
use App\Infrastructure\Http\Requests\FindByFiltersTagRequest;
use App\Infrastructure\Http\Requests\StoreTagRequest;
use App\Infrastructure\Http\Requests\UpdateTagRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class TagController extends BaseController
{
    public function findByFilters(FindByFiltersTagRequest $request, FindByFiltersTagHandler $handler): JsonResponse
    {
        $output = $handler->execute(new FindByFiltersTagInputDTO(
            id: $request->validated('id'),
            name: $request->validated('name'),
            description: $request->validated('description'),
            type: TagTypeEnum::tryFrom($request->validated('type')),
            contextId: $request->validated('contextId')
        ));

        return $this->successResponse($output);
    }

    public function store(StoreTagRequest $request, StoreTagHandler $handler): JsonResponse
    {
        $output = $handler->execute(new StoreTagInputDTO(
            name: $request->validated('name'),
            description: $request->validated('description'),
            type: TagTypeEnum::tryFrom($request->validated('type')),
            contextId: $request->validated('contextId'),
        ));

        return $this->successResponse($output, Response::HTTP_CREATED);
    }

    public function update(string $id, UpdateTagRequest $request, UpdateTagHandler $handler): JsonResponse
    {
        $output = $handler->execute(
            $id,
            new UpdateTagInputDTO(
                name: $request->validated('name'),
                description: $request->validated('description'),
                type: TagTypeEnum::tryFrom($request->validated('type')),
                contextId: $request->validated('contextId')
            ));

        return $this->successResponse($output);
    }

    public function destroy(string $id, DestroyTagHandler $handler): JsonResponse
    {
        return $this->successResponse($handler->execute($id));
    }
}