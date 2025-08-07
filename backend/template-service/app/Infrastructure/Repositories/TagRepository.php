<?php

declare(strict_types = 1);

namespace App\Infrastructure\Repositories;

use App\Domain\Entities\Context;
use App\Domain\Entities\Tag;
use App\Domain\Enums\TagTypeEnum;
use App\Domain\Repositories\TagRepositoryInterface;
use App\Infrastructure\Helpers\LoggedUserHelper;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class TagRepository implements TagRepositoryInterface
{
    public function exists(array $filters): bool
    {
        return DB::table('tags')
            ->select([
                'tags.id',
                'tags.name',
                'tags.description',
                'tags.type',
                'tags.context_id',
            ])
            ->join('contexts', 'tags.context_id', '=', 'contexts.id')
            ->where('contexts.company_id', app(LoggedUserHelper::class)->companyId())
            ->when(! empty($filters['id']), function (Builder $query) use ($filters) {
                $query->where('tags.id', '=', $filters['id']);
            })
            ->when(! empty($filters['name']), function (Builder $query) use ($filters) {
                $query->where('tags.name', '=', $filters['name']);
            })
            ->when(! empty($filters['description']), function (Builder $query) use ($filters) {
                $query->where('tags.description', '=', $filters['description']);
            })
            ->when(! empty($filters['type']), function (Builder $query) use ($filters) {
                $query->where('tags.type', '=', $filters['type']);
            })
            ->when(! empty($filters['contextId']), function (Builder $query) use ($filters) {
                $query->where('tags.context_id', '=', $filters['contextId']);
            })
            ->exists();
    }

    public function findAllUsingFilters(array $filters = []): Collection
    {
        $query = DB::table('tags')
            ->select([
                'contexts.id as contextId',
                'contexts.name as contextName',
                'contexts.description as contextDescription',
                'contexts.company_id as contextCompanyId',
                'tags.id as tagId',
                'tags.name as tagName',
                'tags.description as tagDescription',
                'tags.type as tagType',
            ])
            ->join('contexts', 'tags.context_id', '=', 'contexts.id')
            ->where('contexts.company_id', app(LoggedUserHelper::class)->companyId())
            ->when(! empty($filters['id']), function (Builder $query) use ($filters) {
                $query->where('tags.id', '=', $filters['id']);
            })
            ->when(! empty($filters['name']), function (Builder $query) use ($filters) {
                $query->where('tags.name', '=', $filters['name']);
            })
            ->when(! empty($filters['description']), function (Builder $query) use ($filters) {
                $query->where('tags.description', '=', $filters['description']);
            })
            ->when(! empty($filters['type']), function (Builder $query) use ($filters) {
                $query->where('tags.type', '=', $filters['type']);
            })
            ->when(! empty($filters['contextId']), function (Builder $query) use ($filters) {
                $query->where('tags.context_id', '=', $filters['contextId']);
            })
            ->get();

        $outputDTO = [];

        foreach ($query as $contextTags) {
            $tag = Tag::restore(
                id: $contextTags->tagId,
                name: $contextTags->tagName,
                description: $contextTags->tagDescription,
                type: TagTypeEnum::from($contextTags->tagType),
                contextId: $contextTags->contextId
            )->toArray();
            
            $tag['typeName'] = TagTypeEnum::from($contextTags->tagType)->label();
            $tag['context'] = [
                'id' => $contextTags->contextId,
                'name' => $contextTags->contextName,
                'description' => $contextTags->contextDescription,
                'companyId' => $contextTags->contextCompanyId,
            ];

            $outputDTO[] = $tag;
        }

        return collect($outputDTO);
    }

    public function findFirstUsingFilters(array $filters = []): ?Tag
    {
        $tag = DB::table('tags')
            ->select([
                'tags.id',
                'tags.name',
                'tags.description',
                'tags.type',
                'tags.context_id',
            ])
            ->join('contexts', 'tags.context_id', '=', 'contexts.id')
            ->where('contexts.company_id', app(LoggedUserHelper::class)->companyId())
            ->when(! empty($filters['id']), function (Builder $query) use ($filters) {
                $query->where('tags.id', '=', $filters['id']);
            })
            ->when(! empty($filters['name']), function (Builder $query) use ($filters) {
                $query->where('tags.name', '=', $filters['name']);
            })
            ->when(! empty($filters['description']), function (Builder $query) use ($filters) {
                $query->where('tags.description', '=', $filters['description']);
            })
            ->when(! empty($filters['type']), function (Builder $query) use ($filters) {
                $query->where('tags.type', '=', $filters['type']);
            })
            ->when(! empty($filters['contextId']), function (Builder $query) use ($filters) {
                $query->where('tags.context_id', '=', $filters['contextId']);
            })
            ->first();

        if (! $tag) {
            return null;
        }

        return Tag::restore(
            id: $tag->id,
            name: $tag->name,
            description: $tag->description,
            type: TagTypeEnum::from($tag->type),
            contextId: $tag->context_id
        );
    }

    public function findOneById(string $id): ?Tag
    {
        $tag = DB::table('tags')
            ->select([
                'id',
                'name',
                'description',
                'type',
                'context_id',
            ])
            ->where('id', '=', $id)
            ->first();

        if (! $tag) {
            return null;
        }

        return Tag::restore(
            id: $tag->id,
            name: $tag->name,
            description: $tag->description,
            type: TagTypeEnum::from($tag->type),
            contextId: $tag->context_id
        );
    }

     public function insert(Tag $tag): string
    {
        DB::table("tags")
            ->insert([
                'id' => $tag->id,
                'name' => $tag->name,
                'description' => $tag->description,
                'type' => $tag->type->value,
                'context_id' => $tag->contextId
            ]);

        return $tag->id;
    }

    public function update(Tag $tag): bool
    {
        $tag = DB::table('tags')
            ->where('id', '=', $tag->id)
            ->update([
                'name' => $tag->name, 
                'description' => $tag->description,
                'type' => $tag->type->value,
                'context_id' => $tag->contextId
            ]);

        return (bool) $tag;
    }

    public function delete(string $id): bool
    {
        return (bool) DB::table('tags')->where('id', $id)->delete();
    }
}
