<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Application\DTOs\FindByFiltersContextInputDTO;
use App\Domain\Repositories\ContextRepositoryInterface;
use Illuminate\Support\Collection;

final readonly class FindByFiltersContextHandler
{
    public function __construct(
        private ContextRepositoryInterface $contextRepository
    ) {
    }

    public function execute(FindByFiltersContextInputDTO $input): Collection
    {
        return $this->contextRepository->findAllUsingFilters($input->toArray());
    }
}
