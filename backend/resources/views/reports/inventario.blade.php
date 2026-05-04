@extends('reports.layout')

@section('title', 'Reporte de Inventario')
@section('sede', $sede ?? 'Global')

@section('content')
<div class="title-section">
    <h1>Cierre de Inventario de Sede</h1>
    <p>Consolidado de Existencias al {{ now()->format('d/m/Y') }}</p>
</div>

<table>
    <thead>
        <tr>
            <th>Producto</th>
            <th>Marca</th>
            <th>Categoría</th>
            <th class="text-right">Stock</th>
            <th class="text-right">Precio Unit.</th>
            <th class="text-right">Valor Total</th>
        </tr>
    </thead>
    <tbody>
        @php $granTotal = 0; @endphp
        @foreach($productos as $prod)
        @php $valorStock = $prod->precio * $prod->stock; $granTotal += $valorStock; @endphp
        <tr>
            <td>{{ $prod->nombre }}</td>
            <td>{{ $prod->marca->nombre ?? 'N/A' }}</td>
            <td>{{ $prod->categoria->nombre ?? 'Sin Categoría' }}</td>
            <td class="text-right">{{ $prod->stock }}</td>
            <td class="text-right">${{ number_format($prod->precio, 0, ',', '.') }}</td>
            <td class="text-right">${{ number_format($valorStock, 0, ',', '.') }}</td>
        </tr>
        @endforeach
        <tr class="total-row">
            <td colspan="5" class="text-right">VALOR TOTAL DEL INVENTARIO</td>
            <td class="text-right">${{ number_format($granTotal, 0, ',', '.') }} COP</td>
        </tr>
    </tbody>
</table>

<div style="margin-top: 100px;">
    <div style="width: 300px; border-top: 1px solid #1e293b; text-align: center; margin: 0 auto;">
        Firma del Responsable de Inventario<br>
        <strong>{{ auth()->user()->nombre }}</strong><br>
        <small>Certificación Digital Rapifrios Nexus</small>
    </div>
</div>
@endsection
