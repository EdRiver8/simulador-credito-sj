// main.js

// Utilidades de formato
function formatCurrency(value) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(value);
}
function formatNumber(value) {
    return new Intl.NumberFormat('es-CO').format(value);
}

// Frecuencias de pago
function getPaymentFrequency(frequency) {
    const frequencies = {
        monthly: 12,
        bimonthly: 6,
        quarterly: 4,
        semiannual: 2
    };
    return frequencies[frequency] || 12;
}

function calculatePeriodRate(annualRate, frequency) {
    const periodsPerYear = getPaymentFrequency(frequency);
    return Math.pow(1 + (annualRate / 100), 1 / periodsPerYear) - 1;
}

// Manejo de seguros dinámicos
function getTotalInsurance() {
    let insurance = 0;
    document.querySelectorAll('.insurance-item input.insurance-value').forEach(input => {
        insurance += getCleanNumber(input);
    });
    return insurance;
}

// Lógica para agregar/eliminar seguros dinámicos
function createInsuranceItem(name = '', value = '') {
    const div = document.createElement('div');
    div.className = 'insurance-item';
    div.innerHTML = `
        <input type="text" class="insurance-name" placeholder="Nombre del seguro" value="${name}">
        <input type="text" class="insurance-value" placeholder="20.000" value="${value}">
        <button type="button" class="remove-insurance" title="Eliminar">✕</button>
    `;
    div.querySelector('.remove-insurance').onclick = () => {
        div.remove();
        checkInsuranceListEmpty();
    };
    return div;
}

function checkInsuranceListEmpty() {
    const list = document.getElementById('insurance-list');
    if (list.children.length === 0) {
        list.classList.add('empty');
        list.innerHTML = 'Agrega uno o más seguros opcionales';
    } else {
        list.classList.remove('empty');
    }
}

document.getElementById('add-insurance').addEventListener('click', function() {
    const list = document.getElementById('insurance-list');
    if (list.classList.contains('empty')) {
        list.innerHTML = '';
        list.classList.remove('empty');
    }
    list.appendChild(createInsuranceItem());
});

// Formateo en vivo de separador de miles para inputs numéricos
function formatInputThousands(input) {
    // Guarda la posición original del cursor
    let selectionStart = input.selectionStart;
    let oldLength = input.value.length;
    // Elimina todo lo que no sea dígito
    let value = input.value.replace(/\D/g, '');
    if (!value) {
        input.value = '';
        return;
    }
    // Formatea con separador de miles
    input.value = Number(value).toLocaleString('es-CO');
    // Calcula la nueva posición del cursor
    let newLength = input.value.length;
    // Ajuste: si el usuario está escribiendo al final, deja el cursor al final
    if (selectionStart === oldLength) {
        selectionStart = newLength;
    } else {
        // Si el usuario edita en el medio, calcula la nueva posición
        let diff = newLength - oldLength;
        selectionStart += diff;
        if (selectionStart < 0) selectionStart = 0;
        if (selectionStart > newLength) selectionStart = newLength;
    }
    setTimeout(() => input.setSelectionRange(selectionStart, selectionStart), 0);
}

// Cambiar el input de amount a type="text" y usar placeholder en vez de value
const amountInput = document.getElementById('amount');
amountInput.type = 'text';
amountInput.placeholder = '150.000.000';
amountInput.value = '';

// Cambiar los inputs de tasa de interes y numero de pagos a type="text" y usar placeholder en vez de value
const rateInput = document.getElementById('rate');
rateInput.type = 'text';
rateInput.placeholder = '10';
rateInput.value = '';
const termInput = document.getElementById('term');
termInput.type = 'text';
termInput.placeholder = '180';
termInput.value = '';

// Para los campos de valor en insurance-item (dinámicos)
document.getElementById('insurance-list').addEventListener('input', function(e) {
    if (e.target?.classList.contains('insurance-value')) {
        const cursor = e.target.selectionStart;
        formatInputThousands(e.target);
        e.target.setSelectionRange(cursor, cursor);
    }
});
document.getElementById('insurance-list').addEventListener('focusout', function(e) {
    if (e.target?.classList.contains('insurance-value')) {
        formatInputThousands(e.target);
    }
});
document.getElementById('insurance-list').addEventListener('focusin', function(e) {
    if (e.target?.classList.contains('insurance-value')) {
        e.target.value = e.target.value.replace(/\D/g, '');
    }
});

// Al leer los valores para el cálculo, quitar separadores
function getCleanNumber(input) {
    return Number(String(input.value).replace(/\D/g, '')) || 0;
}

