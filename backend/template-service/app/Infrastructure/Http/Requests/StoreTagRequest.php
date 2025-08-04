<?php

namespace App\Infrastructure\Http\Requests;

use App\Domain\Enums\TagTypeEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTagRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'description' => [
                'required',
                'string',
                'max:255',
            ],
            'type' => [
                'required',
                'integer',
                Rule::enum(TagTypeEnum::class),
            ],
            'contextId' => [
                'required',
                'string',
                'uuid',
                'exists:contexts,id',
            ],
        ];
    }
}
