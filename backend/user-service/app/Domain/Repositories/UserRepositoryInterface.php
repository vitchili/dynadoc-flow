<?php
declare(strict_types = 1);

namespace App\Domain\Repositories;

use App\Domain\Entities\User;
use Illuminate\Support\Collection;

interface UserRepositoryInterface
{
    public function exists(string $email): bool;

    public function findAllUsingFilters(array $filters = []): Collection;

    public function findFirstUsingFilters(array $filters = []): ?User;

    public function insert(User $user): string;

    public function update(User $user): bool;
}
