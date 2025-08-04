<?php

declare(strict_types = 1);

namespace App\Infrastructure\Repositories;

use App\Domain\Entities\File;
use App\Domain\Enums\FileStatusEnum;
use App\Domain\Repositories\FileRepositoryInterface;
use App\Infrastructure\Helpers\LoggedUserHelper;
use DateTimeImmutable;
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
                'status',
                'created_at',
                'updated_at',
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
            ->when(! empty($filters['status']), function (Builder $query) use ($filters) {
                $query->where('status', '=', $filters['status']);
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
                'status',
                'errors',
                'created_at',
                'updated_at',
            ])
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
                $query->where('ready_to_download', '=', (bool) $filters['readyToDownload']);
            })
            ->when(! empty($filters['status']), function (Builder $query) use ($filters) {
                $query->where('status', '=', $filters['status']);
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
                readyToDownload: (bool) $file->ready_to_download,
                status: FileStatusEnum::from($file->status),
                errors: $file->errors,
                createdAt: new DateTimeImmutable($file->created_at),
                updatedAt: new DateTimeImmutable($file->updated_at),
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
                'status',
                'errors',
                'created_at',
                'updated_at',
            ])
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
                $query->where('ready_to_download', '=', (bool) $filters['readyToDownload']);
            })
            ->when(! empty($filters['status']), function (Builder $query) use ($filters) {
                $query->where('status', '=', $filters['status']);
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
            readyToDownload: (bool) $file->readyToDownload,
            status: FileStatusEnum::from($file->status),
            errors: $file->errors,
            createdAt: new DateTimeImmutable($file->createdAt),
            updatedAt: new DateTimeImmutable($file->updatedAt),
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
                'status',
                'errors',
                'created_at',
                'updated_at',
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
            readyToDownload: (bool) $file->readyToDownload,
            status: FileStatusEnum::from($file->status),
            errors: $file->errors,
            createdAt: new DateTimeImmutable($file->createdAt),
            updatedAt: new DateTimeImmutable($file->updatedAt)
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
                'ready_to_download' => (bool) $file->readyToDownload,
                'status' => $file->status->value,
                'errors' => $file->errors,
                'created_at' => $file->createdAt,
                'updated_at' => $file->updatedAt,
            ]);

        if (! $inserted) {
            throw new \RuntimeException('Erro ao persistir o contexto.');
        }

        return $file->id;
    }

    public function update(File $file): bool
    {
        $file = DB::table('files')
            ->where('id', '=', $file->id)
            ->update([
                'name' => $file->name,
                'payload' => $file->payload,
                'path' => $file->path,
                'ready_to_download' => (bool) $file->readyToDownload,
                'status' => $file->status->value,
                'errors' => $file->errors,
            ]);

        return (bool) $file;
    }

    public function delete(string $id): bool
    {
        return (bool) DB::table('files')->where('id', $id)->delete();
    }
}
