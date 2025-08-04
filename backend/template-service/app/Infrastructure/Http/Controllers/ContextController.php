<?php

namespace App\Infrastructure\Http\Controllers;

use App\Application\Handlers\DestroyContextHandler;
use App\Application\Handlers\FindByFiltersContextHandler;
use App\Application\Handlers\StoreContextHandler;
use App\Application\Handlers\UpdateContextHandler;
use App\Application\DTOs\FindByFiltersContextInputDTO;
use App\Application\DTOs\StoreContextInputDTO;
use App\Application\DTOs\UpdateContextInputDTO;
use App\Infrastructure\Helpers\LoggedUserHelper;
use App\Infrastructure\Http\Requests\FindByFiltersContextRequest;
use App\Infrastructure\Http\Requests\StoreContextRequest;
use App\Infrastructure\Http\Requests\UpdateContextRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class ContextController extends BaseController
{
    public function findByFilters(FindByFiltersContextRequest $request, FindByFiltersContextHandler $handler): JsonResponse
    {
        $output = $handler->execute(new FindByFiltersContextInputDTO(
            id: $request->validated('id'),
            name: $request->validated('name'),
            description: $request->validated('description'),
            companyId: app(LoggedUserHelper::class)->companyId()
        ));

        return $this->successResponse($output);
    }

    public function store(StoreContextRequest $request, StoreContextHandler $handler): JsonResponse
    {
        $output = $handler->execute(new StoreContextInputDTO(
            name: $request->validated('name'),
            description: $request->validated('description'),
            companyId: app(LoggedUserHelper::class)->companyId()
        ));

        return $this->successResponse($output, Response::HTTP_CREATED);
    }

    public function update(string $id, UpdateContextRequest $request, UpdateContextHandler $handler): JsonResponse
    {
        $output = $handler->execute(
            $id,
            new UpdateContextInputDTO(
                name: $request->validated('name'),
                description: $request->validated('description'),
            ));

        return $this->successResponse($output);
    }

    public function destroy(string $id, DestroyContextHandler $handler): JsonResponse
    {
        return $this->successResponse($handler->execute($id));
    }
}