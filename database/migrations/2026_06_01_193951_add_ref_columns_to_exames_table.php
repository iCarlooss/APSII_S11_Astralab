<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('exames', function (Blueprint $table) {
            $table->double('ref_min')->nullable();
            $table->double('ref_max')->nullable();
            $table->longText('ref_texto')->nullable();
        });
    }

    public function down()
    {
        Schema::table('exames', function (Blueprint $table) {
            $table->dropColumn(['ref_min', 'ref_max', 'ref_texto']);
        });
    }
};