<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Application\DTOs\StoreTagInputDTO;
use App\Domain\Entities\Tag;
use App\Domain\Exceptions\DuplicatedEntityException;
use App\Domain\Repositories\TagRepositoryInterface;

final readonly class StoreTagHandler
{
    public function __construct(
        private TagRepositoryInterface $tagRepository
    ) {
    }

    public function execute(StoreTagInputDTO $input): string
    {
        $tag = $this->hasExistingTag($input);

        if ($tag) {
            throw new DuplicatedEntityException('There is already a tag with these data');
        }

        return $this->insertTag($input);
    }

    private function hasExistingTag(StoreTagInputDTO $input): bool
    {
        return $this->tagRepository->exists([
            'name' => $input->name,
            'description' => $input->description,
            'contextId' => $input->contextId
        ]);
    }

    private function insertTag(StoreTagInputDTO $input): string
    {
        return $this->tagRepository->insert(Tag::create(
            name: $input->name,
            description: $input->description,
            type: $input->type,
            contextId: $input->contextId,
        ));
    }
}