// Evento principal de cálculo

document.getElementById('amortization-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const loanAmount = getCleanNumber(document.getElementById('amount'));
    const interestRate = Number(document.getElementById('rate').value);
    const numberOfPayments = Number(document.getElementById('term').value);
    const paymentFrequency = document.getElementById('frequency').value;
    // Leer el total de seguros dinámicos
    const totalInsurance = getTotalInsurance();

    if (loanAmount <= 0 || interestRate <= 0 || numberOfPayments <= 0) {
        document.getElementById('results').innerHTML = '<p>Por favor, ingresa todos los valores correctamente.</p>';
        return;
    }

    // Calcular tasa del período
    const periodRate = calculatePeriodRate(interestRate, paymentFrequency);
    // Cuota base (PMT)
    const payment = (loanAmount * periodRate * Math.pow(1 + periodRate, numberOfPayments)) /
        (Math.pow(1 + periodRate, numberOfPayments) - 1);
    // Cuota total
    const totalPayment = payment + totalInsurance;

    // Mostrar resumen
    let periodicidadLabel = '';
    if (paymentFrequency === 'monthly') periodicidadLabel = 'Mensual';
    else if (paymentFrequency === 'bimonthly') periodicidadLabel = 'Bimestral';
    else if (paymentFrequency === 'quarterly') periodicidadLabel = 'Trimestral';
    else periodicidadLabel = 'Semestral';
    document.getElementById('summary').innerHTML = `
        <div class="summary-panel">
            <h3>Resumen de la Cuota</h3>
            <div class="summary-row"><span>Cuota Base:</span> <span>${formatCurrency(payment)}</span></div>
            <div class="summary-row"><span>Total Seguros:</span> <span>${formatCurrency(totalInsurance)}</span></div>
            <div class="summary-total">Cuota Total: ${formatCurrency(totalPayment)}</div>
            <div class="period-info">
                <p>Periodicidad: <b>${periodicidadLabel}</b></p>
                <p>Tasa del período: <b>${(periodRate * 100).toFixed(4)}%</b></p>
            </div>
        </div>
    `;

    // Generar tabla de amortización homogénea
    let table = [];
    let remainingBalance = loanAmount;
    let totalInterestPaid = 0;
    let totalCapitalPaid = 0;
    let totalInsurancePaid = 0;

    // Fila inicial
    table.push({
        period: 0,
        initialBalance: 0,
        payment: 0,
        interestPayment: 0,
        capitalPayment: 0,
        insurancePayment: 0,
        extraPayment: 0,
        totalPayment: 0,
        remainingBalance: loanAmount
    });

    for (let i = 1; i <= numberOfPayments; i++) {
        const initialBalance = remainingBalance;
        const interestPayment = remainingBalance * periodRate;
        const capitalPayment = payment - interestPayment;
        const insurancePayment = totalInsurance;
        const extraPayment = 0;
        const totalPeriodPayment = payment + insurancePayment + extraPayment;
        remainingBalance = remainingBalance - capitalPayment;
        if (remainingBalance < 1) remainingBalance = 0;
        totalInterestPaid += interestPayment;
        totalCapitalPaid += capitalPayment;
        totalInsurancePaid += insurancePayment;
        table.push({
            period: i,
            initialBalance,
            payment,
            interestPayment,
            capitalPayment,
            insurancePayment,
            extraPayment,
            totalPayment: totalPeriodPayment,
            remainingBalance
        });
        if (remainingBalance <= 0) break;
    }

    // Renderizar tabla homogénea reutilizando función
    const columns = [
        'period', 'initialBalance', 'payment', 'interestPayment', 'capitalPayment', 'insurancePayment', 'totalPayment', 'remainingBalance'
    ];
    document.getElementById('results').innerHTML = renderAmortizationTable({
        rows: table,
        columns,
        showAbono: false
    });

    // Totales homogéneos reutilizando función
    document.getElementById('totals').innerHTML = renderExtraTotals(
        totalInterestPaid,
        totalCapitalPaid,
        totalInsurancePaid
    );
});

