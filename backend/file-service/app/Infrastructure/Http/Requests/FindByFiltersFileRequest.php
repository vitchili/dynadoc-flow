<?php

namespace App\Infrastructure\Http\Requests;

use App\Domain\Enums\FileStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FindByFiltersFileRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'id' => [
                'sometimes',
                'string',
                'uuid',
            ],
            'name' => [
                'sometimes',
                'string',
                'max:255',
            ],
            'templateId' => [
                'sometimes',
                'string',
                'uuid',
            ],
            'userId' => [
                'sometimes',
                'string',
                'uuid',
            ],
            'path' => [
                'sometimes',
                'string',
            ],
            'ready_to_download' => [
                'sometimes',
                'boolean',
            ],
            'status' => [
                'sometimes',
                'integer',
                Rule::enum(FileStatusEnum::class),
            ]
        ];
    }
}
