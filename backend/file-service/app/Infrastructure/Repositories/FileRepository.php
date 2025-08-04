<?php

declare(strict_types = 1);

namespace App\Infrastructure\Repositories;

use App\Domain\Entities\File;
use App\Domain\Repositories\FileRepositoryInterface;
use App\Infrastructure\Helpers\LoggedUserHelper;
use \DateTimeImmutable;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class FileRepository implements FileRepositoryInterface
{
    public function exists(array $filters): bool
    {
        return DB::table('files')
            ->select([
                'id',
                'name',
                'template_id',
                'user_id',
                'payload',
                'path',
                'ready_to_download',
            ])
            ->where('user_id', app(LoggedUserHelper::class)->userId())
            ->when(! empty($filters['id']), function (Builder $query) use ($filters) {
                $query->where('id', '=', $filters['id']);
            })
            ->when(! empty($filters['name']), function (Builder $query) use ($filters) {
                $query->where('name', '=', $filters['name']);
            })
            ->when(! empty($filters['templateId']), function (Builder $query) use ($filters) {
                $query->where('template_id', '=', $filters['templateId']);
            })
            ->when(! empty($filters['path']), function (Builder $query) use ($filters) {
                $query->where('path', '=', $filters['path']);
            })
            ->when(! empty($filters['readyToDownload']), function (Builder $query) use ($filters) {
                $query->where('ready_to_download', '=', $filters['readyToDownload']);
            })
            ->exists();
    }

    public function findAllUsingFilters(array $filters = []): Collection
    {
        $query = DB::table('files')
            ->select([
                'id',
                'name',
                'template_id',
                'user_id',
                'payload',
                'path',
                'ready_to_download',
            ])
            ->where('user_id', app(LoggedUserHelper::class)->userId())
            ->when(! empty($filters['id']), function (Builder $query) use ($filters) {
                $query->where('id', '=', $filters['id']);
            })
            ->when(! empty($filters['name']), function (Builder $query) use ($filters) {
                $query->where('name', '=', $filters['name']);
            })
            ->when(! empty($filters['templateId']), function (Builder $query) use ($filters) {
                $query->where('template_id', '=', $filters['templateId']);
            })
            ->when(! empty($filters['path']), function (Builder $query) use ($filters) {
                $query->where('path', '=', $filters['path']);
            })
            ->when(! empty($filters['readyToDownload']), function (Builder $query) use ($filters) {
                $query->where('ready_to_download', '=', $filters['readyToDownload']);
            })
            ->get();

        $outputDTO = [];

        foreach ($query as $file) {
            $outputDTO[] = File::restore(
                id: $file->id,
                name: $file->name,
                templateId: $file->template_id,
                userId: $file->user_id,
                payload: $file->payload,
                path: $file->path,
                readyToDownload: $file->ready_to_download,
                status: $file->status,
                createdAt: $file->created_at,
                updatedAt: $file->updated_at,
            );
        }

        return collect($outputDTO);
    }

    public function findFirstUsingFilters(array $filters = []): ?File
    {
        $file = DB::table('files')
            ->select([
                'id',
                'name',
                'template_id',
                'user_id',
                'payload',
                'path',
                'ready_to_download',
            ])
            ->where('user_id', app(LoggedUserHelper::class)->userId())
            ->when(! empty($filters['id']), function (Builder $query) use ($filters) {
                $query->where('id', '=', $filters['id']);
            })
            ->when(! empty($filters['name']), function (Builder $query) use ($filters) {
                $query->where('name', '=', $filters['name']);
            })
            ->when(! empty($filters['templateId']), function (Builder $query) use ($filters) {
                $query->where('template_id', '=', $filters['templateId']);
            })
            ->when(! empty($filters['path']), function (Builder $query) use ($filters) {
                $query->where('path', '=', $filters['path']);
            })
            ->when(! empty($filters['readyToDownload']), function (Builder $query) use ($filters) {
                $query->where('ready_to_download', '=', $filters['readyToDownload']);
            })
            ->first();

        if (! $file) {
            return null;
        }

        return File::restore(
            id: $file->id,
            name: $file->name,
            templateId: $file->templateId,
            userId: $file->userId,
            payload: $file->payload,
            path: $file->path,
            readyToDownload: $file->readyToDownload,
            status: $file->status,
            createdAt: $file->createdAt,
            updatedAt: $file->updatedAt,
        );
    }


    public function findOneById(string $id): ?File
    {
        $file = DB::table('files')
            ->select([
                'id',
                'name',
                'template_id',
                'user_id',
                'payload',
                'path',
                'ready_to_download',
            ])
            ->where('id', '=', $id)
            ->first();

        if (! $file) {
            return null;
        }

        return File::restore(
            id: $file->id,
            name: $file->name,
            templateId: $file->templateId,
            userId: $file->userId,
            payload: $file->payload,
            path: $file->path,
            readyToDownload: $file->readyToDownload,
            status: $file->status,
            createdAt: $file->createdAt,
            updatedAt: $file->updatedAt
        );
    }

    public function insert(File $file): string
    {
        $inserted = DB::table("files")
            ->insert([
                'id' => $file->id,
                'name' => $file->name,
                'template_id' => $file->templateId,
                'user_id' => $file->userId,
                'payload' => $file->payload,
                'path' => $file->path,
                'ready_to_download' => $file->readyToDownload,
                'status' => $file->status,
                'created_at' => $file->createdAt,
                'updated_at' => $file->updatedAt,
            ]);

        if (! $inserted) {
            throw new \RuntimeException('Erro ao persistir o contexto.');
        }

        return $file->id;
    }

    public function delete(string $id): bool
    {
        return (bool) DB::table('files')->where('id', $id)->delete();
    }
}
