<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$request = Illuminate\Http\Request::capture();
$kernel->handle($request);

$user = App\Models\User::with('roles')->first();
$resource = new App\Http\Resources\UserResource($user);
$data = $resource->toArray($request);
echo json_encode($data, JSON_PRETTY_PRINT) . PHP_EOL;
echo PHP_EOL . "roles json: " . json_encode($data['roles']) . PHP_EOL;
echo "is array: " . (is_array(json_decode(json_encode($data['roles']), true)) ? 'YES' : 'NO') . PHP_EOL;
