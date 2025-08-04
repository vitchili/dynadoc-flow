<?php

namespace App\Infrastructure\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFileRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'templateId' => [
                'required',
                'string',
                'uuid',
            ],
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'payload' => [
                'required',
                'array'
            ]
        ];
    }
}
