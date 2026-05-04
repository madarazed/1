<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Config extends Model
{
    protected $fillable = ['key', 'value', 'type', 'description'];

    protected static function booted()
    {
        static::saved(function ($config) {
            Cache::forget("config_{$config->key}");
        });

        static::deleted(function ($config) {
            Cache::forget("config_{$config->key}");
        });
    }

    public static function getValue($key, $default = null)
    {
        return Cache::rememberForever("config_{$key}", function () use ($key, $default) {
            $config = self::where('key', $key)->first();
            if (!$config) return $default;
            
            // Casting simple
            return match($config->type) {
                'integer' => (int) $config->value,
                'float' => (float) $config->value,
                'boolean' => filter_var($config->value, FILTER_VALIDATE_BOOLEAN),
                'json' => json_decode($config->value, true),
                default => $config->value,
            };
        });
    }
}
