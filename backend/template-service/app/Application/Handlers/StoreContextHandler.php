<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Application\DTOs\StoreContextInputDTO;
use App\Domain\Entities\Context;
use App\Domain\Exceptions\DuplicatedEntityException;
use App\Domain\Repositories\ContextRepositoryInterface;

final readonly class StoreContextHandler
{
    public function __construct(
        private ContextRepositoryInterface $contextRepository
    ) {
    }

    public function execute(StoreContextInputDTO $input): string
    {
        $existingContext = $this->hasExistingContext($input);

        if ($existingContext) {
            throw new DuplicatedEntityException('There is already a context with these data');
        }

        return $this->insertContext($input);
    }

    private function hasExistingContext(StoreContextInputDTO $input): bool
    {
        return $this->contextRepository->exists([
            'name' => $input->name,
        ]);
    }

    private function insertContext(StoreContextInputDTO $input): string
    {
        return $this->contextRepository->insert(Context::create(
            name: $input->name,
            description: $input->description,
            companyId: $input->companyId,
        ));
    }
}
