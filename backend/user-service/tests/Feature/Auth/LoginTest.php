<?php

use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use App\Application\Events\UserLoggedIn;
use Illuminate\Support\Facades\DB;

use function Pest\Laravel\postJson;

beforeEach(function () {
    Event::fake([UserLoggedIn::class]);
});

it('should login successfully with valid credentials', function () {
    $password = 'secret123';

    DB::table('users')->insert([
        'id' => '81e9ea7a-2d39-4b16-a9d7-b4bd5b378a7f',
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => Hash::make($password),
        'company_id' => '0a4d97b8-5ffd-4b0b-bb2f-a779ac8dd7c2',
        'photo_url' => null,
    ]);


    $response = postJson('/api/auth/login', [
        'email' => 'john@example.com',
        'password' => $password,
    ]);

    $response->assertOk();
    $response->assertJsonStructure([
        'data' => [
            'id',
            'name',
            'email',
            'token',
        ]
    ]);

    Event::assertDispatched(UserLoggedIn::class);
});

it('should not login with invalid password', function () {
    DB::table('users')->insert([
        'id' => 'cf3aae61-e5d3-43d5-8a31-4579f59c7e51',
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'password' => Hash::make('correct-password'),
        'company_id' => '91e0d4aa-61a5-4b8f-922f-d0ab5d696896',
        'photo_url' => null,
    ]);

    $response = postJson('/api/auth/login', [
        'email' => 'jane@example.com',
        'password' => 'wrong-password',
    ]);

    $response->assertUnauthorized();
    Event::assertNotDispatched(UserLoggedIn::class);
});

it('should not login with non-existing user', function () {
    $response = postJson('/api/auth/login', [
        'email' => 'unknown@example.com',
        'password' => 'doesnt-matter',
    ]);

    $response->assertUnauthorized();
    Event::assertNotDispatched(UserLoggedIn::class);
});

it('should validate required fields', function () {
    $response = postJson('/api/auth/login', []);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['email', 'password']);
});
