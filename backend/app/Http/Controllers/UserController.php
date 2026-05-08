<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\Vehiculo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = User::with(['role', 'sucursal']);

        // Regla: Superadmin ve todos, Admin Sucursal solo su sede
        if (!$user->hasRole('Superadmin')) {
            $query->where('id_sucursal', $user->id_sucursal);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'cedula' => 'required|string|unique:users',
            'password' => 'required|string|min:6',
            'id_rol' => 'required|exists:roles,id',
            'id_sucursal' => 'nullable|exists:sucursales,id',
            'vehiculo_id' => 'nullable|exists:vehiculos,id',
        ]);

        return DB::transaction(function () use ($request) {
            $id_sucursal = $request->id_sucursal;
            
            // Si no se envía sede o viene vacía, buscar o crear la sede "General Ibagué"
            if (empty($id_sucursal)) {
                $sedeGeneral = \App\Models\Sucursal::firstOrCreate(
                    ['nombre' => 'General Ibagué'],
                    [
                        'direccion' => 'Ibagué, Tolima', 
                        'telefono' => '0000000',
                        'ciudad' => 'Ibagué'
                    ]
                );
                $id_sucursal = $sedeGeneral->id;
            }

            $user = User::create([
                'nombre' => $request->nombre,
                'email' => $request->email,
                'cedula' => $request->cedula,
                'password' => Hash::make($request->password),
                'id_rol' => $request->id_rol,
                'id_sucursal' => $id_sucursal,
                'id_sucursal_actual' => $id_sucursal,
                'telefono' => $request->telefono ?? '0000000000',
                'direccion' => $request->direccion ?? 'No especificada',
                'activo' => true,
                'estado' => 'activo'
            ]);

            // Asignar rol en la tabla pivote también por compatibilidad
            $user->roles()->attach($request->id_rol);

            // Si es repartidor y se envió un vehículo, asignarlo
            if ($request->filled('vehiculo_id')) {
                Vehiculo::where('id', $request->vehiculo_id)->update([
                    'id_usuario_asignado' => $user->id
                ]);
            }

            return response()->json([
                'message' => 'Usuario registrado con éxito. Acceso habilitado.',
                'user' => $user->load(['role', 'sucursal'])
            ], 201);
        });
    }

    public function update(Request $request, $id)
    {
        $userToUpdate = User::findOrFail($id);
        $currentUser = Auth::user();

        // Seguridad: Admin de sede no puede editar fuera de su sede
        if (!$currentUser->hasRole('Superadmin') && $userToUpdate->id_sucursal !== $currentUser->id_sucursal) {
            return response()->json(['message' => 'No tienes permiso para editar este usuario.'], 403);
        }

        $request->validate([
            'nombre' => 'string|max:255',
            'email' => 'string|email|max:255|unique:users,email,'.$id,
            'cedula' => 'string|unique:users,cedula,'.$id,
            'id_rol' => 'exists:roles,id',
            'id_sucursal' => 'exists:sucursales,id',
            'activo' => 'boolean',
            'vehiculo_id' => 'nullable|exists:vehiculos,id',
        ]);

        return DB::transaction(function () use ($request, $userToUpdate) {
            $userToUpdate->update($request->only([
                'nombre', 'email', 'cedula', 'id_rol', 'id_sucursal', 'activo'
            ]));

            if ($request->has('id_rol')) {
                $userToUpdate->roles()->sync([$request->id_rol]);
            }

            // Gestión de vehículo
            if ($request->has('vehiculo_id')) {
                // Liberar vehículo anterior si existía
                Vehiculo::where('id_usuario_asignado', $userToUpdate->id)->update(['id_usuario_asignado' => null]);
                
                if ($request->vehiculo_id) {
                    Vehiculo::where('id', $request->vehiculo_id)->update(['id_usuario_asignado' => $userToUpdate->id]);
                }
            }

            return response()->json([
                'message' => 'Usuario actualizado con éxito',
                'user' => $userToUpdate->load(['role', 'sucursal'])
            ]);
        });
    }

    public function toggleStatus($id)
    {
        $user = User::findOrFail($id);
        $user->activo = !$user->activo;
        $user->save();

        return response()->json([
            'message' => 'Estado actualizado correctamente',
            'activo' => $user->activo
        ]);
    }

    public function getRoles()
    {
        return response()->json(Role::all());
    }

    public function getSucursales()
    {
        return response()->json(\App\Models\Sucursal::all());
    }

    public function getStats()
    {
        $total = User::count();
        $repartidores = User::whereHas('role', function($q) {
            $q->where('nombre', 'Repartidor');
        })->where('activo', true)->count();
        
        $cajeras = User::whereHas('role', function($q) {
            $q->where('nombre', 'Cajera');
        })->where('activo', true)->count();

        return response()->json([
            'total' => $total,
            'repartidores' => $repartidores,
            'cajeras' => $cajeras
        ]);
    }
}
