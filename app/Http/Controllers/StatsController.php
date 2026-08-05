<?php

namespace App\Http\Controllers;

use App\Services\GoApiClient;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response as ClientResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    public function show(Request $request, GoApiClient $client): JsonResponse
    {
        try {
            $response = $client->stats((string) $request->session()->get('auth.token'));
        } catch (ConnectionException) {
            return response()->json([
                'success' => false,
                'message' => 'Backend tidak dapat dijangkau. Silakan coba lagi.',
                'code' => 'BACKEND_UNAVAILABLE',
            ], 503);
        }

        if ($response->unauthorized()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'success' => false,
                'message' => 'Sesi Anda telah berakhir. Silakan login kembali.',
                'code' => 'SESSION_EXPIRED',
            ], 401);
        }

        if ($response->status() === 429) {
            return $this->rateLimited($response);
        }

        if ($response->failed()) {
            return response()->json([
                'success' => false,
                'message' => 'Backend sedang bermasalah. Silakan coba lagi.',
                'code' => 'BACKEND_ERROR',
            ], 502);
        }

        $stats = $response->json();

        if (is_array($stats) && isset($stats['data']) && is_array($stats['data'])) {
            $stats = $stats['data'];
        }

        if (! is_array($stats) || ! $this->valid($stats)) {
            return response()->json([
                'success' => false,
                'message' => 'Respons backend tidak valid.',
                'code' => 'INVALID_RESPONSE',
            ], 502);
        }

        return response()->json(['success' => true, 'data' => $stats]);
    }

    private function rateLimited(ClientResponse $response): JsonResponse
    {
        $retryAfter = filter_var($response->header('Retry-After'), FILTER_VALIDATE_INT);

        return response()->json(array_filter([
            'success' => false,
            'message' => 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
            'code' => 'RATE_LIMITED',
            'retry_after' => $retryAfter ?: null,
        ], fn (mixed $value) => $value !== null), 429);
    }

    /** @param array<string, mixed> $stats */
    private function valid(array $stats): bool
    {
        return is_int($stats['total_records'] ?? null)
            && is_numeric($stats['total_revenue'] ?? null)
            && is_numeric($stats['alloc_memory_mb'] ?? null)
            && is_numeric($stats['sys_memory_mb'] ?? null)
            && is_int($stats['num_goroutines'] ?? null)
            && is_string($stats['uptime'] ?? null);
    }
}
