<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Hoja de Vida Vehicular - {{ $vehiculo->placa }}</title>
    <style>
        /* CSS Reset & Configuración Básica de Dompdf */
        @page {
            margin: 40px 50px;
        }
        
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            font-size: 11px;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }

        /* Utilidades de Colores */
        .text-navy { color: #0a2540; }
        .bg-navy { bg-color: #0a2540; }
        .text-muted { color: #64748b; }
        
        /* Contenedores Principales */
        .header-table {
            width: 100%;
            border-bottom: 3px solid #0a2540;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }

        .logo-title-cell {
            vertical-align: middle;
        }

        .title-main {
            font-size: 20px;
            font-weight: 800;
            color: #0a2540;
            text-transform: uppercase;
            letter-spacing: -0.5px;
            margin: 0;
        }

        .subtitle-main {
            font-size: 10px;
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 2px 0 0 0;
        }

        .meta-cell {
            text-align: right;
            vertical-align: middle;
            font-size: 9px;
            color: #64748b;
        }

        .meta-value {
            font-weight: bold;
            color: #0a2540;
        }

        /* Sección de Grid con Tablas */
        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #0a2540;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }

        .data-table td {
            padding: 8px 10px;
            border: 1px solid #e2e8f0;
            vertical-align: middle;
        }

        .label-cell {
            background-color: #f8fafc;
            font-weight: bold;
            color: #475569;
            width: 20%;
            text-transform: uppercase;
            font-size: 9px;
            letter-spacing: 0.2px;
        }

        .value-cell {
            color: #0f172a;
            font-weight: 500;
            width: 30%;
        }

        /* Placa Badge Estilo Premium */
        .placa-badge {
            background-color: #fef3c7;
            border: 1px dashed #d97706;
            color: #b45309;
            font-size: 14px;
            font-weight: 900;
            padding: 2px 8px;
            display: inline-block;
            border-radius: 4px;
            text-align: center;
            letter-spacing: 0.5px;
        }

        .badge-activo {
            background-color: #dcfce7;
            color: #15803d;
            border: 1px solid #bbf7d0;
            font-weight: bold;
            font-size: 9px;
            padding: 2px 6px;
            border-radius: 3px;
            text-transform: uppercase;
        }

        .badge-inactivo {
            background-color: #fee2e2;
            color: #b91c1c;
            border: 1px solid #fecaca;
            font-weight: bold;
            font-size: 9px;
            padding: 2px 6px;
            border-radius: 3px;
            text-transform: uppercase;
        }

        /* Alertas de Mantenimiento */
        .alert-card {
            border-left: 4px solid #0a2540;
            background-color: #f8fafc;
            padding: 10px 15px;
            margin-bottom: 25px;
            border-top: 1px solid #e2e8f0;
            border-right: 1px solid #e2e8f0;
            border-bottom: 1px solid #e2e8f0;
        }

        .alert-card-title {
            font-weight: bold;
            font-size: 10px;
            color: #0a2540;
            margin-bottom: 3px;
            text-transform: uppercase;
        }

        .footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
            font-size: 8px;
            color: #94a3b8;
        }
    </style>
</head>
<body>

    <!-- Encabezado Corporativo -->
    <table class="header-table">
        <tr>
            <td class="logo-title-cell">
                <h1 class="title-main">RAPIFRIOS LTDA</h1>
                <p class="subtitle-main">Hoja de Vida de Vehículo de Flota</p>
            </td>
            <td class="meta-cell">
                Fecha de Emisión: <span class="meta-value">{{ now()->format('d/m/Y') }}</span><br>
                Hora de Emisión: <span class="meta-value">{{ now()->format('h:i A') }}</span><br>
                ID Registro: <span class="meta-value">NEXUS-V-{{ str_pad($vehiculo->id ?? '0', 4, '0', STR_PAD_LEFT) }}</span>
            </td>
        </tr>
    </table>

    <!-- Estado Logístico Rápido -->
    <div class="alert-card" style="border-left-color: {{ $vehiculo->estado == 'Activo' ? '#10b981' : '#ef4444' }};">
        <div class="alert-card-title">Resumen de Salud y Disponibilidad Logística</div>
        <div>
            Vehículo actualmente asignado a la sede <span style="font-weight: bold; color: #0a2540;">{{ $vehiculo->sede ?? 'Principal' }}</span>. 
            SOAT y Revisión Tecnomecánica vigentes según auditoría Nexus. 
            El estado de operación diaria se encuentra catalogado como: 
            <span class="{{ $vehiculo->estado == 'Activo' ? 'badge-activo' : 'badge-inactivo' }}">{{ $vehiculo->estado ?? 'Desconocido' }}</span>.
        </div>
    </div>

    <!-- Sección 1: Información General del Vehículo -->
    <div class="section-title">1. Especificaciones Técnicas y de Identidad</div>
    <table class="data-table">
        <tr>
            <td class="label-cell">Placa Vehicular</td>
            <td class="value-cell"><span class="placa-badge">{{ $vehiculo->placa }}</span></td>
            <td class="label-cell">Tipo de Vehículo</td>
            <td class="value-cell">{{ $vehiculo->tipo_vehiculo ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td class="label-cell">Marca / Fabricante</td>
            <td class="value-cell">{{ $vehiculo->marca ?? 'N/A' }}</td>
            <td class="label-cell">Modelo / Año</td>
            <td class="value-cell">{{ $vehiculo->modelo ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td class="label-cell">Cilindraje Motor</td>
            <td class="value-cell">{{ $vehiculo->cilindraje ?? 'N/A' }}</td>
            <td class="label-cell">Capacidad de Carga</td>
            <td class="value-cell">{{ $vehiculo->capacidad_carga ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td class="label-cell">Sede Operativa</td>
            <td class="value-cell">{{ $vehiculo->sede ?? 'General' }}</td>
            <td class="label-cell">Estado Operativo</td>
            <td class="value-cell">
                <span class="{{ $vehiculo->estado == 'Activo' ? 'badge-activo' : 'badge-inactivo' }}">{{ $vehiculo->estado ?? 'Inactivo' }}</span>
            </td>
        </tr>
    </table>

    <!-- Sección 2: Control de Mantenimientos y Kilometraje -->
    <div class="section-title">2. Métricas de Odómetro y Control Mecánico</div>
    <table class="data-table">
        <tr>
            <td class="label-cell">Kilometraje Actual</td>
            <td class="value-cell" style="font-weight: bold; color: #0a2540;">
                {{ number_format($vehiculo->kilometraje_actual ?? 0, 0, ',', '.') }} KM
            </td>
            <td class="label-cell">Último Mantenimiento</td>
            <td class="value-cell">
                {{ number_format($vehiculo->km_ultimo_mantenimiento ?? 0, 0, ',', '.') }} KM
            </td>
        </tr>
        <tr>
            <td class="label-cell">Frecuencia Programada</td>
            <td class="value-cell">Cada {{ number_format($vehiculo->frecuencia_mantenimiento ?? 5000, 0, ',', '.') }} KM</td>
            <td class="label-cell">KM Recorridos desde Último</td>
            <td class="value-cell">
                @php
                    $recorridos = ($vehiculo->kilometraje_actual ?? 0) - ($vehiculo->km_ultimo_mantenimiento ?? 0);
                    $recorridos = $recorridos < 0 ? 0 : $recorridos;
                @endphp
                {{ number_format($recorridos, 0, ',', '.') }} KM
            </td>
        </tr>
    </table>

    <!-- Sección 3: Documentación Legal y Vencimientos -->
    <div class="section-title">3. Estado de Documentación Legal (Semáforo de Vencimiento)</div>
    <table class="data-table">
        <tr>
            <td class="label-cell">Vencimiento SOAT</td>
            <td class="value-cell" style="font-weight: bold; color: {{ now()->parse($vehiculo->fecha_soat)->isPast() ? '#b91c1c' : '#0f172a' }};">
                {{ $vehiculo->fecha_soat ? now()->parse($vehiculo->fecha_soat)->format('d/m/Y') : 'Pendiente de Registro' }}
                @if($vehiculo->fecha_soat && now()->parse($vehiculo->fecha_soat)->isPast())
                    <span style="color: #b91c1c; font-size: 8px;">(VENCIDO)</span>
                @endif
            </td>
            <td class="label-cell">Vencimiento Tecnomecánica</td>
            <td class="value-cell" style="font-weight: bold; color: {{ now()->parse($vehiculo->fecha_tecnomecanica)->isPast() ? '#b91c1c' : '#0f172a' }};">
                {{ $vehiculo->fecha_tecnomecanica ? now()->parse($vehiculo->fecha_tecnomecanica)->format('d/m/Y') : 'Pendiente de Registro' }}
                @if($vehiculo->fecha_tecnomecanica && now()->parse($vehiculo->fecha_tecnomecanica)->isPast())
                    <span style="color: #b91c1c; font-size: 8px;">(VENCIDO)</span>
                @endif
            </td>
        </tr>
    </table>

    <!-- Firma y Pie de Página Corporativo -->
    <div class="footer">
        Documento oficial emitido automáticamente por **Rapifrios Nexus Torre de Control** a solicitud del Super Administrador.<br>
        © {{ date('Y') }} Rapifrios Ltda. Todos los derechos reservados. Tecnología e Integridad Sub-Zero.
    </div>

</body>
</html>
