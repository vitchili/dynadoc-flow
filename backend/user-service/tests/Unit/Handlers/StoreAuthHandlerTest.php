<?php

use App\Application\DTOs\AuthInputDTO;
use App\Application\DTOs\AuthOutputDTO;
use App\Application\Events\UserLoggedIn;
use App\Application\Handlers\StoreAuthHandler;
use App\Application\Services\JwtService;
use App\Domain\Entities\User;
use App\Domain\Repositories\UserRepositoryInterface;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function () {
    Event::fake([UserLoggedIn::class]);
});

it('should authenticate and return AuthOutputDTO', function () {
    $input = new AuthInputDTO(
        email: 'john@example.com',
        password: 'password123',
    );

    $user = User::restore(
        id: '89a156bf-83e2-446c-bab2-ecae2d1c4602',
        name: 'John Doe',
        email: 'john@example.com',
        password: Hash::make('password123'),
        companyId: 'f68af515-3c1d-4c6c-8027-8bf96b537b4d',
        photoUrl: null
    );

    /** @var UserRepositoryInterface $repository */
    $repository = mock(UserRepositoryInterface::class)
        ->shouldReceive('findFirstUsingFilters')
        ->once()
        ->with(['email' => $input->email])
        ->andReturn($user)
        ->getMock();

    $jwtService = mock(JwtService::class)
        ->shouldReceive('generateToken')
        ->once()
        ->andReturn('fake.jwt.token')
        ->getMock();

    app()->instance(JwtService::class, $jwtService);

    $handler = new StoreAuthHandler($repository);

    $output = $handler->execute($input);

    expect($output)->toBeInstanceOf(AuthOutputDTO::class)
        ->and($output->token)->toBe('fake.jwt.token')
        ->and($output->email)->toBe($user->email);

    Event::assertDispatched(UserLoggedIn::class);
});

it('should throw AuthenticationException if user is not found', function () {
    $input = new AuthInputDTO(
        email: 'notfound@example.com',
        password: 'irrelevant',
    );

    $repository = mock(UserRepositoryInterface::class)
        ->shouldReceive('findFirstUsingFilters')
        ->once()
        ->with(['email' => $input->email])
        ->andReturn(null)
        ->getMock();

    /** @var UserRepositoryInterface $repository */
    $handler = new StoreAuthHandler($repository);

    $this->expectException(AuthenticationException::class);
    $this->expectExceptionMessage('Invalid credentials');

    $handler->execute($input);
});

it('should throw AuthenticationException if password is incorrect', function () {
    $input = new AuthInputDTO(
        email: 'john@example.com',
        password: 'wrong-password',
    );

    $user = User::restore(
        id: '7c5d04c4-11ec-430d-8f9a-371b684affb3',
        name: 'John Doe',
        email: 'john@example.com',
        password: Hash::make('correct-password'),
        companyId: '427b12dd-1a9b-4106-935f-f65a5dfecaaf',
        photoUrl: null
    );

    $repository = mock(UserRepositoryInterface::class)
        ->shouldReceive('findFirstUsingFilters')
        ->once()
        ->andReturn($user)
        ->getMock();

    /** @var UserRepositoryInterface $repository */
    $handler = new StoreAuthHandler($repository);

    $this->expectException(AuthenticationException::class);
    $this->expectExceptionMessage('Invalid credentials');

    $handler->execute($input);
});
