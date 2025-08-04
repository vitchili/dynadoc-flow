<?php

declare(strict_types = 1);

namespace App\Infrastructure\Repositories;

use App\Domain\Entities\Context;
use App\Domain\Repositories\ContextRepositoryInterface;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ContextRepository implements ContextRepositoryInterface
{
    public function __construct(private ConnectionInterface $db) {
    }

    public function exists(array $filters): bool
    {
        return DB::table('contexts')
            ->select([
                'id',
                'name',
                'description',
                'company_id',
            ])
            ->when(! empty($filters['id']), function (Builder $query) use ($filters) {
                $query->where('id', '=', $filters['id']);
            })
            ->when(! empty($filters['name']), function (Builder $query) use ($filters) {
                $query->where('name', '=', $filters['name']);
            })
            ->when(! empty($filters['description']), function (Builder $query) use ($filters) {
                $query->where('description', '=', $filters['description']);
            })
            ->when(! empty($filters['companyId']), function (Builder $query) use ($filters) {
                $query->where('company_id', '=', $filters['companyId']);
            })
            ->exists();
    }

    public function findAllUsingFilters(array $filters = []): Collection
    {
        $query = DB::table('contexts')
            ->select([
                'id',
                'name',
                'description',
                'company_id',
            ])
            ->when(! empty($filters['id']), function (Builder $query) use ($filters) {
                $query->where('id', '=', $filters['id']);
            })
            ->when(! empty($filters['name']), function (Builder $query) use ($filters) {
                $query->where('name', '=', $filters['name']);
            })
            ->when(! empty($filters['description']), function (Builder $query) use ($filters) {
                $query->where('description', '=', $filters['description']);
            })
            ->when(! empty($filters['companyId']), function (Builder $query) use ($filters) {
                $query->where('company_id', '=', $filters['companyId']);
            })
            ->get();

        return $query;
    }

    public function findFirstUsingFilters(array $filters = []): ?Context
    {
        $context = DB::table('contexts')
            ->select([
                'id',
                'name',
                'description',
                'company_id',
            ])
            ->when(! empty($filters['id']), function (Builder $query) use ($filters) {
                $query->where('id', '=', $filters['id']);
            })
            ->when(! empty($filters['name']), function (Builder $query) use ($filters) {
                $query->where('name', '=', $filters['name']);
            })
            ->when(! empty($filters['description']), function (Builder $query) use ($filters) {
                $query->where('description', '=', $filters['description']);
            })
            ->when(! empty($filters['companyId']), function (Builder $query) use ($filters) {
                $query->where('company_id', '=', $filters['companyId']);
            })
            ->first();

        if (! $context) {
            return null;
        }

        return Context::restore(
            $context->id,
            $context->name,
            $context->description,
            $context->companyId
        );
    }
    public function findOneById(string $id): ?Context
    {
        $context = DB::table('contexts')
            ->select([
                'id',
                'name',
                'description',
                'company_id',
            ])
            ->where('id', '=', $id)
            ->first();

        if (! $context) {
            return null;
        }

        return Context::restore(
            id: $context->id,
            name: $context->name,
            description: $context->description,
            companyId: $context->company_id
        );
    }

    public function insert(Context $context): string
    {
        $inserted = DB::table("contexts")
            ->insert([
                'id' => $context->id,
                'name' => $context->name,
                'description' => $context->description,
                'company_id' => $context->companyId
            ]);

        if (! $inserted) {
            throw new \RuntimeException('Erro ao persistir o contexto.');
        }

        return $context->id;
    }

    public function update(Context $context): bool
    {
        $context = DB::table('contexts')
            ->where('id', '=', $context->id)
            ->update([
                'name' => $context->name, 
                'description' => $context->description, 
                'company_id' => $context->companyId
            ]);

        return (bool) $context;
    }

    public function delete(string $id): bool
    {
        return (bool) DB::table('contexts')->where('id', $id)->delete();
    }
}
