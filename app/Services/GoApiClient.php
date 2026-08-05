<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class GoApiClient
{
    public function login(string $username, string $password): Response
    {
        return $this->request()
            ->post('/api/login', [
                'username' => $username,
                'password' => $password,
            ]);
    }

    public function records(string $token, int $limit = 1000): Response
    {
        return $this->request($token)->get('/api/records', ['limit' => $limit]);
    }

    public function stats(string $token): Response
    {
        return $this->request($token)->get('/api/stats');
    }

    /** @param array{site_name: string, revenue: int|float, user: string, payload: string} $data */
    public function createRecord(string $token, array $data): Response
    {
        return $this->request($token)->post('/api/records', $data);
    }

    public function deleteRecord(string $token, int $id): Response
    {
        return $this->request($token)->delete("/api/records/{$id}");
    }

    public function seedRecords(string $token, int $count): Response
    {
        return $this->request($token)
            ->withQueryParameters(['count' => $count])
            ->post('/api/seed');
    }

    private function request(?string $token = null): PendingRequest
    {
        $request = Http::baseUrl(rtrim((string) config('services.go_api.url'), '/'))
            ->acceptJson()
            ->asJson()
            ->connectTimeout((int) config('services.go_api.connect_timeout', 5))
            ->timeout((int) config('services.go_api.timeout', 15));

        return $token === null ? $request : $request->withToken($token);
    }
}
