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

    // Generar tabla de amortización
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

    // Renderizar tabla
    let html = `<div class="table-scroll"><table class="amortization-table"><thead><tr>
        <th># Cuota</th><th>Saldo Inicial</th><th>Valor Cuota</th><th>Pago Interés</th><th>Pago Capital</th><th>Total Seguros</th><th>Abono Extra</th><th>Total Cuota</th><th>Saldo Deuda</th>
    </tr></thead><tbody>`;
    table.slice(0, 20).forEach(row => {
        html += `<tr${row.period === 0 ? ' class="init-row"' : ''}>
            <td>${row.period}</td>
            <td>${row.initialBalance > 0 ? formatNumber(Math.round(row.initialBalance)) : '0'}</td>
            <td>${row.payment > 0 ? formatNumber(Math.round(row.payment)) : '0'}</td>
            <td>${row.interestPayment > 0 ? formatNumber(Math.round(row.interestPayment)) : '0'}</td>
            <td>${row.capitalPayment > 0 ? formatNumber(Math.round(row.capitalPayment)) : '0'}</td>
            <td>${formatNumber(row.insurancePayment)}</td>
            <td>${formatNumber(row.extraPayment)}</td>
            <td>${row.totalPayment > 0 ? formatNumber(Math.round(row.totalPayment)) : '0'}</td>
            <td>${formatNumber(Math.round(row.remainingBalance))}</td>
        </tr>`;
    });
    if (table.length > 20) {
        html += `<tr><td colspan="9" class="more-rows">... y ${table.length - 20} filas más</td></tr>`;
    }
    html += '</tbody></table></div>';
    document.getElementById('results').innerHTML = html;

    // Totales
    document.getElementById('totals').innerHTML = `
        <div class="totals-panel">
            <div class="total-item total-interest">
                <h4>Total Intereses</h4>
                <div>${formatCurrency(totalInterestPaid)}</div>
            </div>
            <div class="total-item total-capital">
                <h4>Total Pago Capital</h4>
                <div>${formatCurrency(totalCapitalPaid)}</div>
            </div>
            <div class="total-item total-insurance">
                <h4>Total Pago Seguros</h4>
                <div>${formatCurrency(totalInsurancePaid)}</div>
            </div>
            <div class="total-item total-credit">
                <h4>Total Pago Crédito</h4>
                <div>${formatCurrency(totalInterestPaid + totalCapitalPaid + totalInsurancePaid)}</div>
            </div>
        </div>
    `;
});
