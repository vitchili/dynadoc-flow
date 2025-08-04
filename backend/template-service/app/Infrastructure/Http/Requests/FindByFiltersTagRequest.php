<?php

namespace App\Infrastructure\Http\Requests;

use App\Domain\Enums\TagTypeEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FindByFiltersTagRequest extends FormRequest
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
            'description' => [
                'sometimes',
                'string',
                'max:255',
            ],
            'type' => [
                'sometimes',
                'integer',
                Rule::enum(TagTypeEnum::class),
            ],
            'contextId' => [
                'sometimes',
                'string',
                'uuid',
                'exists:contexts,id',
            ],
        ];
    }
}
