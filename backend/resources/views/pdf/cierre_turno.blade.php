<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Cierre Logístico</title>
    <style>
        @page { margin: 40px 50px; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; font-size: 11px; }
        .header-table { width: 100%; border-bottom: 3px solid #0a2540; padding-bottom: 12px; margin-bottom: 25px; }
        .title-main { font-size: 20px; font-weight: 800; color: #0a2540; margin: 0; text-transform: uppercase; }
        .subtitle-main { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
        .meta-cell { text-align: right; font-size: 9px; color: #64748b; vertical-align: middle; }
        .meta-value { font-weight: bold; color: #0a2540; }

        .kpi-table { width: 100%; border-collapse: separate; border-spacing: 15px; margin-bottom: 20px; margin-top: -10px; }
        .kpi-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px 15px; text-align: center; width: 33.33%; vertical-align: middle; }
        .kpi-title { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 8px; }
        .kpi-value { font-size: 26px; font-weight: 900; color: #0a2540; }
        .kpi-value.danger { color: #dc2626; }
        .kpi-value.success { color: #16a34a; }

        .section-title { font-size: 12px; font-weight: bold; color: #0a2540; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 10px; }
        
        .alert-box { background-color: #e0f2fe; border-left: 4px solid #0284c7; padding: 12px 15px; margin-top: 10px; font-size: 10px; color: #0c4a6e; line-height: 1.5; }

        .footer { position: absolute; bottom: 0; width: 100%; text-align: center; font-size: 8px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td>
                <h1 class="title-main">RAPIFRIOS LTDA</h1>
                <p class="subtitle-main">Reporte Global: Cierre Logístico de Turno</p>
            </td>
            <td class="meta-cell">
                Rango Operativo: <span class="meta-value">{{ \Carbon\Carbon::parse($fechaInicio)->format('d/m/Y') }} al {{ \Carbon\Carbon::parse($fechaFin)->format('d/m/Y') }}</span><br>
                Generado el: <span class="meta-value">{{ now()->format('d/m/Y h:i A') }}</span><br>
                Auditor: <span class="meta-value">Super Administrador</span>
            </td>
        </tr>
    </table>

    <div class="section-title">Métricas de Rendimiento General (KPIs)</div>
    
    <table class="kpi-table">
        <tr>
            <td class="kpi-card">
                <div class="kpi-title">Entregas Exitosas</div>
                <div class="kpi-value success">{{ number_format($metricas['entregas_completadas'] ?? 0, 0, ',', '.') }}</div>
            </td>
            <td class="kpi-card">
                <div class="kpi-title">Entregas Fallidas</div>
                <div class="kpi-value danger">{{ number_format($metricas['entregas_fallidas'] ?? 0, 0, ',', '.') }}</div>
            </td>
            <td class="kpi-card">
                <div class="kpi-title">Vehículos Activos</div>
                <div class="kpi-value">{{ number_format($metricas['vehiculos_activos'] ?? 0, 0, ',', '.') }}</div>
            </td>
        </tr>
        <tr>
            <td class="kpi-card">
                <div class="kpi-title">Combustible (Galones)</div>
                <div class="kpi-value">{{ number_format($metricas['galones_combustible'] ?? 0, 1, ',', '.') }}</div>
            </td>
            <td class="kpi-card">
                <div class="kpi-title">Incidencias Reportadas</div>
                <div class="kpi-value {{ ($metricas['incidencias_reportadas'] ?? 0) > 0 ? 'danger' : 'success' }}">{{ number_format($metricas['incidencias_reportadas'] ?? 0, 0, ',', '.') }}</div>
            </td>
            <td class="kpi-card" style="background-color: transparent; border: none;">
            </td>
        </tr>
    </table>

    <div class="alert-box">
        <strong>Nota de Auditoría Operativa:</strong> Las métricas presentadas en este informe global consolidan la actividad registrada por la flota de distribución durante el periodo seleccionado. Este cierre es un registro inmutable y sirve como constancia legal y directiva de la operación diaria.
    </div>

    <div class="footer">
        Documento oficial emitido por Rapifrios Nexus Torre de Control.<br>
        © {{ date('Y') }} Rapifrios Ltda. Todos los derechos reservados.
    </div>
</body>
</html>
