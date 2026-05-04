<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>@yield('title') - Rapifrios Nexus</title>
    <style>
        @page {
            margin: 100px 25px;
        }
        header {
            position: fixed;
            top: -60px;
            left: 0px;
            right: 0px;
            height: 80px;
            border-bottom: 2px solid #0F172A;
        }
        footer {
            position: fixed; 
            bottom: -60px; 
            left: 0px; 
            right: 0px;
            height: 30px; 
            text-align: center;
            font-size: 10px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            padding-top: 5px;
        }
        body {
            font-family: 'Helvetica', sans-serif;
            font-size: 12px;
            color: #1e293b;
            line-height: 1.5;
        }
        .logo {
            float: left;
            width: 150px;
            font-weight: 900;
            font-size: 24px;
            color: #0F172A;
            letter-spacing: -1px;
            font-style: italic;
        }
        .sede-info {
            float: right;
            text-align: right;
            font-size: 10px;
        }
        .content {
            margin-top: 20px;
        }
        .title-section {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .title-section h1 {
            margin: 0;
            font-size: 18px;
            text-transform: uppercase;
            color: #0F172A;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th {
            background-color: #0F172A;
            color: white;
            text-align: left;
            padding: 8px;
            font-size: 11px;
        }
        td {
            padding: 8px;
            border-bottom: 1px solid #e2e8f0;
        }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .total-row {
            background-color: #f1f5f9;
            font-weight: bold;
        }
        .badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            color: white;
        }
        .bg-navy { background-color: #0F172A; }
    </style>
</head>
<body>
    <header>
        <div class="logo">RAPIFRIOS <span style="color: #3B82F6;">NEXUS</span></div>
        <div class="sede-info">
            <strong>Sede:</strong> @yield('sede', 'Administración Central')<br>
            <strong>Fecha:</strong> {{ now()->format('d/m/Y H:i') }}
        </div>
    </header>

    <footer>
        Documento generado automáticamente por Rapifrios Nexus v3.0 - Página <span class="page-number"></span>
    </footer>

    <main class="content">
        @yield('content')
    </main>

    <script type="text/php">
        if ( isset($pdf) ) {
            $font = $fontMetrics->get_font("helvetica", "bold");
            $pdf->page_text(520, 770, "{PAGE_NUM} de {PAGE_COUNT}", $font, 10, array(0.5, 0.5, 0.5));
        }
    </script>
</body>
</html>
