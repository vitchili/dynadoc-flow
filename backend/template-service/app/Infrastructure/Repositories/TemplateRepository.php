<?php

declare(strict_types = 1);

namespace App\Infrastructure\Repositories;

use App\Domain\Entities\Template;
use App\Domain\Repositories\TemplateRepositoryInterface;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class TemplateRepository implements TemplateRepositoryInterface
{
    public function exists(array $filters): bool
    {
        return DB::table('templates')
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
        $query = DB::table('templates')
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

    public function findFirstUsingFilters(array $filters = []): ?Template
    {
        $template = DB::table('templates')
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

        if (! $template) {
            return null;
        }

        return Template::restore(
            id: $template->id,
            name: $template->name,
            description: $template->description,
            companyId: $template->company_id
        );
    }

    public function findOneById(string $id): ?Template
    {
        $template = DB::table('templates')
            ->select([
                'id',
                'name',
                'description',
                'company_id',
            ])
            ->where('id', '=', $id)
            ->first();

        if (! $template) {
            return null;
        }

        return Template::restore(
            id: $template->id,
            name: $template->name,
            description: $template->description,
            companyId: $template->company_id
        );
    }

    public function insert(Template $template): string
    {
        DB::table("templates")
            ->insert([
                'id' => $template->id,
                'name' => $template->name,
                'description' => $template->description,
                'company_id' => $template->companyId
            ]);

        return $template->id;
    }

    public function update(Template $template): bool
    {
        $template = DB::table('templates')
            ->where('id', '=', $template->id)
            ->update([
                'name' => $template->name, 
                'description' => $template->description, 
                'company_id' => $template->companyId

            ]);

        return (bool) $template;
    }

    public function delete(string $id): bool
    {
        return (bool) DB::table('templates')->where('id', $id)->delete();
    }
}
