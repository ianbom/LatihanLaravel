<?php

namespace Tests\Feature\Auth;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    public function test_login_screen_can_be_rendered(): void
    {
        $this->get(route('login'))->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('auth/login')->where('status', null));
    }

    public function test_user_can_login_through_the_go_api(): void
    {
        Http::fake(['http://go-api.test/api/login' => Http::response([
            'token' => $this->jwtExpiringAt(now()->addHour()->timestamp),
        ])]);

        $response = $this->post(route('login.store'), ['username' => 'user', 'password' => 'pass']);

        $response->assertRedirect(route('dashboard', absolute: false));
        $response->assertSessionHas('auth.username', 'user');
        $response->assertSessionHas('auth.token');
        $response->assertSessionHas('auth.expires_at');
        Http::assertSent(fn (Request $request) => $request->url() === 'http://go-api.test/api/login'
            && $request['username'] === 'user' && $request['password'] === 'pass');
    }

    public function test_invalid_credentials_are_reported_without_storing_a_token(): void
    {
        Http::fake(['http://go-api.test/api/login' => Http::response([], 401)]);

        $this->from(route('login'))->post(route('login.store'), ['username' => 'user', 'password' => 'wrong'])
            ->assertSessionHasErrors(['username' => 'Username atau password salah.'])
            ->assertSessionMissing('auth.token');
    }

    public function test_rate_limit_from_go_api_is_reported(): void
    {
        Http::fake(['http://go-api.test/api/login' => Http::response([], 429, ['Retry-After' => '30'])]);

        $this->from(route('login'))->post(route('login.store'), ['username' => 'user', 'password' => 'pass'])
            ->assertSessionHasErrors(['login' => 'Terlalu banyak percobaan. Coba lagi dalam 30 detik.']);
    }

    public function test_unreachable_go_api_is_reported(): void
    {
        Http::fake(fn () => throw new ConnectionException('Connection refused'));

        $this->from(route('login'))->post(route('login.store'), ['username' => 'user', 'password' => 'pass'])
            ->assertSessionHasErrors(['login' => 'Layanan autentikasi tidak tersedia. Silakan coba lagi.']);
    }

    public function test_login_response_without_token_is_rejected(): void
    {
        Http::fake(['http://go-api.test/api/login' => Http::response(['message' => 'ok'])]);

        $this->from(route('login'))->post(route('login.store'), ['username' => 'user', 'password' => 'pass'])
            ->assertSessionHasErrors(['login' => 'Respons layanan autentikasi tidak valid.'])
            ->assertSessionMissing('auth.token');
    }

    public function test_expired_token_is_rejected(): void
    {
        Http::fake(['http://go-api.test/api/login' => Http::response([
            'token' => $this->jwtExpiringAt(now()->subMinute()->timestamp),
        ])]);

        $this->from(route('login'))->post(route('login.store'), ['username' => 'user', 'password' => 'pass'])
            ->assertSessionHasErrors(['login' => 'Respons layanan autentikasi tidak valid.'])
            ->assertSessionMissing('auth.token');
    }

    public function test_user_can_logout(): void
    {
        $response = $this->withSession([
            'auth.token' => 'secret-token', 'auth.username' => 'user',
            'auth.expires_at' => now()->addHour()->timestamp,
        ])->post(route('logout'));

        $response->assertRedirect(route('login'));
        $response->assertSessionMissing('auth.token');
        $response->assertSessionMissing('auth.username');
        $response->assertSessionMissing('auth.expires_at');
    }

    public function test_login_is_rate_limited_by_username_and_ip(): void
    {
        RateLimiter::increment('user|127.0.0.1', amount: 5);

        $this->from(route('login'))
            ->post(route('login.store'), ['username' => 'user', 'password' => 'wrong'])
            ->assertSessionHasErrors([
                'login' => 'Terlalu banyak percobaan login. Silakan coba lagi nanti.',
            ]);

        Http::assertNothingSent();
    }

    protected function setUp(): void
    {
        parent::setUp();
        config()->set('services.go_api.url', 'http://go-api.test');
    }

    private function jwtExpiringAt(int $timestamp): string
    {
        $payload = rtrim(strtr(base64_encode(json_encode(['exp' => $timestamp], JSON_THROW_ON_ERROR)), '+/', '-_'), '=');

        return "header.{$payload}.signature";
    }
}