// --- Renderizado homogéneo de tabla de amortización principal ---
// --- Función utilitaria para renderizar tablas de amortización homogéneas ---
function renderAmortizationTable({
    rows,
    columns,
    maxRows = 20,
    showAbono = false
}) {
    // Definir encabezados y claves
    const headers = [
        { label: '# Cuota', key: 'period' },
        { label: 'Saldo Inicial', key: 'initialBalance' },
        { label: 'Valor Cuota', key: 'payment' },
        { label: 'Pago Interés', key: 'interestPayment' },
        { label: 'Pago Capital', key: 'capitalPayment' },
        { label: 'Abono Extra', key: 'extraPayment' },
        { label: 'Seguros', key: 'insurancePayment' },
        { label: 'Total Cuota', key: 'totalPayment' },
        { label: 'Saldo Deuda', key: 'remainingBalance' }
    ];
    // Filtrar columnas según configuración
    let visibleHeaders = headers.filter(h => columns.includes(h.key));
    // Renderizar tabla
    let html = `<div class="table-scroll" style="max-height:420px;overflow:auto;margin-bottom:32px;"><table class="amortization-table"><thead><tr>`;
    visibleHeaders.forEach(h => {
        html += `<th>${h.label}</th>`;
    });
    html += `</tr></thead><tbody>`;
    rows.slice(0, maxRows).forEach(row => {
        html += `<tr${row.period === 0 ? ' class="init-row"' : ''}>`;
        visibleHeaders.forEach(h => {
            let val = row[h.key] ?? '';
            if (h.key === 'extraPayment' && !showAbono) val = '';
            if (['initialBalance','payment','interestPayment','capitalPayment','insurancePayment','totalPayment','remainingBalance','extraPayment'].includes(h.key)) {
                val = val ? formatNumber(Math.round(val)) : '0';
            }
            html += `<td>${val}</td>`;
        });
        html += `</tr>`;
    });
    if (rows.length > maxRows) {
        html += `<tr><td colspan="${visibleHeaders.length}" class="more-rows">... y ${rows.length - maxRows} filas más</td></tr>`;
    }
    html += '</tbody></table></div>';
    return html;
}

// --- Lógica UI para el simulador de abono extra ---
const extraType = document.getElementById('extra-type');
const extraCapitalOptions = document.getElementById('extra-capital-options');
const extraPeriodRow = document.getElementById('extra-period-row');

extraType.addEventListener('change', function() {
    if (this.value === 'capital') {
        extraCapitalOptions.style.display = '';
        const mode = document.getElementById('extra-capital-mode').value;
        if (mode === 'periodo') {
            extraPeriodRow.style.display = '';
        } else {
            extraPeriodRow.style.display = 'none';
        }
    } else {
        extraCapitalOptions.style.display = 'none';
        extraPeriodRow.style.display = 'none';
    }
});
document.getElementById('extra-capital-mode').addEventListener('change', function() {
    if (this.value === 'periodo') {
        extraPeriodRow.style.display = '';
    } else {
        extraPeriodRow.style.display = 'none';
    }
});

// --- Lógica de simulador de abono extra ---
function getExtraCleanNumber(input) {
    return Number(String(input.value).replace(/\D/g, '')) || 0;
}

function getExtraFormValues() {
    return {
        tipo: document.getElementById('extra-type').value,
        cuotaInicio: getExtraCleanNumber(document.getElementById('extra-start')),
        valorAbono: getExtraCleanNumber(document.getElementById('extra-value')),
        modoCapital: document.getElementById('extra-capital-mode').value,
        cuotaFin: getExtraCleanNumber(document.getElementById('extra-period-end'))
    };
}

function calcularAbonoExtra(e) {
    e.preventDefault();
    const valores = getExtraFormValues();
    // Obtener datos del crédito actual
    const loanAmount = getCleanNumber(document.getElementById('amount'));
    const interestRate = Number(document.getElementById('rate').value);
    const numberOfPayments = Number(document.getElementById('term').value);
    const paymentFrequency = document.getElementById('frequency').value;
    const totalInsurance = getTotalInsurance();
    if (loanAmount <= 0 || interestRate <= 0 || numberOfPayments <= 0 || valores.cuotaInicio <= 0 || valores.valorAbono <= 0) {
        document.getElementById('extra-payment-results').innerHTML = `
            <div class="summary-panel warning-panel">
                <h3>¡Atención!</h3>
                <div class="warning-message">
                    <span>Por favor, diligencia primero el <b>Simulador de Crédito</b> para poder calcular el abono extra.</span>
                </div>
            </div>
        `;
        return;
    }
    // Lógica principal según tipo de simulación
    if (valores.tipo === 'capital') {
        if (valores.modoCapital === 'unico') {
            mostrarResultadoAbonoUnico(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance, valores);
        } else if (valores.modoCapital === 'recurrente') {
            mostrarResultadoAbonoRecurrente(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance, valores);
        } else if (valores.modoCapital === 'periodo') {
            mostrarResultadoAbonoPeriodo(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance, valores);
        }
    } else if (valores.tipo === 'cuota') {
        mostrarResultadoDisminuirCuota(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance, valores);
    } else if (valores.tipo === 'comparativo') {
        mostrarResultadoComparativo(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance, valores);
    }
}

