<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Sucursal;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthRbacSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Roles
        $roles = [
            'Superadmin',
            'Admin Sucursal',
            'Repartidor',
            'Cajera',
            'Contabilidad',
            'Cliente'
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['nombre' => $role]);
        }

        // 2. Sedes (Sucursales)
        $sedes = [
            ['nombre' => 'Centro', 'direccion' => 'Calle Principal 123', 'telefono' => '1234567', 'ciudad' => 'Ibagué'],
            ['nombre' => 'El Salado', 'direccion' => 'Av. El Salado 45-67', 'telefono' => '7654321', 'ciudad' => 'Ibagué']
        ];

        foreach ($sedes as $sede) {
            Sucursal::firstOrCreate(['nombre' => $sede['nombre']], $sede);
        }

        // 3. Usuario de prueba (Superadmin)
        $centroId = Sucursal::where('nombre', 'Centro')->first()->id;
        $superRole = Role::where('nombre', 'Superadmin')->first();

        $user = User::firstOrCreate(
            ['email' => 'admin@rapifrios.com'],
            [
                'nombre' => 'Super Administrador',
                'password' => Hash::make('password123'),
                'cedula' => '12345678',
                'telefono' => '3001234567',
                'direccion' => 'Sede Centro',
                'id_sucursal_actual' => $centroId,
                'id_sucursal' => $centroId, // Legacy
                'id_rol' => $superRole->id // Legacy
            ]
        );

        $user->roles()->syncWithoutDetaching([$superRole->id]);
    }
}
