<?php

namespace App\Infrastructure\Http\Controllers;

use App\Application\Handlers\DestroySectionHandler;
use App\Application\Handlers\FindByFiltersSectionHandler;
use App\Application\Handlers\StoreSectionHandler;
use App\Application\Handlers\UpdateSectionHandler;
use App\Application\DTOs\FindByFiltersSectionInputDTO;
use App\Application\DTOs\StoreSectionInputDTO;
use App\Application\DTOs\UpdateSectionInputDTO;
use App\Infrastructure\Http\Requests\FindByFiltersSectionRequest;
use App\Infrastructure\Http\Requests\StoreSectionRequest;
use App\Infrastructure\Http\Requests\UpdateSectionRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class SectionController extends BaseController
{
    public function findByFilters(FindByFiltersSectionRequest $request, FindByFiltersSectionHandler $handler): JsonResponse
    {
        $output = $handler->execute(new FindByFiltersSectionInputDTO(
            id: $request->validated('id'),
            name: $request->validated('name'),
            description: $request->validated('description'),
            templateId: $request->validated('templateId'),
        ));

        return $this->successResponse($output);
    }

    public function store(StoreSectionRequest $request, StoreSectionHandler $handler): JsonResponse
    {
        $output = $handler->execute(new StoreSectionInputDTO(
            name: $request->validated('name'),
            description: $request->validated('description'),
            templateId: $request->validated('templateId'),
            htmlContent: $request->validated('htmlContent'),
        ));

        return $this->successResponse($output, Response::HTTP_CREATED);
    }

    public function update(string $id, UpdateSectionRequest $request, UpdateSectionHandler $handler): JsonResponse
    {
        $output = $handler->execute(
            $id,
            new UpdateSectionInputDTO(
                name: $request->validated('name'),
                description: $request->validated('description'),
                htmlContent: $request->validated('htmlContent'),
                sectionOrder: $request->validated('sectionOrder')
            ));

        return $this->successResponse($output);
    }

    public function destroy(string $id, DestroySectionHandler $handler): JsonResponse
    {
        return $this->successResponse($handler->execute($id));
    }
}