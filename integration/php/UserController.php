<?php

declare(strict_types=1);

namespace Effluve\Controller;

use Effluve\Prisma\PrismaService;
use RuntimeException;

final class UserController
{
    public function __construct(private readonly PrismaService $prisma)
    {
    }

    public function list(): void
    {
        $users = $this->prisma->findManyUsers();
        $this->json($users, 200);
    }

    public function show(int $id): void
    {
        try {
            $user = $this->prisma->findUserById($id);
            $this->json($user, 200);
        } catch (RuntimeException $e) {
            $this->json(['error' => $e->getMessage()], 404);
        }
    }

    public function create(array $payload): void
    {
        $user = $this->prisma->createUser(
            $payload['email'] ?? '',
            $payload['fullName'] ?? '',
            $payload['passwordHash'] ?? '',
            $payload['role'] ?? 'customer'
        );
        $this->json($user, 201);
    }

    public function update(int $id, array $payload): void
    {
        $user = $this->prisma->updateUser($id, $payload);
        $this->json($user, 200);
    }

    public function delete(int $id): void
    {
        $this->prisma->deleteUser($id);
        $this->json([], 204);
    }

    public function orders(int $id): void
    {
        $orders = $this->prisma->findOrdersForUser($id);
        $this->json($orders, 200);
    }

    private function json(array $data, int $status): void
    {
        http_response_code($status);
        header('Content-Type: application/json');
        if ($status !== 204) {
            echo json_encode($data, JSON_THROW_ON_ERROR);
        }
    }
}
