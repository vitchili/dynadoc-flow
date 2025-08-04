<?php
declare(strict_types = 1);

namespace App\Domain\Repositories;

use App\Domain\Entities\Context;
use Illuminate\Support\Collection;

interface ContextRepositoryInterface
{
    public function exists(array $filters): bool;

    public function findAllUsingFilters(array $filters = []): Collection;

    public function findFirstUsingFilters(array $filters = []): ?Context;

    public function findOneById(string $id): ?Context;

    public function insert(Context $context): string;

    public function update(Context $context): bool;

    public function delete(string $id): bool;
}
