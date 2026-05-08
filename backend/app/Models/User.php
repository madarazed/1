<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nombre',
        'email',
        'password',
        'cedula',
        'activo',
        'estado',
        'id_sucursal',
        'id_rol',
        'id_sucursal_actual',
    ];

    public function role()
    {
        return $this->belongsTo(Role::class, 'id_rol');
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    public function sucursal()
    {
        return $this->belongsTo(Sucursal::class, 'id_sucursal');
    }

    public function sucursalActual()
    {
        return $this->belongsTo(Sucursal::class, 'id_sucursal_actual');
    }

    public function hasRole(string $roleNombre): bool
    {
        // Revisar tanto la relación de un solo rol como la de muchos (por si acaso)
        return ($this->role && $this->role->nombre === $roleNombre) || 
               $this->roles->contains('nombre', $roleNombre);
    }

    public function hasAnyRole(array $rolesNombres): bool
    {
        return ($this->role && in_array($this->role->nombre, $rolesNombres)) || 
               $this->roles->whereIn('nombre', $rolesNombres)->isNotEmpty();
    }

    public function getRoleNameAttribute()
    {
        // Access relationship through getRelationValue to avoid magic property conflicts if needed,
        // but since the accessor is now 'role_name', we can safely use $this->role
        if ($this->role) {
            return strtolower($this->role->nombre);
        }
        if ($this->roles && $this->roles->count() > 0) {
            return strtolower($this->roles->first()->nombre);
        }
        return 'cliente';
    }

    protected $appends = ['role_name'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
