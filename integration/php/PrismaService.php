<?php

declare(strict_types=1);

namespace Effluve\Prisma;

use RuntimeException;

final class PrismaService
{
    private string $baseUrl;
    private string $token;

    public function __construct(?string $baseUrl = null, ?string $token = null)
    {
        $this->baseUrl = rtrim($baseUrl ?? getenv('PRISMA_API_URL') ?: 'http://127.0.0.1:4010', '/');
        $this->token = $token ?? getenv('PRISMA_API_TOKEN') ?: '';
    }

    public function findManyUsers(): array
    {
        return $this->request('GET', '/users');
    }

    public function findUserById(int $id): array
    {
        return $this->request('GET', "/users/{$id}");
    }

    public function createUser(string $email, string $fullName, string $passwordHash, string $role = 'customer'): array
    {
        return $this->request('POST', '/users', [
            'email' => $email,
            'fullName' => $fullName,
            'passwordHash' => $passwordHash,
            'role' => $role,
        ]);
    }

    public function updateUser(int $id, array $patch): array
    {
        return $this->request('PATCH', "/users/{$id}", $patch);
    }

    public function deleteUser(int $id): void
    {
        $this->request('DELETE', "/users/{$id}");
    }

    public function findOrdersForUser(int $id): array
    {
        return $this->request('GET', "/users/{$id}/orders");
    }

    private function request(string $method, string $path, ?array $payload = null): array
    {
        $url = $this->baseUrl . $path;
        $ch = curl_init($url);
        if ($ch === false) {
            throw new RuntimeException('Cannot initialize curl');
        }

        $headers = ['Accept: application/json'];
        if ($this->token !== '') {
            $headers[] = 'Authorization: Bearer ' . $this->token;
        }

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);

        if ($payload !== null) {
            $headers[] = 'Content-Type: application/json';
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload, JSON_THROW_ON_ERROR));
        }

        $response = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if ($response === false) {
            $message = curl_error($ch);
            curl_close($ch);
            throw new RuntimeException('Prisma API call failed: ' . $message);
        }
        curl_close($ch);

        if ($status === 204) {
            return [];
        }

        $decoded = json_decode($response, true);
        if (!is_array($decoded)) {
            throw new RuntimeException('Invalid JSON response from Prisma API');
        }

        if ($status >= 400) {
            $errorMessage = $decoded['error'] ?? 'Unknown error';
            throw new RuntimeException("Prisma API error ({$status}): {$errorMessage}");
        }

        return $decoded;
    }
}
