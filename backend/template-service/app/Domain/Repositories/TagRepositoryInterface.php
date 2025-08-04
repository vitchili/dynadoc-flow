<?php
declare(strict_types = 1);

namespace App\Domain\Repositories;

use App\Domain\Entities\Tag;
use Illuminate\Support\Collection;

interface TagRepositoryInterface
{
    public function exists(array $filters): bool;

    public function findAllUsingFilters(array $filters = []): Collection;

    public function findFirstUsingFilters(array $filters = []): ?Tag;

    public function findOneById(string $id): ?Tag;

    public function insert(Tag $context): string;

    public function update(Tag $context): bool;

    public function delete(string $id): bool;
}
