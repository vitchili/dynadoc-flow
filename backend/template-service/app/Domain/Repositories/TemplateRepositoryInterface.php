<?php
declare(strict_types = 1);

namespace App\Domain\Repositories;

use App\Domain\Entities\Template;
use Illuminate\Support\Collection;

interface TemplateRepositoryInterface
{
    public function exists(array $filters): bool;

    public function findAllUsingFilters(array $filters = []): Collection;

    public function findFirstUsingFilters(array $filters = []): ?Template;

    public function findOneById(string $id): ?Template;

    public function insert(Template $context): string;

    public function update(Template $context): bool;

    public function delete(string $id): bool;
}
