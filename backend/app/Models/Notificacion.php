<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Notificacion extends Model
{
    use SoftDeletes;

    protected $table = 'notificaciones';

    protected $fillable = [
        'user_id',
        'emisor_id',
        'titulo',
        'mensaje',
        'tipo',
        'leido'
    ];

    protected $casts = [
        'leido' => 'boolean',
    ];

    public function receptor()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function emisor()
    {
        return $this->belongsTo(User::class, 'emisor_id');
    }
}
