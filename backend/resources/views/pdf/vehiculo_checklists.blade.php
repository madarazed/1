<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Checklists - {{ $vehiculo->placa }}</title>
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
        .badge-ok { color: #15803d; font-weight: 900; background-color: #dcfce7; padding: 2px 6px; border-radius: 3px; font-size: 9px; }
        .badge-warn { color: #b91c1c; font-weight: 900; background-color: #fee2e2; padding: 2px 6px; border-radius: 3px; font-size: 9px; }
        .footer { position: absolute; bottom: 0; width: 100%; text-align: center; font-size: 8px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
    </style>
</head>
<body>

    <table class="header-table">
        <tr>
            <td>
                <h1 class="title-main">RAPIFRIOS LTDA</h1>
                <p class="subtitle-main">Auditoría de Checklists Preoperacionales</p>
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
                <th style="width: 15%;">FECHA</th>
                <th style="width: 25%;">INSPECTOR</th>
                <th style="width: 20%;">ESTADO GENERAL</th>
                <th style="width: 40%;">NOVEDADES / OBSERVACIONES</th>
            </tr>
        </thead>
        <tbody>
            @foreach($checklists as $check)
            <tr>
                <td style="font-weight: bold; color: #475569;">{{ \Carbon\Carbon::parse($check['fecha'])->format('d/m/Y') }}</td>
                <td>{{ $check['inspector'] }}</td>
                <td>
                    <span class="{{ $check['estado_general'] == 'Óptimo' ? 'badge-ok' : 'badge-warn' }}">
                        {{ strtoupper($check['estado_general']) }}
                    </span>
                </td>
                <td style="color: {{ $check['novedades'] == 'Ninguna' ? '#94a3b8' : '#0f172a' }};">
                    {{ $check['novedades'] }}
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
    
    <div class="footer">
        Documento oficial emitido por Rapifrios Nexus Torre de Control.<br>
        © {{ date('Y') }} Rapifrios Ltda. Todos los derechos reservados.
    </div>

</body>
</html>
