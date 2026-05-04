@extends('reports.layout')

@section('title', 'Hoja de Vida Vehicular')
@section('sede', $vehiculo->sede ?? 'Principal')

@section('content')
<div class="title-section">
    <h1>Hoja de Vida Vehicular - Consolidado Operativo</h1>
    <p>Placa: {{ $vehiculo->placa }} | Período: {{ $fecha_inicio }} a {{ $fecha_fin }}</p>
</div>

<table style="margin-bottom: 20px;">
    <tr>
        <td width="33%">
            <strong>Marca/Modelo:</strong> {{ $vehiculo->marca }} {{ $vehiculo->modelo }}<br>
            <strong>Tipo:</strong> {{ $vehiculo->tipo_vehiculo }}
        </td>
        <td width="33%">
            <strong>Kilometraje:</strong> {{ number_format($vehiculo->kilometraje_actual, 0, ',', '.') }} KM<br>
            <strong>SOAT:</strong> {{ $vehiculo->fecha_soat }}
        </td>
        <td width="33%" class="text-right">
            <strong>Tecno:</strong> {{ $vehiculo->fecha_tecnomecanica }}<br>
            <strong>Estado:</strong> <span class="badge bg-navy">{{ strtoupper($vehiculo->estado) }}</span>
        </td>
    </tr>
</table>

<h3>Historial de Checklists e Inspecciones</h3>
<table>
    <thead>
        <tr>
            <th>Fecha</th>
            <th>Conductor</th>
            <th>Estado Gral.</th>
            <th>Observaciones</th>
        </tr>
    </thead>
    <tbody>
        @forelse($checklists as $check)
        <tr>
            <td>{{ $check->fecha->format('d/m/Y') }}</td>
            <td>{{ $check->user->nombre }}</td>
            <td>
                <span style="color: {{ $check->estado_general === 'Bueno' ? 'green' : 'red' }}">
                    {{ $check->estado_general }}
                </span>
            </td>
            <td>{{ $check->observaciones ?: 'Sin observaciones' }}</td>
        </tr>
        @empty
        <tr>
            <td colspan="4" class="text-center">No se registraron inspecciones en este período.</td>
        </tr>
        @endforelse
    </tbody>
</table>

<h3>Novedades y Alertas Críticas</h3>
<table>
    <thead>
        <tr>
            <th>Fecha</th>
            <th>Descripción</th>
            <th>Prioridad</th>
            <th>Estado</th>
        </tr>
    </thead>
    <tbody>
        @php $novedades = $vehiculo->novedades()->whereBetween('created_at', [$fecha_inicio, $fecha_fin])->get(); @endphp
        @forelse($novedades as $nov)
        <tr>
            <td>{{ $nov->created_at->format('d/m/Y') }}</td>
            <td>{{ $nov->descripcion }}</td>
            <td>{{ strtoupper($nov->prioridad) }}</td>
            <td>{{ $nov->estado }}</td>
        </tr>
        @empty
        <tr>
            <td colspan="4" class="text-center">No hay novedades registradas.</td>
        </tr>
        @endforelse
    </tbody>
</table>

<div style="margin-top: 30px; font-size: 10px; color: #64748b; font-style: italic;">
    * Este documento resume la integridad mecánica y operativa del vehículo basándose en los registros digitales de los conductores.
</div>
@endsection
