<?php

namespace Tests\Feature;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class DashboardDataTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config(['services.go_api.url' => 'http://go-api.test']);
    }

    public function test_stats_are_proxied_with_the_session_token(): void
    {
        $stats = [
            'total_records' => 10,
            'total_revenue' => 50097.07,
            'alloc_memory_mb' => 0.42,
            'sys_memory_mb' => 6.58,
            'num_goroutines' => 5,
            'uptime' => '34m3s',
        ];

        Http::fake(['http://go-api.test/api/stats' => Http::response($stats)]);

        $this->authenticated()
            ->getJson(route('internal.stats'))
            ->assertOk()
            ->assertExactJson(['success' => true, 'data' => $stats]);

        Http::assertSent(fn (Request $request) => $request->url() === 'http://go-api.test/api/stats'
            && $request->hasHeader('Authorization', 'Bearer secret-token'));
    }

    public function test_upstream_unauthorized_response_invalidates_the_session(): void
    {
        Http::fake(['http://go-api.test/api/stats' => Http::response([], 401)]);

        $this->authenticated()
            ->getJson(route('internal.stats'))
            ->assertUnauthorized()
            ->assertExactJson([
                'success' => false,
                'message' => 'Sesi Anda telah berakhir. Silakan login kembali.',
                'code' => 'SESSION_EXPIRED',
            ])
            ->assertSessionMissing('auth.token');
    }

    public function test_rate_limit_response_is_normalized(): void
    {
        Http::fake(['http://go-api.test/api/stats' => Http::response([], 429, [
            'Retry-After' => '30',
        ])]);

        $this->authenticated()
            ->getJson(route('internal.stats'))
            ->assertStatus(429)
            ->assertExactJson([
                'success' => false,
                'message' => 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
                'code' => 'RATE_LIMITED',
                'retry_after' => 30,
            ]);
    }

    public function test_connection_failure_is_normalized(): void
    {
        Http::fake(fn () => throw new ConnectionException('Connection refused'));

        $this->authenticated()
            ->getJson(route('internal.stats'))
            ->assertServiceUnavailable()
            ->assertExactJson([
                'success' => false,
                'message' => 'Backend tidak dapat dijangkau. Silakan coba lagi.',
                'code' => 'BACKEND_UNAVAILABLE',
            ]);
    }

    public function test_invalid_upstream_payload_is_rejected(): void
    {
        Http::fake(['http://go-api.test/api/stats' => Http::response([
            'unexpected' => true,
        ])]);

        $this->authenticated()
            ->getJson(route('internal.stats'))
            ->assertStatus(502)
            ->assertExactJson([
                'success' => false,
                'message' => 'Respons backend tidak valid.',
                'code' => 'INVALID_RESPONSE',
            ]);
    }

    private function authenticated(): static
    {
        return $this->withSession([
            'auth.token' => 'secret-token',
            'auth.username' => 'user',
            'auth.expires_at' => now()->addHour()->timestamp,
        ]);
    }
}
