<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureDashboardSession
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->session()->get('auth.token');
        $expiresAt = $request->session()->get('auth.expires_at');

        if (! is_string($token) || ! is_int($expiresAt) || $expiresAt <= now()->timestamp) {
            $expired = is_string($token);
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $expired
                        ? 'Sesi Anda telah berakhir. Silakan login kembali.'
                        : 'Anda harus login terlebih dahulu.',
                    'code' => 'SESSION_EXPIRED',
                ], 401);
            }

            return redirect()->route('login')->with(
                'status',
                $expired ? 'Sesi Anda telah berakhir. Silakan login kembali.' : null,
            );
        }

        $response = $next($request);
        $response->headers->set('Cache-Control', 'no-store, private');

        return $response;
    }
}
