<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Application\DTOs\UpdateTagInputDTO;
use App\Domain\Entities\Tag;
use App\Domain\Repositories\TagRepositoryInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final readonly class UpdateTagHandler
{
    public function __construct(
        private TagRepositoryInterface $tagRepository
    ) {
    }

    public function execute(string $id, UpdateTagInputDTO $input): bool
    {
        $tag = $this->tagRepository->findOneById($id);

        if (! $tag) {
            throw new NotFoundHttpException('Tag not found');
        }

        return $this->updateTag($input, $tag);
    }

    private function updateTag(UpdateTagInputDTO $input, Tag $tag): bool
    {
        $updatedTag = $tag->update(
            name: ! empty($input->name) ? $input->name : $tag->name,
            description: ! empty($input->description) ? $input->description : $tag->description,
            type: ! empty($input->type) ? $input->type : $tag->type,
            contextId: ! empty($input->contextId) ? $input->contextId : $tag->contextId,
        );

        return $this->tagRepository->update($updatedTag);
    }
}
