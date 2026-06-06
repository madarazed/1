<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Mantenimientos - {{ $vehiculo->placa }}</title>
    <style>
        @page { margin: 40px 50px; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; font-size: 11px; }
        .text-navy { color: #0a2540; }
        .header-table { width: 100%; border-bottom: 3px solid #0a2540; padding-bottom: 12px; margin-bottom: 20px; }
        .title-main { font-size: 20px; font-weight: 800; color: #0a2540; margin: 0; text-transform: uppercase; }
        .subtitle-main { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
        .meta-cell { text-align: right; font-size: 9px; color: #64748b; vertical-align: middle; }
        .meta-value { font-weight: bold; color: #0a2540; }
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .data-table th { background-color: #0a2540; color: white; padding: 10px; text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; }
        .data-table td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
        .badge-prev { color: #0369a1; font-weight: 900; background-color: #e0f2fe; padding: 2px 6px; border-radius: 3px; font-size: 9px; }
        .badge-corr { color: #b45309; font-weight: 900; background-color: #fef3c7; padding: 2px 6px; border-radius: 3px; font-size: 9px; }
        .total-row td { background-color: #f8fafc; font-weight: bold; font-size: 10px; color: #0a2540; border-top: 2px solid #0a2540; }
        .footer { position: absolute; bottom: 0; width: 100%; text-align: center; font-size: 8px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
    </style>
</head>
<body>

    <table class="header-table">
        <tr>
            <td>
                <h1 class="title-main">RAPIFRIOS LTDA</h1>
                <p class="subtitle-main">Historial de Mantenimientos y Costos</p>
            </td>
            <td class="meta-cell">
                Placa Vehicular: <span class="meta-value">{{ $vehiculo->placa }}</span><br>
                Rango de Consulta: <span class="meta-value">{{ \Carbon\Carbon::parse($fechaInicio)->format('d/m/Y') }} al {{ \Carbon\Carbon::parse($fechaFin)->format('d/m/Y') }}</span><br>
                Generado el: <span class="meta-value">{{ now()->format('d/m/Y h:i A') }}</span>
            </td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 12%;">FECHA</th>
                <th style="width: 15%;">TIPO</th>
                <th style="width: 20%;">TALLER / PROVEEDOR</th>
                <th style="width: 38%;">DETALLE TÉCNICO</th>
                <th style="width: 15%; text-align: right;">COSTO</th>
            </tr>
        </thead>
        <tbody>
            @php $totalCosto = 0; @endphp
            @foreach($mantenimientos as $mant)
            @php $totalCosto += $mant['costo']; @endphp
            <tr>
                <td style="font-weight: bold; color: #475569;">{{ \Carbon\Carbon::parse($mant['fecha'])->format('d/m/Y') }}</td>
                <td>
                    <span class="{{ $mant['tipo'] == 'Preventivo' ? 'badge-prev' : 'badge-corr' }}">
                        {{ strtoupper($mant['tipo']) }}
                    </span>
                </td>
                <td>{{ $mant['taller'] }}</td>
                <td style="color: #475569;">{{ $mant['detalle'] }}</td>
                <td style="text-align: right; font-weight: bold;">${{ number_format($mant['costo'], 0, ',', '.') }}</td>
            </tr>
            @endforeach
            <tr class="total-row">
                <td colspan="4" style="text-align: right;">INVERSIÓN TOTAL EN MANTENIMIENTO:</td>
                <td style="text-align: right;">${{ number_format($totalCosto, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>
    
    <div class="footer">
        Documento oficial emitido por Rapifrios Nexus Torre de Control.<br>
        © {{ date('Y') }} Rapifrios Ltda. Todos los derechos reservados.
    </div>

</body>
</html>
