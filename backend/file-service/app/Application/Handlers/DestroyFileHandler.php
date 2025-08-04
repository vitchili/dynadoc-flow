<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Domain\Repositories\FileRepositoryInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final readonly class DestroyFileHandler
{
    public function __construct(
        private FileRepositoryInterface $fileRepository
    ) {
    }

    public function execute(string $fileId): bool
    {
        $file = $this->fileRepository->findOneById($fileId);

        if (! $file) {
            throw new NotFoundHttpException('File not found');
        }

        return $this->fileRepository->delete($fileId);
    }
}
