<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_diarahkan_sesuai_role()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        // Dashboard adalah router per-role; user tanpa role diarahkan ke profil.
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('profile.edit'));
    }
}
