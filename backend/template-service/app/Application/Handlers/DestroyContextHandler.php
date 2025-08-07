<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Domain\Repositories\ContextRepositoryInterface;
use App\Domain\Repositories\TagRepositoryInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final readonly class DestroyContextHandler
{
    public function __construct(
        private ContextRepositoryInterface $contextRepository,
        private TagRepositoryInterface $tagRepository,
    ) {
    }

    public function execute(string $id): bool
    {
        $context = $this->contextRepository->findOneById($id);

        if (! $context) {
            throw new NotFoundHttpException('Context ID not found');
        }

        $tags = $this->tagRepository->findAllUsingFilters([
            'contextId' => $id
        ]);

        foreach ($tags as $tag) {
            $this->tagRepository->delete($tag->id);
        }

        return $this->contextRepository->delete($context->id);
    }
}
