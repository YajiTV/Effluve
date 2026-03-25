<?php

declare(strict_types=1);

require_once __DIR__ . '/PrismaService.php';
require_once __DIR__ . '/UserController.php';

use Effluve\Controller\UserController;
use Effluve\Prisma\PrismaService;

$controller = new UserController(new PrismaService());
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$body = json_decode(file_get_contents('php://input') ?: '[]', true);
if (!is_array($body)) {
    $body = [];
}

if ($uri === '/users' && $method === 'GET') {
    $controller->list();
    return;
}

if ($uri === '/users' && $method === 'POST') {
    $controller->create($body);
    return;
}

if (preg_match('#^/users/(\d+)$#', $uri, $m) === 1 && $method === 'GET') {
    $controller->show((int) $m[1]);
    return;
}

if (preg_match('#^/users/(\d+)$#', $uri, $m) === 1 && $method === 'PATCH') {
    $controller->update((int) $m[1], $body);
    return;
}

if (preg_match('#^/users/(\d+)$#', $uri, $m) === 1 && $method === 'DELETE') {
    $controller->delete((int) $m[1]);
    return;
}

if (preg_match('#^/users/(\d+)/orders$#', $uri, $m) === 1 && $method === 'GET') {
    $controller->orders((int) $m[1]);
    return;
}

http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['error' => 'NOT_FOUND'], JSON_THROW_ON_ERROR);
