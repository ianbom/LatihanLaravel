<?php

namespace Tests\Feature\Auth;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    public function test_registration_page_explains_that_accounts_are_managed_externally(): void
    {
        $this->get(route('register'))->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('auth/register'));
    }

    public function test_accounts_cannot_be_registered(): void
    {
        $this->post('/register', ['username' => 'new-user', 'password' => 'password'])
            ->assertMethodNotAllowed();
    }
}
