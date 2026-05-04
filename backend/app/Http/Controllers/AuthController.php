<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Sucursal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales son incorrectas.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load(['roles', 'sucursalActual']),
            'sucursales' => Sucursal::all()
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada correctamente']);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load(['roles', 'sucursalActual']),
            'sucursales' => Sucursal::all()
        ]);
    }

    public function updateSede(Request $request)
    {
        $request->validate([
            'id_sucursal' => 'required|exists:sucursales,id'
        ]);

        $user = $request->user();
        $user->id_sucursal_actual = $request->id_sucursal;
        $user->save();

        return response()->json([
            'message' => 'Sede actualizada correctamente',
            'user' => $user->load(['roles', 'sucursalActual'])
        ]);
    }
}
