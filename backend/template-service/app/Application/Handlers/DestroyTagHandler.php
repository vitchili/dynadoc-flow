<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Domain\Repositories\TagRepositoryInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final readonly class DestroyTagHandler
{
    public function __construct(
        private TagRepositoryInterface $tagRepository
    ) {
    }

    public function execute(string $id): bool
    {
        $tag = $this->tagRepository->findOneById($id);

        if (! $tag) {
            throw new NotFoundHttpException('Tag not found');
        }

        return $this->tagRepository->delete($tag->id);
    }
}
