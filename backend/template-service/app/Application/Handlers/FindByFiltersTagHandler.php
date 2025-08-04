<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Application\DTOs\FindByFiltersTagInputDTO;
use App\Domain\Entities\Tag;
use App\Domain\Enums\TagTypeEnum;
use App\Domain\Repositories\TagRepositoryInterface;

final readonly class FindByFiltersTagHandler
{
    public function __construct(
        private TagRepositoryInterface $tagRepository
    ) {
    }

    public function execute(FindByFiltersTagInputDTO $input): array
    {
        $tagData = $this->tagRepository->findAllUsingFilters($input->toArray());

        $outputDTO = [];

        foreach ($tagData as $tag) {
            $outputDTO[] = Tag::restore(
                id: $tag->id,
                name: $tag->name,
                description: $tag->description,
                type: TagTypeEnum::from($tag->type),
                contextId: $tag->context_id
            );
        }

        return $outputDTO;
    }
}
