<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Domain\Repositories\ContextRepositoryInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final readonly class DestroyContextHandler
{
    public function __construct(
        private ContextRepositoryInterface $contextRepository
    ) {
    }

    public function execute(string $id): bool
    {
        $context = $this->contextRepository->findOneById($id);

        if (! $context) {
            throw new NotFoundHttpException('Context ID not found');
        }

        return $this->contextRepository->delete($context->id);
    }
}
