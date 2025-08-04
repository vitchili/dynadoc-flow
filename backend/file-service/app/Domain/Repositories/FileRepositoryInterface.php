<?php
declare(strict_types = 1);

namespace App\Domain\Repositories;

use App\Domain\Entities\File;
use Illuminate\Support\Collection;

interface FileRepositoryInterface
{
    public function exists(array $filters): bool;

    public function findAllUsingFilters(array $filters = []): Collection;

    public function findFirstUsingFilters(array $filters = []): ?File;

    public function findOneById(string $id): ?File;

    public function insert(File $context): string;

    public function update(File $context): bool;

    public function delete(string $id): bool;
}
