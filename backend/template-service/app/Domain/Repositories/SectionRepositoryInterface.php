<?php
declare(strict_types = 1);

namespace App\Domain\Repositories;

use App\Domain\Entities\Section;
use Illuminate\Support\Collection;

interface SectionRepositoryInterface
{
    public function exists(array $filters): bool;

    public function findAllUsingFilters(array $filters = []): Collection;

    public function findFirstUsingFilters(array $filters = []): ?Section;

    public function findOneById(string $id): ?Section;

    public function insert(Section $context): string;

    public function update(Section $context): bool;

    public function delete(string $id): bool;
}
