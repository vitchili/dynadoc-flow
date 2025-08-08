<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Domain\Repositories\FileRepositoryInterface;
use App\Domain\Services\FileStorageService;
use App\Domain\Entities\File;
use Exception;

final readonly class DownloadFileHandler
{
    public function __construct(
        private FileRepositoryInterface $fileRepository,
        private FileStorageService $fileStorageService
    ) {
    }

    public function execute(string $fileId): object
    {
        $file = $this->fileRepository->findAllUsingFilters([
            'id' => $fileId
        ])[0];

        if (!$file instanceof File) {
            throw new Exception("Arquivo com ID {$fileId} não encontrado.");
        }

        if (empty($file->path)) {
            throw new Exception("Arquivo com ID {$fileId} não possui caminho definido.");
        }

        $fileContent = $this->fileStorageService->download($file->path);

        return (object)[
            'name' => $file->name,
            'content' => $fileContent,
        ];
    }
}
