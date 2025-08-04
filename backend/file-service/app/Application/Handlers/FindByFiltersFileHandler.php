<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Application\DTOs\FindByFiltersFileInputDTO;
use App\Domain\Repositories\FileRepositoryInterface;
use Illuminate\Support\Collection;

final readonly class FindByFiltersFileHandler
{
    public function __construct(
        private FileRepositoryInterface $fileRepository
    ) {
    }

    public function execute(FindByFiltersFileInputDTO $input): Collection
    {
        return $this->fileRepository->findAllUsingFilters($input->toArray());
    }
}
