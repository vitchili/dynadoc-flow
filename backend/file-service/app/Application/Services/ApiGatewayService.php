<?php

namespace App\Application\Services;

use App\Infrastructure\Helpers\LoggedUserHelper;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\Response;

class ApiGatewayService
{
    protected string $host;
    protected string $verb;
    protected string $route;
    protected array $filters;
    protected array $payload;

    public function __construct(
        string $host,
        string $verb,
        string $route,
        ?array $filters = [],
        ?array $payload = []
    ) {
        $this->host = rtrim($host, '/');
        $this->verb = strtolower($verb);
        $this->route = ltrim($route, '/');
        $this->filters ??= $filters;
        $this->payload = $payload;
    }

    protected function getAuthorizationHeader(): array
    {
        return [
            'Authorization' => 'Bearer ' . app(LoggedUserHelper::class)->token(),
        ];
    }

    public function call(): Response
    {
        $url = $this->host . '/' . $this->route;

        $headers = array_merge(
            $this->getAuthorizationHeader(),
            ['Accept' => 'application/json']
        );

        $client = Http::withHeaders($headers);

        if (!empty($this->filters)) {
            $client = $client->withQueryParameters($this->filters);
        }

        switch ($this->verb) {
            case 'get':
                return $client->get($url);

            case 'post':
                return $client->post($url, $this->payload);

            case 'patch':
                return $client->patch($url, $this->payload);

            case 'delete':
                return $client->delete($url, $this->payload);

            default:
                throw new \InvalidArgumentException("HTTP verb '{$this->verb}' is not supported.");
        }
    }
}
