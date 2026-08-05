<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class CreateRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'site_name' => ['required', 'string', 'max:100'],
            'revenue' => ['required', 'numeric', 'min:0', 'max:1000000000'],
            'user' => ['required', 'string', 'max:50'],
            'payload' => [
                'required',
                'string',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if (! is_string($value) || strlen($value) > 50 * 1024) {
                        $fail('Payload maksimal 50 KB.');

                        return;
                    }

                    $decoded = json_decode($value);

                    if (json_last_error() !== JSON_ERROR_NONE || ! is_object($decoded)) {
                        $fail('Payload harus berupa objek JSON yang valid.');
                    }
                },
            ],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'site_name.required' => 'Site name wajib diisi.',
            'site_name.max' => 'Site name maksimal 100 karakter.',
            'revenue.required' => 'Revenue wajib diisi.',
            'revenue.numeric' => 'Revenue harus berupa angka.',
            'revenue.min' => 'Revenue minimal 0.',
            'revenue.max' => 'Revenue maksimal 1.000.000.000.',
            'user.required' => 'User wajib diisi.',
            'user.max' => 'User maksimal 50 karakter.',
            'payload.required' => 'Payload wajib diisi.',
        ];
    }

    /** @return array{site_name: string, revenue: float, user: string, payload: string} */
    public function recordData(): array
    {
        return [
            'site_name' => $this->string('site_name')->toString(),
            'revenue' => $this->float('revenue'),
            'user' => $this->string('user')->toString(),
            'payload' => $this->string('payload')->toString(),
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'site_name' => trim((string) $this->input('site_name')),
            'user' => trim((string) $this->input('user')),
        ]);
    }

    protected function failedValidation(Validator $validator): never
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Data tidak dapat diproses.',
            'errors' => $validator->errors(),
            'code' => 'VALIDATION_ERROR',
        ], 422));
    }
}
