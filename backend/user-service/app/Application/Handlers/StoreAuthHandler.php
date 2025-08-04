<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Application\DTOs\AuthInputDTO;
use App\Application\DTOs\AuthOutputDTO;
use App\Application\Events\UserLoggedIn;
use App\Application\Services\JwtService;
use App\Domain\Entities\User;
use App\Domain\Repositories\UserRepositoryInterface;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Hash;

final readonly class StoreAuthHandler
{
    public function __construct(
        private UserRepositoryInterface $userRepository
    ) {
    }

    public function execute(AuthInputDTO $input): AuthOutputDTO
    {
        $user = $this->getExistingUser($input);

        if (empty($user) || ! Hash::check($input->password, $user->password)) {
            throw new AuthenticationException('Invalid credentials');
        }

        $jwt = $this->generateToken($user);

        $outputDTO = $this->getAuthOutputDTO($user, $jwt);

        event(new UserLoggedIn($outputDTO));

        return $outputDTO;
    }

    private function getExistingUser(AuthInputDTO $input): ?User
    {
        return $this->userRepository->findFirstUsingFilters([
            'email' => $input->email
        ]);
    } 

    private function generateToken(User $user): string
    {
        return app(JwtService::class)->generateToken([
            'userId' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'companyId' => $user->companyId,
        ]);
    }

    private function getAuthOutputDTO(User $user, string $jwt): AuthOutputDTO
    {
        return new AuthOutputDTO(
            id: $user->id,
            name: $user->name,
            email: $user->email,
            token: $jwt
        );
    }
}
