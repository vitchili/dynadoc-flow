<?php

declare(strict_types = 1);

namespace App\Infrastructure\Repositories;

use App\Domain\Entities\Section;
use App\Domain\Repositories\SectionRepositoryInterface;
use App\Infrastructure\Helpers\LoggedUserHelper;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class SectionRepository implements SectionRepositoryInterface
{
    public function exists(array $filters): bool
    {
        return DB::table('sections')
            ->select([
                'sections.id',
                'sections.name',
                'sections.description',
                'sections.template_id',
                'sections.html_content',
                'sections.section_order',
            ])
            ->join('templates', 'sections.template_id', '=', 'templates.id')
            ->where('templates.company_id', app(LoggedUserHelper::class)->companyId())
            ->when(! empty($filters['id']), function (Builder $query) use ($filters) {
                $query->where('sections.id', '=', $filters['id']);
            })
            ->when(! empty($filters['name']), function (Builder $query) use ($filters) {
                $query->where('sections.name', '=', $filters['name']);
            })
            ->when(! empty($filters['description']), function (Builder $query) use ($filters) {
                $query->where('sections.description', '=', $filters['description']);
            })
            ->when(! empty($filters['templateId']), function (Builder $query) use ($filters) {
                $query->where('sections.template_id', '=', $filters['templateId']);
            })
            ->when(! empty($filters['htmlContent']), function (Builder $query) use ($filters) {
                $query->where('sections.html_content', '=', $filters['htmlContent']);
            })
            ->when(! empty($filters['sectionOrder']), function (Builder $query) use ($filters) {
                $query->where('sections.section_order', '=', $filters['sectionOrder']);
            })
            ->exists();
    }

    public function findAllUsingFilters(array $filters = []): Collection
    {
        $query = DB::table('sections')
            ->select([
                'sections.id',
                'sections.name',
                'sections.description',
                'sections.template_id',
                'sections.html_content',
                'sections.section_order',
            ])
            ->join('templates', 'sections.template_id', '=', 'templates.id')
            ->when(! empty($filters['id']), function (Builder $query) use ($filters) {
                $query->where('sections.id', '=', $filters['id']);
            })
            ->when(! empty($filters['name']), function (Builder $query) use ($filters) {
                $query->where('sections.name', '=', $filters['name']);
            })
            ->when(! empty($filters['description']), function (Builder $query) use ($filters) {
                $query->where('sections.description', '=', $filters['description']);
            })
            ->when(! empty($filters['templateId']), function (Builder $query) use ($filters) {
                $query->where('sections.template_id', '=', $filters['templateId']);
            })
            ->when(! empty($filters['htmlContent']), function (Builder $query) use ($filters) {
                $query->where('sections.html_content', '=', $filters['htmlContent']);
            })
            ->when(! empty($filters['sectionOrder']), function (Builder $query) use ($filters) {
                $query->where('sections.section_order', '=', $filters['sectionOrder']);
            })
            ->get();

        return $query;
    }

    public function findFirstUsingFilters(array $filters = []): ?Section
    {
        $section = DB::table('sections')
            ->select([
                'sections.id',
                'sections.name',
                'sections.description',
                'sections.template_id',
                'sections.html_content',
                'sections.section_order',
            ])
            ->join('templates', 'sections.template_id', '=', 'templates.id')
            ->where('templates.company_id', app(LoggedUserHelper::class)->companyId())
            ->when(! empty($filters['id']), function (Builder $query) use ($filters) {
                $query->where('sections.id', '=', $filters['id']);
            })
            ->when(! empty($filters['name']), function (Builder $query) use ($filters) {
                $query->where('sections.name', '=', $filters['name']);
            })
            ->when(! empty($filters['description']), function (Builder $query) use ($filters) {
                $query->where('sections.description', '=', $filters['description']);
            })
            ->when(! empty($filters['templateId']), function (Builder $query) use ($filters) {
                $query->where('sections.template_id', '=', $filters['templateId']);
            })
            ->when(! empty($filters['htmlContent']), function (Builder $query) use ($filters) {
                $query->where('sections.html_content', '=', $filters['htmlContent']);
            })
            ->when(! empty($filters['sectionOrder']), function (Builder $query) use ($filters) {
                $query->where('sections.section_order', '=', $filters['sectionOrder']);
            })
            ->first();

        if (! $section) {
            return null;
        }

        return Section::restore(
            id: $section->id,
            name: $section->name,
            description: $section->description,
            templateId: $section->template_id,
            htmlContent: $section->html_content,
            sectionOrder: $section->sectionOrder
        );
    }

    public function findOneById(string $id): ?Section
    {
        $section = DB::table('sections')
            ->select([
                'id',
                'name',
                'description',
                'template_id',
                'html_content',
                'section_order',
            ])
            ->where('id', '=', $id)
            ->first();

        if (! $section) {
            return null;
        }

        return Section::restore(
            id: $section->id,
            name: $section->name,
            description: $section->description,
            templateId: $section->template_id,
            htmlContent: $section->html_content,
            sectionOrder: $section->sectionOrder
        );
    }

    public function insert(Section $section): string
    {
        $inserted = DB::table("sections")
            ->insert([
                'id' => $section->id,
                'name' => $section->name,
                'description' => $section->description,
                'template_id' => $section->templateId,
                'html_content' => $section->htmlContent,
                'section_order' => $section->sectionOrder
            ]);
        
        if (! $inserted) {
            throw new \RuntimeException('Erro ao persistir o contexto.');
        }

        return $section->id;
    }

    public function update(Section $section): bool
    {
        $section = DB::table('sections')
            ->where('id', '=', $section->id)
            ->update([
                'name' => $section->name,
                'description' => $section->description,
                'html_content' => $section->htmlContent,
                'section_order' => $section->sectionOrder

            ]);

        return (bool) $section;
    }

    public function delete(string $id): bool
    {
        return (bool) DB::table('sections')->where('id', $id)->delete();
    }
}