document.getElementById('extra-payment-form').addEventListener('submit', calcularAbonoExtra);

// --- Funciones de resultado (solo placeholder, lógica real a implementar) ---
function mostrarResultadoAbonoUnico(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance, valores) {
    // 1. Calcular tabla original (sin abono)
    const periodRate = calculatePeriodRate(interestRate, paymentFrequency);
    const payment = (loanAmount * periodRate * Math.pow(1 + periodRate, numberOfPayments)) /
        (Math.pow(1 + periodRate, numberOfPayments) - 1);
    let tablaOriginal = [];
    let saldo = loanAmount;
    let totalIntereses = 0;
    let totalSeguros = 0;
    for (let i = 1; i <= numberOfPayments; i++) {
        const interes = saldo * periodRate;
        const capital = payment - interes;
        saldo -= capital;
        if (saldo < 1) saldo = 0;
        totalIntereses += interes;
        totalSeguros += totalInsurance;
        tablaOriginal.push({
            cuota: i,
            saldoInicial: saldo + capital,
            pago: payment,
            interes,
            capital,
            seguro: totalInsurance,
            saldoFinal: saldo
        });
        if (saldo <= 0) break;
    }
    // 2. Calcular tabla con abono único
    let saldoAbono = loanAmount;
    let tablaAbono = [];
    let totalInteresesAbono = 0;
    let totalSegurosAbono = 0;
    let abonoRealizado = false;
    let cuotaFinal = 0;
    for (let i = 1; i <= numberOfPayments; i++) {
        const interes = saldoAbono * periodRate;
        let abono = 0;
        if (!abonoRealizado && i === valores.cuotaInicio) {
            abono = valores.valorAbono;
            saldoAbono -= abono;
            abonoRealizado = true;
        }
        const capital = payment - interes;
        saldoAbono -= capital;
        if (saldoAbono < 1) saldoAbono = 0;
        totalInteresesAbono += interes;
        totalSegurosAbono += totalInsurance;
        tablaAbono.push({
            cuota: i,
            saldoInicial: saldoAbono + capital + abono,
            pago: payment,
            interes,
            capital,
            abono,
            seguro: totalInsurance,
            saldoFinal: saldoAbono
        });
        if (saldoAbono <= 0) {
            cuotaFinal = i;
            break;
        }
    }
    // 3. Resumen de resultados
    const ahorroIntereses = totalIntereses - totalInteresesAbono;
    const ahorroSeguros = totalSeguros - totalSegurosAbono;
    const cuotasMenos = tablaOriginal.length - tablaAbono.length;
    // 4. Renderizar resultado con tabla homogénea y encabezados iguales a la tabla principal
    // Convertir tablaAbono a formato homogéneo
    const table = tablaAbono.map(row => ({
        period: row.cuota,
        initialBalance: row.saldoInicial,
        payment: row.pago,
        interestPayment: row.interes,
        capitalPayment: row.capital,
        extraPayment: row.abono || 0,
        insurancePayment: row.seguro,
        totalPayment: row.pago + row.seguro + (row.abono || 0),
        remainingBalance: row.saldoFinal
    }));
    const columns = [
        'period', 'initialBalance', 'payment', 'interestPayment', 'capitalPayment', 'extraPayment', 'insurancePayment', 'totalPayment', 'remainingBalance'
    ];
    document.getElementById('extra-payment-results').innerHTML = `
        <div class="summary-panel">
            <h3>Resultado: Abono Único a Capital</h3>
            <div class="summary-row"><span>Cuotas originales:</span> <span>${tablaOriginal.length}</span></div>
            <div class="summary-row"><span>Cuotas con abono:</span> <span>${tablaAbono.length}</span></div>
            <div class="summary-row"><span>Cuotas menos a pagar:</span> <span>${cuotasMenos}</span></div>
            <div class="summary-row"><span>Ahorro en intereses:</span> <span>${formatCurrency(ahorroIntereses)}</span></div>
            <div class="summary-row"><span>Ahorro en seguros:</span> <span>${formatCurrency(ahorroSeguros)}</span></div>
            <div class="summary-row"><span>Nueva fecha de finalización:</span> <span>Cuota ${cuotaFinal}</span></div>
        </div>
        ${renderAmortizationTable({
            rows: table,
            columns,
            showAbono: true
        })}
        ${renderExtraTotals(totalInteresesAbono, loanAmount - tablaAbono[tablaAbono.length-1].saldoFinal, totalSegurosAbono)}
    `;
}
// --- Lógica real para Abono Recurrente a Capital ---
function mostrarResultadoAbonoRecurrente(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance, valores) {
    const periodRate = calculatePeriodRate(interestRate, paymentFrequency);
    const payment = (loanAmount * periodRate * Math.pow(1 + periodRate, numberOfPayments)) /
        (Math.pow(1 + periodRate, numberOfPayments) - 1);
    let saldo = loanAmount;
    let tablaAbono = [];
    let totalInteresesAbono = 0;
    let totalSegurosAbono = 0;
    let cuotaFinal = 0;
    for (let i = 1; i <= numberOfPayments; i++) {
        const interes = saldo * periodRate;
        let abono = 0;
        if (i >= valores.cuotaInicio) {
            abono = valores.valorAbono;
            saldo -= abono;
        }
        const capital = payment - interes;
        saldo -= capital;
        if (saldo < 1) saldo = 0;
        totalInteresesAbono += interes;
        totalSegurosAbono += totalInsurance;
        tablaAbono.push({
            cuota: i,
            saldoInicial: saldo + capital + abono,
            pago: payment,
            interes,
            capital,
            abono,
            seguro: totalInsurance,
            saldoFinal: saldo
        });
        if (saldo <= 0) {
            cuotaFinal = i;
            break;
        }
    }
    // Calcular tabla original para comparar
    let saldoOriginal = loanAmount;
    let totalIntereses = 0;
    let totalSeguros = 0;
    for (let i = 1; i <= numberOfPayments; i++) {
        const interes = saldoOriginal * periodRate;
        const capital = payment - interes;
        saldoOriginal -= capital;
        if (saldoOriginal < 1) saldoOriginal = 0;
        totalIntereses += interes;
        totalSeguros += totalInsurance;
        if (saldoOriginal <= 0) break;
    }
    const ahorroIntereses = totalIntereses - totalInteresesAbono;
    const ahorroSeguros = totalSeguros - totalSegurosAbono;
    const cuotasMenos = Math.max(0, numberOfPayments - tablaAbono.length);
    document.getElementById('extra-payment-results').innerHTML = `
        <div class="summary-panel">
            <h3>Resultado: Abono Recurrente a Capital</h3>
            <div class="summary-row"><span>Cuotas originales:</span> <span>${numberOfPayments}</span></div>
            <div class="summary-row"><span>Cuotas con abono:</span> <span>${tablaAbono.length}</span></div>
            <div class="summary-row"><span>Cuotas menos a pagar:</span> <span>${cuotasMenos}</span></div>
            <div class="summary-row"><span>Ahorro en intereses:</span> <span>${formatCurrency(ahorroIntereses)}</span></div>
            <div class="summary-row"><span>Ahorro en seguros:</span> <span>${formatCurrency(ahorroSeguros)}</span></div>
            <div class="summary-row"><span>Nueva fecha de finalización:</span> <span>Cuota ${cuotaFinal}</span></div>
        </div>
        ${renderAmortizationTable({
            rows: tableRec,
            columns,
            showAbono: true
        })}
        ${renderExtraTotals(totalInteresesAbono, loanAmount - tablaAbono[tablaAbano.length-1].saldoFinal, totalSegurosAbono)}
    `;
}
function mostrarResultadoAbonoPeriodo(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance, valores) {
    const periodRate = calculatePeriodRate(interestRate, paymentFrequency);
    const payment = (loanAmount * periodRate * Math.pow(1 + periodRate, numberOfPayments)) /
        (Math.pow(1 + periodRate, numberOfPayments) - 1);
    let saldo = loanAmount;
    let tablaAbono = [];
    let totalInteresesAbono = 0;
    let totalSegurosAbono = 0;
    let cuotaFinal = 0;
    for (let i = 1; i <= numberOfPayments; i++) {
        const interes = saldo * periodRate;
        let abono = 0;
        if (i >= valores.cuotaInicio && i <= valores.cuotaFin) {
            abono = valores.valorAbono;
            saldo -= abono;
        }
        const capital = payment - interes;
        saldo -= capital;
        if (saldo < 1) saldo = 0;
        totalInteresesAbono += interes;
        totalSegurosAbono += totalInsurance;
        tablaAbono.push({
            cuota: i,
            saldoInicial: saldo + capital + abono,
            pago: payment,
            interes,
            capital,
            abono,
            seguro: totalInsurance,
            saldoFinal: saldo
        });
        if (saldo <= 0) {
            cuotaFinal = i;
            break;
        }
    }
    // Calcular tabla original para comparar
    let saldoOriginal = loanAmount;
    let totalIntereses = 0;
    let totalSeguros = 0;
    for (let i = 1; i <= numberOfPayments; i++) {
        const interes = saldoOriginal * periodRate;
        const capital = payment - interes;
        saldoOriginal -= capital;
        if (saldoOriginal < 1) saldoOriginal = 0;
        totalIntereses += interes;
        totalSeguros += totalInsurance;
        if (saldoOriginal <= 0) break;
    }
    const ahorroIntereses = totalIntereses - totalInteresesAbono;
    const ahorroSeguros = totalSeguros - totalSegurosAbono;
    const cuotasMenos = Math.max(0, numberOfPayments - tablaAbono.length);
    // 4. Renderizar resultado con tabla homogénea y encabezados iguales a la tabla principal
    // Convertir tablaAbono a formato homogéneo
    const table = tablaAbono.map(row => ({
        period: row.cuota,
        initialBalance: row.saldoInicial,
        payment: row.pago,
        interestPayment: row.interes,
        capitalPayment: row.capital,
        extraPayment: row.abono || 0,
        insurancePayment: row.seguro,
        totalPayment: row.pago + row.seguro + (row.abono || 0),
        remainingBalance: row.saldoFinal
    }));
    const columns = [
        'period', 'initialBalance', 'payment', 'interestPayment', 'capitalPayment', 'extraPayment', 'insurancePayment', 'totalPayment', 'remainingBalance'
    ];
    document.getElementById('extra-payment-results').innerHTML = `
        <div class="summary-panel">
            <h3>Resultado: Abono por Período Limitado a Capital</h3>
            <div class="summary-row"><span>Cuotas originales:</span> <span>${numberOfPayments}</span></div>
            <div class="summary-row"><span>Cuotas con abono:</span> <span>${tablaAbono.length}</span></div>
            <div class="summary-row"><span>Cuotas menos a pagar:</span> <span>${cuotasMenos}</span></div>
            <div class="summary-row"><span>Ahorro en intereses:</span> <span>${formatCurrency(ahorroIntereses)}</span></div>
            <div class="summary-row"><span>Ahorro en seguros:</span> <span>${formatCurrency(ahorroSeguros)}</span></div>
            <div class="summary-row"><span>Nueva fecha de finalización:</span> <span>Cuota ${cuotaFinal}</span></div>
        </div>
        ${renderAmortizationTable({
            rows: table,
            columns,
            showAbono: true
        })}
        ${renderExtraTotals(totalInteresesAbono, loanAmount - tablaAbono[tablaAbano.length-1].saldoFinal, totalSegurosAbono)}
    `;
}
// --- Lógica real para Disminuir Cuota (manteniendo plazo) ---
function mostrarResultadoDisminuirCuota(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance, valores) {
    // 1. Calcular tabla original (sin abono)
    const periodRate = calculatePeriodRate(interestRate, paymentFrequency);
    const payment = (loanAmount * periodRate * Math.pow(1 + periodRate, numberOfPayments)) /
        (Math.pow(1 + periodRate, numberOfPayments) - 1);
    let saldo = loanAmount;
    let tablaOriginal = [];
    for (let i = 1; i <= numberOfPayments; i++) {
        const interes = saldo * periodRate;
        const capital = payment - interes;
        saldo -= capital;
        if (saldo < 1) saldo = 0;
        tablaOriginal.push({
            cuota: i,
            saldoInicial: saldo + capital,
            pago: payment,
            interes,
            capital,
            seguro: totalInsurance,
            saldoFinal: saldo
        });
        if (saldo <= 0) break;
    }
    // 2. Calcular nuevo saldo tras abono extra
    let saldoAbono = loanAmount;
    for (let i = 1; i < valores.cuotaInicio; i++) {
        const interes = saldoAbono * periodRate;
        const capital = payment - interes;
        saldoAbono -= capital;
        if (saldoAbono < 1) saldoAbono = 0;
    }
    saldoAbono -= valores.valorAbono;
    if (saldoAbono < 1) saldoAbono = 0;
    // 3. Calcular nueva cuota (mismo plazo, mismo saldo, misma tasa)
    const nuevaCuota = (saldoAbono * periodRate * Math.pow(1 + periodRate, numberOfPayments - valores.cuotaInicio + 1)) /
        (Math.pow(1 + periodRate, numberOfPayments - valores.cuotaInicio + 1) - 1);
    // 4. Generar tabla con abono y nueva cuota
    let tablaNueva = [];
    let saldoNuevo = saldoAbono;
    for (let i = valores.cuotaInicio; i <= numberOfPayments; i++) {
        const interes = saldoNuevo * periodRate;
        const capital = nuevaCuota - interes;
        saldoNuevo -= capital;
        if (saldoNuevo < 1) saldoNuevo = 0;
        tablaNueva.push({
            cuota: i,
            saldoInicial: saldoNuevo + capital,
            pago: nuevaCuota,
            interes,
            capital,
            seguro: totalInsurance,
            saldoFinal: saldoNuevo
        });
        if (saldoNuevo <= 0) break;
    }
    // 5. Resumen de resultados
    const ahorroMensual = payment - nuevaCuota;
    document.getElementById('extra-payment-results').innerHTML = `
        <div class="summary-panel">
            <h3>Resultado: Disminuir Cuota</h3>
            <div class="summary-row"><span>Cuota original:</span> <span>${formatCurrency(payment)}</span></div>
            <div class="summary-row"><span>Nueva cuota:</span> <span>${formatCurrency(nuevaCuota)}</span></div>
            <div class="summary-row"><span>Ahorro mensual:</span> <span>${formatCurrency(ahorroMensual)}</span></div>
            <div class="summary-row"><span>Plazo final:</span> <span>${numberOfPayments} cuotas</span></div>
        </div>
        <div class="table-scroll" style="max-height:420px;overflow:auto;margin-bottom:32px;"><table class="amortization-table"><thead><tr>
            <th># Cuota</th><th>Saldo Inicial</th><th>Pago</th><th>Interés</th><th>Capital</th><th>Seguro</th><th>Saldo Final</th>
        </tr></thead><tbody>
        ${tablaNueva.slice(0, 20).map(row => `
            <tr>
                <td>${row.cuota}</td>
                <td>${formatNumber(Math.round(row.saldoInicial))}</td>
                <td>${formatNumber(Math.round(row.pago))}</td>
                <td>${formatNumber(Math.round(row.interes))}</td>
                <td>${formatNumber(Math.round(row.capital))}</td>
                <td>${formatNumber(row.seguro)}</td>
                <td>${formatNumber(Math.round(row.saldoFinal))}</td>
            </tr>`).join('')}
        ${tablaNueva.length > 20 ? `<tr><td colspan="7" class="more-rows">... y ${tablaNueva.length - 20} filas más</td></tr>` : ''}
        </tbody></table></div>
        ${renderExtraTotals(tablaNueva.reduce((a, r) => a + r.interes, 0), tablaNueva.reduce((a, r) => a + r.capital, 0), tablaNueva.reduce((a, r) => a + r.seguro, 0))}
    `;
}
// --- Lógica real para Mostrar Comparativo (ambos escenarios) ---
function mostrarResultadoComparativo(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance, valores) {
    // 1. Calcular tabla original (sin abono)
    const periodRate = calculatePeriodRate(interestRate, paymentFrequency);
    const payment = (loanAmount * periodRate * Math.pow(1 + periodRate, numberOfPayments)) /
        (Math.pow(1 + periodRate, numberOfPayments) - 1);
    let saldo = loanAmount;
    let totalIntereses = 0;
    let totalSeguros = 0;
    for (let i = 1; i <= numberOfPayments; i++) {
        const interes = saldo * periodRate;
        const capital = payment - interes;
        saldo -= capital;
        if (saldo < 1) saldo = 0;
        totalIntereses += interes;
        totalSeguros += totalInsurance;
        if (saldo <= 0) break;
    }
    // 2. Abono único a capital
    let saldoAbono = loanAmount;
    let totalInteresesAbono = 0;
    let totalSegurosAbono = 0;
    let abonoRealizado = false;
    let cuotasAbono = 0;
    for (let i = 1; i <= numberOfPayments; i++) {
        const interes = saldoAbono * periodRate;
        let abono = 0;
        if (!abonoRealizado && i === valores.cuotaInicio) {
            abono = valores.valorAbono;
            saldoAbono -= abono;
            abonoRealizado = true;
        }
        const capital = payment - interes;
        saldoAbono -= capital;
        if (saldoAbono < 1) saldoAbono = 0;
        totalInteresesAbono += interes;
        totalSegurosAbono += totalInsurance;
        cuotasAbono = i;
        if (saldoAbono <= 0) break;
    }
    // 3. Disminuir cuota
    let saldoCuota = loanAmount;
    for (let i = 1; i < valores.cuotaInicio; i++) {
        const interes = saldoCuota * periodRate;
        const capital = payment - interes;
        saldoCuota -= capital;
        if (saldoCuota < 1) saldoCuota = 0;
        if (saldoCuota <= 0) break;
    }
    saldoCuota -= valores.valorAbono;
    if (saldoCuota < 1) saldoCuota = 0;
    const nuevaCuota = (saldoCuota * periodRate * Math.pow(1 + periodRate, numberOfPayments - valores.cuotaInicio + 1)) /
        (Math.pow(1 + periodRate, numberOfPayments - valores.cuotaInicio + 1) - 1);
    // 4. Resumen comparativo con tabla alineada y homogénea
    const ahorroInteresesCapital = totalIntereses - totalInteresesAbono;
    const ahorroSegurosCapital = totalSeguros - totalSegurosAbono;
    const ahorroMensual = payment - nuevaCuota;
    const tableComparativo = [
        {
            scenario: 'Original',
            plazo: numberOfPayments,
            ahorroIntereses: '-',
            ahorroSeguros: '-',
            ahorroMensual: '-'
        },
        {
            scenario: 'Abono a Capital',
            plazo: cuotasAbono,
            ahorroIntereses: formatCurrency(ahorroInteresesCapital),
            ahorroSeguros: formatCurrency(ahorroSegurosCapital),
            ahorroMensual: '-'
        },
        {
            scenario: 'Reducir Cuota',
            plazo: numberOfPayments,
            ahorroIntereses: '-',
            ahorroSeguros: '-',
            ahorroMensual: formatCurrency(ahorroMensual)
        }
    ];
    document.getElementById('extra-payment-results').innerHTML = `
        <div class="summary-panel">
            <h3>Comparativo de Estrategias</h3>
        </div>
        <div class="table-scroll" style="max-width:100%;max-height:300px;overflow:auto;margin-bottom:32px;">
            <table class="amortization-table comparativo-table" style="min-width:600px;">
                <thead>
                    <tr>
                        <th>Escenario</th>
                        <th>Plazo final</th>
                        <th>Ahorro intereses</th>
                        <th>Ahorro seguros</th>
                        <th>Ahorro mensual</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableComparativo.map(row => `
                        <tr>
                            <td>${row.scenario}</td>
                            <td>${row.plazo}</td>
                            <td>${row.ahorroIntereses}</td>
                            <td>${row.ahorroSeguros}</td>
                            <td>${row.ahorroMensual}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Toggle para mostrar/ocultar el simulador de abono extra
const toggleExtraBtn = document.getElementById('toggle-extra-payment');
const extraPanel = document.getElementById('extra-payment-panel');
toggleExtraBtn.addEventListener('click', function() {
    if (extraPanel.style.display === 'none' || extraPanel.style.display === '') {
        extraPanel.style.display = 'block';
        toggleExtraBtn.textContent = 'Ocultar abono extra';
        extraPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        extraPanel.style.display = 'none';
        toggleExtraBtn.textContent = 'Simular con abono extra';
    }
});

// --- Toggle para mostrar/ocultar la sección de seguros opcionales ---
const toggleInsuranceBtn = document.getElementById('toggle-insurance');
const insuranceFieldset = document.getElementById('insurance-options-fieldset');
toggleInsuranceBtn.addEventListener('click', function() {
    if (insuranceFieldset.style.display === 'none' || insuranceFieldset.style.display === '') {
        insuranceFieldset.style.display = 'block';
        toggleInsuranceBtn.textContent = 'Ocultar seguros opcionales';
        insuranceFieldset.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        insuranceFieldset.style.display = 'none';
        toggleInsuranceBtn.textContent = 'Agregar seguros opcionales';
    }
});

// --- Función utilitaria para renderizar totales de un escenario de abono extra ---
function renderExtraTotals(totalIntereses, totalCapital, totalSeguros) {
    return `
        <div class="totals-panel">
            <div class="total-item total-interest">
                <h4>Total Intereses</h4>
                <div>${formatCurrency(totalIntereses)}</div>
            </div>
            <div class="total-item total-capital">
                <h4>Total Pago Capital</h4>
                <div>${formatCurrency(totalCapital)}</div>
            </div>
            <div class="total-item total-insurance">
                <h4>Total Pago Seguros</h4>
                <div>${formatCurrency(totalSeguros)}</div>
            </div>
            <div class="total-item total-credit">
                <h4>Total Pago Crédito</h4>
                <div>${formatCurrency(totalIntereses + totalCapital + totalSeguros)}</div>
            </div>
        </div>
    `;
}
