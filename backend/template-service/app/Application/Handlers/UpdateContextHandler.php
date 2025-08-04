<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Application\DTOs\UpdateContextInputDTO;
use App\Domain\Entities\Context;
use App\Domain\Repositories\ContextRepositoryInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final readonly class UpdateContextHandler
{
    public function __construct(
        private ContextRepositoryInterface $contextRepository
    ) {
    }

    public function execute(string $id, UpdateContextInputDTO $input): bool
    {
        $context = $this->contextRepository->findOneById($id);

        if (! $context) {
            throw new NotFoundHttpException('Context ID not found');
        }

        return $this->updateContext($input, $context);
    }

    private function updateContext(UpdateContextInputDTO $input, Context $context): bool
    {
        $updatedContext = $context->update(
            name: $input->name ?? $context->name,
            description: $input->description ?? $context->description
        );

        return $this->contextRepository->update($updatedContext);
    }
}
