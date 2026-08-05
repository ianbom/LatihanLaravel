<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateRecordRequest;
use App\Http\Requests\SeedRecordsRequest;
use App\Services\GoApiClient;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response as ClientResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecordController extends Controller
{
    public function index(Request $request, GoApiClient $client): JsonResponse
    {
        try {
            $response = $client->records($this->token($request));
        } catch (ConnectionException) {
            return $this->unreachable();
        }

        if ($response->successful()) {
            $data = $response->json();

            if (is_array($data) && isset($data['records']) && is_array($data['records'])) {
                $data = $data['records'];
            }

            return response()->json([
                'success' => true,
                'message' => 'Records berhasil dimuat.',
                'data' => is_array($data) ? array_values($data) : [],
            ]);
        }

        return $this->failure($request, $response);
    }

    public function store(CreateRecordRequest $request, GoApiClient $client): JsonResponse
    {
        try {
            $response = $client->createRecord($this->token($request), $request->recordData());
        } catch (ConnectionException) {
            return $this->unreachable();
        }

        if ($response->successful()) {
            return response()->json([
                'success' => true,
                'message' => 'Record berhasil ditambahkan.',
                'data' => $response->json() ?? [],
            ], $response->status());
        }

        return $this->failure($request, $response);
    }

    public function destroy(Request $request, GoApiClient $client, int $id): JsonResponse
    {
        try {
            $response = $client->deleteRecord($this->token($request), $id);
        } catch (ConnectionException) {
            return $this->unreachable();
        }

        if ($response->successful()) {
            return response()->json([
                'success' => true,
                'message' => 'Record berhasil dihapus.',
                'data' => null,
            ]);
        }

        return $this->failure($request, $response);
    }

    public function seed(SeedRecordsRequest $request, GoApiClient $client): JsonResponse
    {
        $count = (int) $request->validated('count');

        try {
            $response = $client->seedRecords($this->token($request), $count);
        } catch (ConnectionException) {
            return $this->unreachable();
        }

        if ($response->successful()) {
            return response()->json([
                'success' => true,
                'message' => "{$count} seed record berhasil dibuat.",
                'data' => $response->json() ?? [],
            ]);
        }

        return $this->failure($request, $response);
    }

    private function token(Request $request): string
    {
        return (string) $request->session()->get('auth.token');
    }

    private function failure(Request $request, ClientResponse $response): JsonResponse
    {
        if ($response->unauthorized()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'success' => false,
                'message' => 'Sesi Anda telah berakhir. Silakan login kembali.',
                'code' => 'SESSION_EXPIRED',
            ], 401);
        }

        $status = $response->status();
        $retryAfter = filter_var($response->header('Retry-After'), FILTER_VALIDATE_INT);
        $messages = [
            404 => ['Record tidak ditemukan.', 'NOT_FOUND'],
            413 => ['Payload terlalu besar.', 'PAYLOAD_TOO_LARGE'],
            422 => ['Data tidak dapat diproses.', 'VALIDATION_ERROR'],
            429 => ['Terlalu banyak permintaan. Silakan coba lagi nanti.', 'RATE_LIMITED'],
        ];
        [$message, $code] = $messages[$status] ?? ['Layanan data sedang bermasalah.', 'BACKEND_ERROR'];

        return response()->json(array_filter([
            'success' => false,
            'message' => $message,
            'errors' => $response->json('errors'),
            'code' => $code,
            'retry_after' => $retryAfter ?: null,
        ], fn (mixed $value) => $value !== null), $status >= 400 && $status < 600 ? $status : 502);
    }

    private function unreachable(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Backend tidak dapat dihubungi.',
            'code' => 'BACKEND_UNREACHABLE',
        ], 503);
    }
}
