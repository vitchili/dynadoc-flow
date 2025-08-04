<?php

use App\Application\Services\JwtValidatorService;
use Illuminate\Testing\Fluent\AssertableJson;

use function Pest\Laravel\{postJson, patchJson, deleteJson, getJson};

beforeEach(function () {
    $this->userId = '9f8425b8-4ade-4e04-a29f-f016fbd64db2';
    $this->companyId = '6e86d634-2f45-453a-a89f-e6a5e1ad5db6';

    $mock = Mockery::mock(JwtValidatorService::class);
    $mock->shouldReceive('validate')
        ->andReturn([
            'userId' => $this->userId,
            'companyId' => $this->companyId,
        ]);

    $this->app->instance(JwtValidatorService::class, $mock);

    $this->validBearerToken = 'Bearer aeyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpZCI6IjlmODQyNWI4LTRhZGUtNGUwNC1hMjlmLWYwMTZmYmQ2NGRiMiIsIm5hbWUiOiJWaXRvciIsImVtYWlsIjoidml0b3JAZ21haWwuY29tIiwiY29tcGFueUlkIjoiNmU4NmQ2MzQtMmY0NS00NTNhLWE4OWYtZTZhNWUxYWQ1ZGI2IiwiaXNzIjoidXNlci1zZXJ2aWNlIiwiaWF0IjoxNzUzOTY1OTUwLCJleHAiOjE3NTM5Njk1NTB9.ASGIiF45bmlfz2qFKHH9LNWspDydHQRkogtDjpHcak10KSuKNOcCxq-poxteeVSUDg2zCh18N_JgaBfzAPJRfDcNOy360XwMZEifrY6c4xuxn09sv_7Ns-g4tJgx71WdnFT9wptoNn2oJ6puhfWce29QIXZsnLUk2GEUmq0EZz8FNJAl8QIsXrkJG28SrGC-G22cZHvlaamRySINBE9FUJ3I3XiSPWNyLmS8osYAnKLvyiU4pG9uoAfiRpwdrjV6Ny1hBZ4Uh3HXk9zVt6RuOxeC5zDvQtrx3OU-3E2IXECVr-da8AYXpW9Ear98cFDBpJTc8qdbenpOUO68oviubw';
});

it('can create a templates', function () {
    $response = postJson('/api/templates', [
        'name' => fake()->name(),
        'description' => fake()->title(),
        'company_id' => $this->companyId,
    ], [
        'Authorization' => $this->validBearerToken
    ]);

    $response->assertCreated()
             ->assertJson(fn (AssertableJson $json) =>
                 $json->hasAll(['message','data'])
             );
});

it('can update a template', function () {
    $responseTemplate = postJson('/api/templates', [
        'name' => fake()->name(),
        'description' => fake()->title(),
        'company_id' => $this->companyId,
    ], [
        'Authorization' => $this->validBearerToken
    ]);
    
    $templateId = $responseTemplate['data'];

    $response = patchJson("/api/templates/{$templateId}", [
        'name' => 'New Name',
        'description' => 'Updated desc',
    ], [
        'Authorization' => $this->validBearerToken
    ]);

    $response->assertOk()
             ->assertJson(fn (AssertableJson $json) =>
                 $json->hasAll(['message','data'])
             );
});

it('can list templates by filters', function () {
    postJson('/api/templates', [
        'name' => 'SearchedName',
        'description' => fake()->title(),
        'company_id' => $this->companyId,
    ], [
        'Authorization' => $this->validBearerToken
    ]);

    $response = getJson('/api/templates/filters?name=SearchedName', [
        'Authorization' => $this->validBearerToken
    ]);

    $response->assertOk()
             ->assertJsonStructure(['message', 'data']);
});

it('can delete a template', function () {
    $responseTemplate = postJson('/api/templates', [
        'name' => 'My template',
        'description' => 'A test template',
        'company_id' => $this->companyId,
    ], [
        'Authorization' => $this->validBearerToken
    ]);

    $templateId = $responseTemplate['data'];

    $response = deleteJson("/api/templates/{$templateId}", [], [
        'Authorization' => $this->validBearerToken
    ]);

    $response->assertOk()
             ->assertJsonStructure(['message', 'data']);
});
