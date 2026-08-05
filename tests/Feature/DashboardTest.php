<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    public function test_guests_are_redirected_to_the_login_page(): void
    {
        $this->get(route('dashboard'))->assertRedirect(route('login'));
    }

    public function test_valid_go_api_session_can_visit_the_dashboard(): void
    {
        $this->withSession([
            'auth.token' => 'secret-token', 'auth.username' => 'user',
            'auth.expires_at' => now()->addHour()->timestamp,
        ])->get(route('dashboard'))->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->where('auth.user.username', 'user')
                ->missing('auth.token'));
    }

    public function test_expired_go_api_session_is_invalidated(): void
    {
        $this->withSession([
            'auth.token' => 'secret-token', 'auth.username' => 'user',
            'auth.expires_at' => now()->subMinute()->timestamp,
        ])->get(route('dashboard'))
            ->assertRedirect(route('login'))
            ->assertSessionHas('status', 'Sesi Anda telah berakhir. Silakan login kembali.')
            ->assertSessionMissing('auth.token');
    }
}
