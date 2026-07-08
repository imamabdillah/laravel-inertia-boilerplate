<?php

use App\Models\DokumenMitra;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('debug:dok', function () {
    foreach (DokumenMitra::withTrashed()->orderByDesc('id')->get() as $d) {
        $this->line(json_encode($d));
    }
});
