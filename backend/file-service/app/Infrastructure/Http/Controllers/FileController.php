<?php

namespace App\Infrastructure\Http\Controllers;

use App\Application\Handlers\DestroyFileHandler;
use App\Application\Handlers\FindByFiltersFileHandler;
use App\Application\Handlers\StoreFileHandler;
use App\Application\DTOs\FindByFiltersFileInputDTO;
use App\Application\DTOs\StoreFileInputDTO;
use App\Application\Handlers\DownloadFileHandler;
use App\Infrastructure\Http\Requests\FindByFiltersFileRequest;
use App\Infrastructure\Http\Requests\StoreFileRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class FileController extends BaseController
{
    public function findByFilters(FindByFiltersFileRequest $request, FindByFiltersFileHandler $handler): JsonResponse
    {
        $output = $handler->execute(new FindByFiltersFileInputDTO(
            id: $request->validated('id'),
            name: $request->validated('name'),
            templateId: $request->validated('templateId'),
            userId: $request->validated('userId'),
            path: $request->validated('path'),
            readyToDownload: $request->validated('readyToDownload'),
            status: $request->validated('status'),
            errors: null
        ));

        return $this->successResponse($output);
    }

    public function asyncGenerate(StoreFileRequest $request, StoreFileHandler $handler): JsonResponse
    {
        $output = $handler->execute(new StoreFileInputDTO(
            templateId: $request->validated('templateId'),
            name: $request->validated('name'),
            payload: $request->validated('payload')
        ));

        return $this->successResponse($output);
    }

    public function destroy(string $fileId, DestroyFileHandler $handler): JsonResponse
    {
        return $this->successResponse($handler->execute($fileId));
    }

    public function download(string $id, DownloadFileHandler $handler)
    {
        $file = $handler->execute($id);

        return response($file->content, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $file->name . '"',
        ]);
    }
}