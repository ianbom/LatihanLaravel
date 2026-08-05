<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\GoApiClient;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class AuthenticatedSessionController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'status' => $request->session()->get('status'),
        ]);
    }

    public function store(LoginRequest $request, GoApiClient $client): RedirectResponse
    {
        $throttleKey = Str::lower($request->string('username')->toString()).'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            throw ValidationException::withMessages([
                'login' => 'Terlalu banyak percobaan login. Silakan coba lagi nanti.',
            ]);
        }

        RateLimiter::hit($throttleKey, 60);

        try {
            $response = $client->login(
                $request->string('username')->toString(),
                $request->string('password')->toString(),
            );
        } catch (ConnectionException) {
            throw ValidationException::withMessages([
                'login' => 'Layanan autentikasi tidak tersedia. Silakan coba lagi.',
            ]);
        }

        if ($response->unauthorized()) {
            throw ValidationException::withMessages([
                'username' => 'Username atau password salah.',
            ]);
        }

        if ($response->status() === 429) {
            $retryAfter = filter_var($response->header('Retry-After'), FILTER_VALIDATE_INT);
            $message = $retryAfter
                ? "Terlalu banyak percobaan. Coba lagi dalam {$retryAfter} detik."
                : 'Terlalu banyak percobaan. Silakan coba lagi nanti.';

            throw ValidationException::withMessages(['login' => $message]);
        }

        if ($response->failed()) {
            throw ValidationException::withMessages([
                'login' => 'Layanan autentikasi sedang bermasalah. Silakan coba lagi.',
            ]);
        }

        $token = $response->json('token');

        if (! is_string($token) || $token === '') {
            throw ValidationException::withMessages([
                'login' => 'Respons layanan autentikasi tidak valid.',
            ]);
        }

        $expiresAt = $this->tokenExpiry($token);

        if ($expiresAt <= time()) {
            throw ValidationException::withMessages([
                'login' => 'Respons layanan autentikasi tidak valid.',
            ]);
        }

        $request->session()->regenerate();
        $request->session()->put([
            'auth.token' => $token,
            'auth.username' => $request->string('username')->toString(),
            'auth.expires_at' => $expiresAt,
        ]);

        return redirect()->intended(route('dashboard', absolute: false));
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    private function tokenExpiry(string $token): int
    {
        $fallbackExpiry = time() + 86400;

        try {
            $payload = explode('.', $token)[1] ?? null;

            if (! is_string($payload)) {
                return $fallbackExpiry;
            }

            $payload .= str_repeat('=', (4 - strlen($payload) % 4) % 4);
            $decoded = base64_decode(strtr($payload, '-_', '+/'), true);
            $claims = is_string($decoded) ? json_decode($decoded, true, flags: JSON_THROW_ON_ERROR) : [];
            $expiry = is_array($claims) ? ($claims['exp'] ?? null) : null;

            return is_int($expiry) ? $expiry : $fallbackExpiry;
        } catch (Throwable) {
            return $fallbackExpiry;
        }
    }
}
