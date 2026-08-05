<?php

namespace Tests\Feature;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RecordsManagementTest extends TestCase
{
    public function test_records_page_requires_a_dashboard_session(): void
    {
        $this->get(route('records.index'))->assertRedirect(route('login'));
        $this->getJson(route('internal.records.index'))->assertUnauthorized();
    }

    public function test_authenticated_user_can_open_records_page(): void
    {
        $this->authenticated()->get(route('records.index'))->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('records'));
    }

    public function test_records_are_loaded_with_the_session_token(): void
    {
        Http::fake(['http://go-api.test/api/records*' => Http::response([$this->record()])]);

        $this->authenticated()->getJson(route('internal.records.index'))
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data');

        Http::assertSent(fn (Request $request) => $request->url() === 'http://go-api.test/api/records?limit=1000'
            && $request->hasHeader('Authorization', 'Bearer secret-token'));
    }

    public function test_create_record_validates_input_before_calling_go_api(): void
    {
        Http::fake();

        $this->authenticated()->postJson(route('internal.records.store'), [
            'site_name' => '',
            'revenue' => -1,
            'user' => '',
            'payload' => '[]',
        ])->assertUnprocessable()
            ->assertJsonPath('code', 'VALIDATION_ERROR')
            ->assertJsonValidationErrors(['site_name', 'revenue', 'user', 'payload']);

        Http::assertNothingSent();
    }

    public function test_valid_record_is_forwarded_to_go_api(): void
    {
        Http::fake(['http://go-api.test/api/records' => Http::response($this->record(), 201)]);

        $payload = [
            'site_name' => ' alpha.test ',
            'revenue' => 1250.5,
            'user' => ' alice ',
            'payload' => '{"status":"active"}',
        ];

        $this->authenticated()->postJson(route('internal.records.store'), $payload)
            ->assertCreated()
            ->assertJsonPath('message', 'Record berhasil ditambahkan.')
            ->assertJsonPath('data.id', 1);

        Http::assertSent(fn (Request $request) => $request->url() === 'http://go-api.test/api/records'
            && $request['site_name'] === 'alpha.test'
            && $request['user'] === 'alice'
            && $request['payload'] === '{"status":"active"}');
    }

    public function test_record_can_be_deleted_and_seed_data_can_be_generated(): void
    {
        Http::fake([
            'http://go-api.test/api/records/7' => Http::response([], 204),
            'http://go-api.test/api/seed?count=5' => Http::response(['created' => 5]),
        ]);

        $this->authenticated()->deleteJson(route('internal.records.destroy', 7))
            ->assertOk()->assertJsonPath('message', 'Record berhasil dihapus.');

        $this->authenticated()->postJson(route('internal.seed'), ['count' => 5])
            ->assertOk()->assertJsonPath('message', '5 seed record berhasil dibuat.');
    }

    public function test_go_api_unauthorized_response_invalidates_the_session(): void
    {
        Http::fake(['http://go-api.test/api/records*' => Http::response([], 401)]);

        $response = $this->authenticated()->getJson(route('internal.records.index'));

        $response->assertUnauthorized()->assertJsonPath('code', 'SESSION_EXPIRED');
        $response->assertSessionMissing('auth.token');
    }

    public function test_rate_limit_and_connection_failures_are_standardized(): void
    {
        Http::fake(['http://go-api.test/api/records*' => Http::response([], 429, ['Retry-After' => '15'])]);

        $this->authenticated()->getJson(route('internal.records.index'))
            ->assertStatus(429)
            ->assertJsonPath('code', 'RATE_LIMITED')
            ->assertJsonPath('retry_after', 15);

        Http::fake(fn () => throw new ConnectionException('Connection refused'));

        $this->authenticated()->getJson(route('internal.records.index'))
            ->assertServiceUnavailable()
            ->assertJsonPath('code', 'BACKEND_UNREACHABLE');
    }

    protected function setUp(): void
    {
        parent::setUp();
        config()->set('services.go_api.url', 'http://go-api.test');
    }

    private function authenticated(): static
    {
        return $this->withSession([
            'auth.token' => 'secret-token',
            'auth.username' => 'user',
            'auth.expires_at' => now()->addHour()->timestamp,
        ]);
    }

    /** @return array<string, int|float|string> */
    private function record(): array
    {
        return [
            'id' => 1,
            'site_name' => 'alpha.test',
            'revenue' => 1250.5,
            'user' => 'alice',
            'payload' => '{"status":"active"}',
            'created_at' => '2026-08-05 12:00:00',
        ];
    }
}
