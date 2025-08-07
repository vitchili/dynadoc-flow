<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Application\DTOs\FindByFiltersTagInputDTO;
use App\Domain\Repositories\ContextRepositoryInterface;
use App\Domain\Repositories\TagRepositoryInterface;
use Illuminate\Support\Collection;

final readonly class FindByFiltersTagHandler
{
    public function __construct(
        private TagRepositoryInterface $tagRepository,
        private ContextRepositoryInterface $contextRepository,
    ) {
    }

    public function execute(FindByFiltersTagInputDTO $input): Collection
    {
        return $this->tagRepository->findAllUsingFilters($input->toArray());
    }
}
