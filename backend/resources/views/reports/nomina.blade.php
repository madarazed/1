@extends('reports.layout')

@section('title', 'Desprendible de Pago')
@section('sede', $nomina->user->sede ?? 'Principal')

@section('content')
<div class="title-section">
    <h1>Comprobante de Pago de Nómina</h1>
    <p>Periodo: {{ $nomina->periodo }}</p>
</div>

<table style="margin-bottom: 30px;">
    <tr>
        <td width="50%">
            <strong>Empleado:</strong> {{ $nomina->user->nombre }}<br>
            <strong>Cédula:</strong> {{ $nomina->user->cedula ?? 'N/A' }}<br>
            <strong>Cargo:</strong> {{ $nomina->user->roles->first()->nombre ?? 'Empleado' }}
        </td>
        <td width="50%" class="text-right">
            <strong>Estado:</strong> <span class="badge bg-navy">{{ strtoupper($nomina->estado) }}</span><br>
            <strong>ID Nómina:</strong> #{{ str_pad($nomina->id, 6, '0', STR_PAD_LEFT) }}
        </td>
    </tr>
</table>

<h3>Resumen de Devengados</h3>
<table>
    <thead>
        <tr>
            <th>Concepto</th>
            <th class="text-right">Valor</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Salario Base (Proporcional a {{ $nomina->dias_trabajados }} días)</td>
            <td class="text-right">${{ number_format($nomina->salario_base, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td>Auxilio de Transporte (Legislación 2026)</td>
            <td class="text-right">${{ number_format($nomina->auxilio_transporte, 0, ',', '.') }}</td>
        </tr>
        @if($nomina->horas_extra > 0)
        <tr>
            <td>Horas Extra y Recargos</td>
            <td class="text-right">${{ number_format($nomina->horas_extra, 0, ',', '.') }}</td>
        </tr>
        @endif
        @if($nomina->bonificaciones > 0)
        <tr>
            <td>Bonificaciones Especiales</td>
            <td class="text-right">${{ number_format($nomina->bonificaciones, 0, ',', '.') }}</td>
        </tr>
        @endif
        <tr class="total-row">
            <td>TOTAL DEVENGADO</td>
            <td class="text-right">${{ number_format($nomina->total_devengado, 0, ',', '.') }}</td>
        </tr>
    </tbody>
</table>

<h3>Deducciones de Ley</h3>
<table>
    <thead>
        <tr>
            <th>Concepto</th>
            <th class="text-right">Valor</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Aporte Salud (4%)</td>
            <td class="text-right">-${{ number_format($nomina->salud, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td>Aporte Pensión (4%)</td>
            <td class="text-right">-${{ number_format($nomina->pension, 0, ',', '.') }}</td>
        </tr>
        @if($nomina->otras_deducciones > 0)
        <tr>
            <td>Otras Deducciones / Préstamos</td>
            <td class="text-right">-${{ number_format($nomina->otras_deducciones, 0, ',', '.') }}</td>
        </tr>
        @endif
        <tr class="total-row">
            <td>TOTAL DEDUCCIONES</td>
            <td class="text-right">-${{ number_format($nomina->total_deducciones, 0, ',', '.') }}</td>
        </tr>
    </tbody>
</table>

<div style="background-color: #0F172A; color: white; padding: 20px; border-radius: 8px; margin-top: 30px;">
    <table style="margin: 0; color: white;">
        <tr>
            <td style="border: none; font-size: 20px; font-weight: 900;">NETO A PAGAR:</td>
            <td style="border: none; font-size: 20px; font-weight: 900;" class="text-right">${{ number_format($nomina->neto_pagar, 0, ',', '.') }} COP</td>
        </tr>
    </table>
</div>

<div style="margin-top: 50px;">
    <table style="border: none;">
        <tr>
            <td style="border: none; width: 45%; border-top: 1px solid #1e293b; text-align: center;">
                Firma del Empleado<br>
                <small>C.C. ___________________</small>
            </td>
            <td style="border: none; width: 10%;"></td>
            <td style="border: none; width: 45%; border-top: 1px solid #1e293b; text-align: center;">
                Autorizado por Rapifrios Nexus<br>
                <small>Área de Talento Humano</small>
            </td>
        </tr>
    </table>
</div>
@endsection
