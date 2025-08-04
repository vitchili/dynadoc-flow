<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Application\DTOs\FindByFiltersContextInputDTO;
use App\Domain\Entities\Context;
use App\Domain\Repositories\ContextRepositoryInterface;

final readonly class FindByFiltersContextHandler
{
    public function __construct(
        private ContextRepositoryInterface $contextRepository
    ) {
    }

    public function execute(FindByFiltersContextInputDTO $input): array
    {
        $contextData = $this->contextRepository->findAllUsingFilters($input->toArray());

        $outputDTO = [];

        foreach ($contextData as $context) {
            $outputDTO[] = Context::restore(
                $context->id,
                $context->name,
                $context->description,
                $context->company_id
            );
        }

        return $outputDTO;
    }
}
