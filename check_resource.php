<?php

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$request = Request::capture();
$kernel->handle($request);

$user = User::with('roles')->first();
$resource = new UserResource($user);
$data = $resource->toArray($request);
echo json_encode($data, JSON_PRETTY_PRINT).PHP_EOL;
echo PHP_EOL.'roles json: '.json_encode($data['roles']).PHP_EOL;
echo 'is array: '.(is_array(json_decode(json_encode($data['roles']), true)) ? 'YES' : 'NO').PHP_EOL;
