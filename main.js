// main.js - Credit Simulator Application

/**
 * Credit Simulator Application
 * A comprehensive tool for calculating loan amortization schedules and extra payment scenarios
 */

// =============================================================================
// UTILITY CLASSES
// =============================================================================

/**
 * Handles all UI-related operations including loading states, messages, and form interactions
 */
class UIManager {
    constructor() {
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.globalMessageContainer = document.getElementById('global-message-container');
        this.globalMessageText = document.getElementById('global-message-text');
        this.closeGlobalMessageBtn = document.getElementById('close-global-message');
        this.messageIcon = document.getElementById('message-icon');
        this.progressBar = document.getElementById('progress-bar');
        
        // Auto-close timer management
        this.autoCloseTimer = null;
        this.currentMessageType = null;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        if (this.closeGlobalMessageBtn) {
            this.closeGlobalMessageBtn.addEventListener('click', () => this.hideGlobalMessage());
        }
        
        // Pause auto-close on hover
        if (this.globalMessageContainer) {
            this.globalMessageContainer.addEventListener('mouseenter', () => this.pauseAutoClose());
            this.globalMessageContainer.addEventListener('mouseleave', () => this.resumeAutoClose());
        }
    }

    showLoading() {
        if (this.loadingOverlay) this.loadingOverlay.style.display = 'flex';
    }

    hideLoading() {
        if (this.loadingOverlay) this.loadingOverlay.style.display = 'none';
    }

    /**
     * Shows a global message with intelligent auto-closing functionality
     * @param {string} message - The message to display
     * @param {string} type - Message type: 'success', 'info', 'warning', 'error'
     */
    showGlobalMessage(message, type = 'success') {
        if (!this.globalMessageContainer || !this.globalMessageText) return;

        // Clear any existing timer
        this.clearAutoCloseTimer();
        
        // Set message content and type
        this.globalMessageText.textContent = message;
        this.currentMessageType = type;
        
        // Remove any existing classes and add new type
        this.globalMessageContainer.className = '';
        this.globalMessageContainer.classList.add(type);
        
        // Configure auto-close timing based on message type
        const autoCloseConfig = this.getAutoCloseConfig(type);
        
        // Show progress bar only for auto-closing messages
        if (this.progressBar) {
            if (autoCloseConfig.autoClose) {
                this.progressBar.style.display = 'block';
                // Set CSS custom property for animation duration
                this.globalMessageContainer.style.setProperty('--progress-duration', `${autoCloseConfig.duration}ms`);
            } else {
                this.progressBar.style.display = 'none';
            }
        }
        
        // Show the container
        this.globalMessageContainer.style.display = 'flex';
        this.globalMessageContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Set up auto-close timer if configured
        if (autoCloseConfig.autoClose) {
            this.autoCloseTimer = setTimeout(() => {
                this.hideGlobalMessage();
            }, autoCloseConfig.duration);
        }
    }

    /**
     * Get auto-close configuration based on message type
     * @param {string} type - Message type
     * @returns {object} Configuration object with autoClose and duration properties
     */
    getAutoCloseConfig(type) {
        const configs = {
            'success': { autoClose: true, duration: 3000 },   // 3 seconds for success
            'info': { autoClose: true, duration: 5000 },      // 5 seconds for info
            'warning': { autoClose: true, duration: 4000 },   // 4 seconds for warning
            'error': { autoClose: false, duration: 0 }        // Permanent for errors
        };
        
        return configs[type] || configs['info'];
    }

    /**
     * Pause auto-close timer (e.g., when user hovers over message)
     */
    pauseAutoClose() {
        if (this.autoCloseTimer) {
            clearTimeout(this.autoCloseTimer);
            this.autoCloseTimer = null;
            
            // Pause CSS animation
            if (this.progressBar) {
                this.progressBar.style.animationPlayState = 'paused';
            }
        }
    }

    /**
     * Resume auto-close timer with remaining time
     */
    resumeAutoClose() {
        if (this.currentMessageType && !this.autoCloseTimer) {
            const config = this.getAutoCloseConfig(this.currentMessageType);
            
            if (config.autoClose) {
                // Resume CSS animation
                if (this.progressBar) {
                    this.progressBar.style.animationPlayState = 'running';
                }
                
                // For simplicity, restart the timer with full duration
                // In a more sophisticated implementation, you could track elapsed time
                this.autoCloseTimer = setTimeout(() => {
                    this.hideGlobalMessage();
                }, config.duration);
            }
        }
    }

    /**
     * Clear the auto-close timer
     */
    clearAutoCloseTimer() {
        if (this.autoCloseTimer) {
            clearTimeout(this.autoCloseTimer);
            this.autoCloseTimer = null;
        }
    }

    /**
     * Hide the global message with animation
     */
    hideGlobalMessage() {
        if (!this.globalMessageContainer) return;
        
        // Clear timer
        this.clearAutoCloseTimer();
        
        // Add slide-out animation
        this.globalMessageContainer.classList.add('slide-out');
        
        // Hide after animation completes
        setTimeout(() => {
            this.globalMessageContainer.style.display = 'none';
            this.globalMessageContainer.classList.remove('slide-out');
            this.currentMessageType = null;
        }, 300); // Match animation duration
    }

    clearAllErrors() {
        document.querySelectorAll('.error-message').forEach(span => span.textContent = '');
        document.querySelectorAll('.input-error').forEach(input => input.classList.remove('input-error'));
    }

    displayFieldError(fieldId, message) {
        const errorSpan = document.getElementById(`${fieldId}-error`);
        const field = document.getElementById(fieldId);
        if (errorSpan) errorSpan.textContent = message;
        if (field) field.classList.add('input-error');
    }

    scrollToFirstError() {
        document.querySelector('.input-error')?.scrollIntoView({behavior: "smooth", block: "center"});
    }
}

/**
 * Handles number formatting, currency display, and input processing
 */
class NumberFormatter {
    static formatCurrency(value) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    static formatNumber(value) {
        return new Intl.NumberFormat('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(value);
    }

    static getCleanNumber(inputElementOrValue) {
        let valueString;
        if (typeof inputElementOrValue === 'string' || typeof inputElementOrValue === 'number') {
            valueString = String(inputElementOrValue);
        } else if (inputElementOrValue && typeof inputElementOrValue.value !== 'undefined') {
            valueString = String(inputElementOrValue.value);
        } else {
            return 0;
        }
        return Number(valueString.replace(/\D/g, '')) || 0;
    }

    static getCleanRate(inputElement) {
        const rateStr = String(inputElement.value).replace(',', '.');
        return parseFloat(rateStr) || 0;
    }

    static formatInputThousands(input) {
        if (!input) return;
        let selectionStart = input.selectionStart;
        let oldValue = input.value;
        let rawValue = oldValue.replace(/\D/g, '');

        if (!rawValue) {
            input.value = '';
            return;
        }
        input.value = Number(rawValue).toLocaleString('es-CO');

        let newLength = input.value.length;
        let oldLength = oldValue.length;
        if (selectionStart === oldLength || input.value[selectionStart -1] === '.') {
             selectionStart = newLength;
        } else {
            let diff = newLength - oldLength;
            selectionStart += diff;
        }
        
        setTimeout(() => {
          if(selectionStart < 0) selectionStart = 0;
          if(selectionStart > newLength) selectionStart = newLength;
          input.setSelectionRange(selectionStart, selectionStart);
        }, 0);
    }
}

/**
 * Manages loan calculation parameters and utilities
 */
class LoanCalculator {
    static getPaymentFrequency(frequency) {
        const frequencies = {
            monthly: 12,
            bimonthly: 6,
            quarterly: 4,
            semiannual: 2
        };
        return frequencies[frequency] || 12;
    }

    static calculatePeriodRate(annualRate, frequency) {
        const periodsPerYear = this.getPaymentFrequency(frequency);
        const normalizedRate = parseFloat(String(annualRate).replace(',', '.')) / 100;
        if (isNaN(normalizedRate) || normalizedRate <= 0) return 0;
        return Math.pow(1 + normalizedRate, 1 / periodsPerYear) - 1;
    }

    static calculatePayment(loanAmount, periodRate, numberOfPayments) {
        return (loanAmount * periodRate * Math.pow(1 + periodRate, numberOfPayments)) /
               (Math.pow(1 + periodRate, numberOfPayments) - 1);
    }
}

/**
 * Manages insurance-related functionality
 */
class InsuranceManager {
    constructor() {
        this.insuranceList = document.getElementById('insurance-list');
        this.addInsuranceBtn = document.getElementById('add-insurance');
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        if (this.addInsuranceBtn) {
            this.addInsuranceBtn.addEventListener('click', () => this.addInsuranceItem());
        }

        if (this.insuranceList) {
            this.insuranceList.addEventListener('input', (e) => {
                if (e.target?.classList.contains('insurance-value')) {
                    NumberFormatter.formatInputThousands(e.target);
                }
            });

            this.insuranceList.addEventListener('focusin', (e) => {
                if (e.target?.classList.contains('insurance-value')) {
                    e.target.value = e.target.value.replace(/\D/g, '');
                }
            });

            this.insuranceList.addEventListener('focusout', (e) => {
                if (e.target?.classList.contains('insurance-value')) {
                    NumberFormatter.formatInputThousands(e.target);
                }
            });
        }
    }

    getTotalInsurance() {
        let insurance = 0;
        document.querySelectorAll('.insurance-item input.insurance-value').forEach(input => {
            insurance += NumberFormatter.getCleanNumber(input);
        });
        return insurance;
    }

    createInsuranceItem(name = '', value = '') {
        const div = document.createElement('div');
        div.className = 'insurance-item';
        div.innerHTML = `
            <input type="text" class="insurance-name" placeholder="Nombre del seguro" value="${name}">
            <input type="text" class="insurance-value" placeholder="20.000" value="${value}">
            <button type="button" class="remove-insurance" title="Eliminar">✕</button>
        `;
        
        div.querySelector('.remove-insurance').onclick = () => {
            div.remove();
            this.checkInsuranceListEmpty();
        };

        const valueInput = div.querySelector('.insurance-value');
        valueInput.addEventListener('input', () => NumberFormatter.formatInputThousands(valueInput));
        valueInput.addEventListener('focusin', () => { valueInput.value = valueInput.value.replace(/\D/g, ''); });
        valueInput.addEventListener('focusout', () => NumberFormatter.formatInputThousands(valueInput));

        return div;
    }

    addInsuranceItem() {
        if (this.insuranceList.classList.contains('empty') && this.insuranceList.innerHTML.includes('Agrega uno o más seguros')) {
            this.insuranceList.innerHTML = '';
            this.insuranceList.classList.remove('empty');
        }
        this.insuranceList.appendChild(this.createInsuranceItem());
    }

    checkInsuranceListEmpty() {
        if (this.insuranceList.children.length === 0) {
            this.insuranceList.classList.add('empty');
            this.insuranceList.innerHTML = 'Agrega uno o más seguros opcionales';
        } else if (this.insuranceList.classList.contains('empty') && this.insuranceList.querySelector('.insurance-item')) {
            if (this.insuranceList.firstChild && this.insuranceList.firstChild.nodeType === Node.TEXT_NODE && 
                this.insuranceList.firstChild.textContent.includes('Agrega uno o más seguros')) {
                this.insuranceList.innerHTML = '';
            }
            this.insuranceList.classList.remove('empty');
        }
    }

    reset() {
        this.insuranceList.innerHTML = 'Agrega uno o más seguros opcionales';
        this.insuranceList.classList.add('empty');
    }
}

/**
 * Validates form inputs and displays appropriate error messages
 */
class FormValidator {
    constructor(uiManager) {
        this.uiManager = uiManager;
    }

    validateMainForm(amountInput, rateInput, termInput) {
        this.uiManager.clearAllErrors();
        let isValid = true;

        const loanAmount = NumberFormatter.getCleanNumber(amountInput);
        const interestRateVal = NumberFormatter.getCleanRate(rateInput);
        const numberOfPayments = NumberFormatter.getCleanNumber(termInput);

        if (loanAmount <= 0) {
            this.uiManager.displayFieldError('amount', 'El valor del préstamo debe ser mayor a cero.');
            isValid = false;
        }
        if (interestRateVal <= 0) {
            this.uiManager.displayFieldError('rate', 'La tasa de interés debe ser mayor a cero.');
            isValid = false;
        }
        if (numberOfPayments <= 0) {
            this.uiManager.displayFieldError('term', 'El número de pagos debe ser mayor a cero.');
            isValid = false;
        }
        return isValid;
    }

    validateExtraForm(valores) {
        this.uiManager.clearAllErrors();
        let isValid = true;
        const mainFormCalculated = document.getElementById('summary').innerHTML.trim() !== '';

        if (!mainFormCalculated) {
            document.getElementById('extra-payment-results').innerHTML = `
                <div class="summary-panel warning-panel">
                    <h3>¡Atención!</h3>
                    <div class="warning-message">
                        <span>Por favor, diligencia primero el <b>Simulador de Crédito</b> para poder calcular el abono extra.</span>
                    </div>
                </div>
            `;
            return false;
        }
        
        if (valores.tipo !== 'comparativo') {
            if (valores.cuotaInicio <= 0) {
                this.uiManager.displayFieldError('extra-start', 'La cuota de inicio debe ser mayor a cero.');
                isValid = false;
            }
            if (valores.valorAbono <= 0) {
                this.uiManager.displayFieldError('extra-value', 'El valor del abono debe ser mayor a cero.');
                isValid = false;
            }
            if (valores.tipo === 'capital' && valores.modoCapital === 'periodo' && valores.cuotaFin <= valores.cuotaInicio) {
                this.uiManager.displayFieldError('extra-period-end', 'La cuota final debe ser mayor que la cuota de inicio.');
                isValid = false;
            }
        }
        
        return isValid;
    }
}

/**
 * Handles form input formatting and event management
 */
class InputManager {
    constructor() {
        this.initializeFormattingInputs();
    }

    initializeFormattingInputs() {
        // Apply formatting to existing inputs
        ['amount', 'term', 'extra-start', 'extra-value', 'extra-period-end'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => NumberFormatter.formatInputThousands(input));
                input.addEventListener('focusin', () => { 
                    if (input.value) input.value = input.value.replace(/\D/g, ''); 
                });
                input.addEventListener('focusout', () => NumberFormatter.formatInputThousands(input));
            }
        });
    }
}

// =============================================================================
// RENDERING CLASSES
// =============================================================================

/**
 * Handles rendering of amortization tables and totals
 */
class TableRenderer {
    static renderAmortizationTable({ rows, columns, showAbono = false }) {
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
        
        let visibleHeaders = headers.filter(h => columns.includes(h.key) || (h.key === 'extraPayment' && showAbono));
        
        if (!showAbono) {
            visibleHeaders = visibleHeaders.filter(h => h.key !== 'extraPayment');
        }

        let html = `<div class="table-scroll" style="max-height:420px;overflow:auto;margin-bottom:32px;"><table class="amortization-table"><thead><tr>`;
        
        visibleHeaders.forEach(h => {
            html += `<th>${h.label}</th>`;
        });
        html += `</tr></thead><tbody>`;
        
        rows.forEach(row => {
            const isInitRow = row.period === 0;
            html += `<tr${isInitRow ? ' class="init-row"' : ''}>`;
            visibleHeaders.forEach(h => {
                let val = row[h.key] ?? '';
                if (h.key === 'extraPayment' && !showAbono && val === 0) val = '';
                
                if (['initialBalance','payment','interestPayment','capitalPayment','insurancePayment','totalPayment','remainingBalance','extraPayment'].includes(h.key)) {
                    val = (val !== '' && !isNaN(parseFloat(val))) ? NumberFormatter.formatCurrency(Math.round(val)) : (val === 0 && h.key !== 'extraPayment' ? NumberFormatter.formatCurrency(0) : (val === 0 && h.key === 'extraPayment' && showAbono ? NumberFormatter.formatCurrency(0) : ''));
                }
                if (h.key === 'period' && row.period === 0) val = 'Saldo Inicial';

                html += `<td>${val}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
        return html;
    }

    static renderExtraTotals(totalIntereses, totalCapital, totalSeguros) {
        return `
            <div class="totals-panel">
                <div class="total-item total-interest">
                    <h4>Total Intereses Pagados</h4>
                    <div>${NumberFormatter.formatCurrency(totalIntereses)}</div>
                </div>
                <div class="total-item total-capital">
                    <h4>Total Capital Pagado</h4>
                    <div>${NumberFormatter.formatCurrency(totalCapital)}</div>
                </div>
                <div class="total-item total-insurance">
                    <h4>Total Seguros Pagados</h4>
                    <div>${NumberFormatter.formatCurrency(totalSeguros)}</div>
                </div>
                <div class="total-item total-credit">
                    <h4>Costo Total del Crédito</h4>
                    <div>${NumberFormatter.formatCurrency(totalIntereses + totalCapital + totalSeguros)}</div>
                </div>
            </div>
        `;
    }

    static renderSummaryPanel(payment, totalInsurance, frequencyLabel, periodRate) {
        const totalPayment = payment + totalInsurance;
        return `
            <div class="summary-panel">
                <h3>Resumen de la Cuota</h3>
                <div class="summary-row"><span>Cuota Base:</span> <span>${NumberFormatter.formatCurrency(payment)}</span></div>
                <div class="summary-row"><span>Total Seguros:</span> <span>${NumberFormatter.formatCurrency(totalInsurance)}</span></div>
                <div class="summary-total">Cuota Total: ${NumberFormatter.formatCurrency(totalPayment)}</div>
                <div class="period-info">
                    <p>Periodicidad: <b>${frequencyLabel}</b></p>
                    <p>Tasa del período: <b>${(periodRate * 100).toFixed(4)}%</b></p>
                </div>
            </div>
        `;
    }
}

// =============================================================================
// SIMULATION CLASSES
// =============================================================================

/**
 * Base class for all payment simulation strategies
 */
class PaymentSimulation {
    constructor(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance) {
        this.loanAmount = loanAmount;
        this.interestRate = interestRate;
        this.numberOfPayments = numberOfPayments;
        this.paymentFrequency = paymentFrequency;
        this.totalInsurance = totalInsurance;
        this.periodRate = LoanCalculator.calculatePeriodRate(interestRate, paymentFrequency);
        this.payment = LoanCalculator.calculatePayment(loanAmount, this.periodRate, numberOfPayments);
    }

    calculateOriginalScenario() {
        let saldo = this.loanAmount;
        let totalIntereses = 0;
        let totalSeguros = 0;
        let cuotas = 0;

        for (let i = 1; i <= this.numberOfPayments; i++) {
            const interes = saldo * this.periodRate;
            const capital = this.payment - interes;
            saldo -= capital;
            if (saldo < 1 && saldo > -1) saldo = 0;
            totalIntereses += interes;
            totalSeguros += this.totalInsurance;
            cuotas = i;
            if (saldo <= 0) break;
        }

        return { totalIntereses, totalSeguros, cuotas };
    }

    generateAmortizationTable(includeAbono = false, abonoLogic = null) {
        let table = [];
        let remainingBalance = this.loanAmount;
        let totalInterestPaid = 0;
        let totalCapitalPaid = 0;
        let totalInsurancePaid = 0;
        let totalExtraPayments = 0;

        table.push({
            period: 0,
            initialBalance: 0,
            payment: 0,
            interestPayment: 0,
            capitalPayment: 0,
            insurancePayment: 0,
            extraPayment: 0,
            totalPayment: 0,
            remainingBalance: this.loanAmount
        });

        for (let i = 1; i <= this.numberOfPayments; i++) {
            const initialBalance = remainingBalance;
            const interestPayment = remainingBalance * this.periodRate;
            
            let extraPayment = 0;
            if (includeAbono && abonoLogic) {
                extraPayment = abonoLogic(i, remainingBalance);
                remainingBalance -= extraPayment;
                if (remainingBalance < 0) remainingBalance = 0;
                totalExtraPayments += extraPayment;
            }            let capitalPayment = this.payment - interestPayment;
            
            // Check if this should be the final payment
            if (i === this.numberOfPayments || remainingBalance <= capitalPayment || remainingBalance < 1) {
                // Final payment - pay exactly the remaining balance
                capitalPayment = remainingBalance;
            }

            const insurancePayment = this.totalInsurance;
            const totalPeriodPayment = this.payment + insurancePayment + extraPayment;
            remainingBalance = remainingBalance - capitalPayment;
            if (remainingBalance < 1 && remainingBalance > -1) remainingBalance = 0;
            
            totalInterestPaid += interestPayment;
            totalCapitalPaid += capitalPayment;
            totalInsurancePaid += insurancePayment;

            table.push({
                period: i,
                initialBalance,
                payment: this.payment,
                interestPayment,
                capitalPayment,
                insurancePayment,
                extraPayment,
                totalPayment: totalPeriodPayment,
                remainingBalance
            });

            if (remainingBalance <= 0) break;
        }

        return {
            table,
            totals: {
                totalInterestPaid,
                totalCapitalPaid: totalCapitalPaid + totalExtraPayments,
                totalInsurancePaid,
                totalExtraPayments
            }
        };
    }
}


/**
 * Handles single capital payment simulation
 */
class SingleCapitalPaymentSimulation extends PaymentSimulation {
    constructor(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance, valores) {
        super(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance);
        this.valores = valores;
    }

    calculate() {
        const originalScenario = this.calculateOriginalScenario();
        
        const abonoLogic = (period, balance) => {
            return (period === this.valores.cuotaInicio) ? this.valores.valorAbono : 0;
        };

        const result = this.generateAmortizationTable(true, abonoLogic);
        const cuotaFinal = result.table.length - 1;
        const ahorroIntereses = originalScenario.totalIntereses - result.totals.totalInterestPaid;
        const ahorroSeguros = originalScenario.totalSeguros - result.totals.totalInsurancePaid;
        const cuotasMenos = Math.max(0, originalScenario.cuotas - cuotaFinal);

        return {
            result,
            summary: {
                cuotasOriginales: originalScenario.cuotas,
                cuotaFinal,
                cuotasMenos,
                ahorroIntereses,
                ahorroSeguros
            }
        };
    }

    render() {
        const calculation = this.calculate();
        const columns = ['period', 'initialBalance', 'payment', 'interestPayment', 'capitalPayment', 'extraPayment', 'insurancePayment', 'totalPayment', 'remainingBalance'];
        const totalsHTML = TableRenderer.renderExtraTotals(
            calculation.result.totals.totalInterestPaid,
            calculation.result.totals.totalCapitalPaid,
            calculation.result.totals.totalInsurancePaid
        );

        return `
            <div class="summary-panel">
                <h3>Resultado: Abono Único a Capital</h3>
                <div class="summary-row"><span>Cuotas originales:</span> <span>${calculation.summary.cuotasOriginales}</span></div>
                <div class="summary-row"><span>Cuotas con abono:</span> <span>${calculation.summary.cuotaFinal}</span></div>
                <div class="summary-row"><span>Cuotas menos a pagar:</span> <span>${calculation.summary.cuotasMenos}</span></div>
                <div class="summary-row"><span>Ahorro en intereses:</span> <span>${NumberFormatter.formatCurrency(calculation.summary.ahorroIntereses)}</span></div>
                <div class="summary-row"><span>Ahorro en seguros:</span> <span>${NumberFormatter.formatCurrency(calculation.summary.ahorroSeguros)}</span></div>
                <div class="summary-row"><span>Nueva fecha de finalización:</span> <span>Cuota ${calculation.summary.cuotaFinal}</span></div>
            </div>
            ${TableRenderer.renderAmortizationTable({
                rows: calculation.result.table,
                columns,
                showAbono: true
            })}
            ${totalsHTML}
        `;
    }
}

/**
 * Handles recurring capital payment simulation
 */
class RecurringCapitalPaymentSimulation extends PaymentSimulation {
    constructor(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance, valores) {
        super(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance);
        this.valores = valores;
    }

    calculate() {
        const originalScenario = this.calculateOriginalScenario();
        
        const abonoLogic = (period, balance) => {
            return (period >= this.valores.cuotaInicio) ? this.valores.valorAbono : 0;
        };

        const result = this.generateAmortizationTable(true, abonoLogic);
        const cuotaFinal = result.table.length - 1;
        const ahorroIntereses = originalScenario.totalIntereses - result.totals.totalInterestPaid;
        const ahorroSeguros = originalScenario.totalSeguros - result.totals.totalInsurancePaid;
        const cuotasMenos = Math.max(0, originalScenario.cuotas - cuotaFinal);

        return {
            result,
            summary: {
                cuotasOriginales: originalScenario.cuotas,
                cuotaFinal,
                cuotasMenos,
                ahorroIntereses,
                ahorroSeguros
            }
        };
    }

    render() {
        const calculation = this.calculate();
        const columns = ['period', 'initialBalance', 'payment', 'interestPayment', 'capitalPayment', 'extraPayment', 'insurancePayment', 'totalPayment', 'remainingBalance'];
        const totalsHTML = TableRenderer.renderExtraTotals(
            calculation.result.totals.totalInterestPaid,
            calculation.result.totals.totalCapitalPaid,
            calculation.result.totals.totalInsurancePaid
        );

        return `
            <div class="summary-panel">
                <h3>Resultado: Abono Recurrente a Capital</h3>
                <div class="summary-row"><span>Cuotas originales:</span> <span>${calculation.summary.cuotasOriginales}</span></div>
                <div class="summary-row"><span>Cuotas con abono:</span> <span>${calculation.summary.cuotaFinal}</span></div>
                <div class="summary-row"><span>Cuotas menos a pagar:</span> <span>${calculation.summary.cuotasMenos}</span></div>
                <div class="summary-row"><span>Ahorro en intereses:</span> <span>${NumberFormatter.formatCurrency(calculation.summary.ahorroIntereses)}</span></div>
                <div class="summary-row"><span>Ahorro en seguros:</span> <span>${NumberFormatter.formatCurrency(calculation.summary.ahorroSeguros)}</span></div>
                <div class="summary-row"><span>Nueva fecha de finalización:</span> <span>Cuota ${calculation.summary.cuotaFinal}</span></div>
            </div>
            ${TableRenderer.renderAmortizationTable({
                rows: calculation.result.table,
                columns,
                showAbono: true
            })}
            ${totalsHTML}
        `;
    }
}

/**
 * Handles period-limited capital payment simulation
 */
class PeriodCapitalPaymentSimulation extends PaymentSimulation {
    constructor(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance, valores) {
        super(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance);
        this.valores = valores;
    }

    calculate() {
        const originalScenario = this.calculateOriginalScenario();
        
        const abonoLogic = (period, balance) => {
            return (period >= this.valores.cuotaInicio && period <= this.valores.cuotaFin) ? this.valores.valorAbono : 0;
        };

        const result = this.generateAmortizationTable(true, abonoLogic);
        const cuotaFinal = result.table.length - 1;
        const ahorroIntereses = originalScenario.totalIntereses - result.totals.totalInterestPaid;
        const ahorroSeguros = originalScenario.totalSeguros - result.totals.totalInsurancePaid;
        const cuotasMenos = Math.max(0, originalScenario.cuotas - cuotaFinal);

        return {
            result,
            summary: {
                cuotasOriginales: originalScenario.cuotas,
                cuotaFinal,
                cuotasMenos,
                ahorroIntereses,
                ahorroSeguros
            }
        };
    }

    render() {
        const calculation = this.calculate();
        const columns = ['period', 'initialBalance', 'payment', 'interestPayment', 'capitalPayment', 'extraPayment', 'insurancePayment', 'totalPayment', 'remainingBalance'];
        const totalsHTML = TableRenderer.renderExtraTotals(
            calculation.result.totals.totalInterestPaid,
            calculation.result.totals.totalCapitalPaid,
            calculation.result.totals.totalInsurancePaid
        );

        return `
            <div class="summary-panel">
                <h3>Resultado: Abono por Período Limitado a Capital</h3>
                <div class="summary-row"><span>Cuotas originales:</span> <span>${calculation.summary.cuotasOriginales}</span></div>
                <div class="summary-row"><span>Cuotas con abono:</span> <span>${calculation.summary.cuotaFinal}</span></div>
                <div class="summary-row"><span>Cuotas menos a pagar:</span> <span>${calculation.summary.cuotasMenos}</span></div>
                <div class="summary-row"><span>Ahorro en intereses:</span> <span>${NumberFormatter.formatCurrency(calculation.summary.ahorroIntereses)}</span></div>
                <div class="summary-row"><span>Ahorro en seguros:</span> <span>${NumberFormatter.formatCurrency(calculation.summary.ahorroSeguros)}</span></div>
                <div class="summary-row"><span>Nueva fecha de finalización:</span> <span>Cuota ${calculation.summary.cuotaFinal}</span></div>
            </div>
            ${TableRenderer.renderAmortizationTable({
                rows: calculation.result.table,
                columns,
                showAbono: true
            })}
            ${totalsHTML}
        `;
    }
}


/**
 * Handles payment reduction simulation
 */
class PaymentReductionSimulation extends PaymentSimulation {
    constructor(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance, valores) {
        super(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance);
        this.valores = valores;
    }

    calculate() {
        // Calculate balance just before the extra payment
        let saldoTemporal = this.loanAmount;
        for (let i = 1; i < this.valores.cuotaInicio; i++) {
            const interes = saldoTemporal * this.periodRate;
            const capital = this.payment - interes;
            saldoTemporal -= capital;
            if (saldoTemporal < 1 && saldoTemporal > -1) saldoTemporal = 0;
        }
        
        const saldoAntesDeAbono = saldoTemporal;
        saldoTemporal -= this.valores.valorAbono;
        if (saldoTemporal < 1 && saldoTemporal > -1) saldoTemporal = 0;
        const saldoDespuesDeAbono = saldoTemporal;

        const remainingPayments = this.numberOfPayments - this.valores.cuotaInicio + 1;
        
        let nuevaCuotaBase = 0;
        if (saldoDespuesDeAbono > 0 && remainingPayments > 0) {
            nuevaCuotaBase = LoanCalculator.calculatePayment(saldoDespuesDeAbono, this.periodRate, remainingPayments);
        }        // Generate full amortization table
        let tablaNuevaData = [];
        let saldoNuevo = this.loanAmount;
        let totalInteresesPagadosNuevaCuota = 0;
        let totalCapitalPagadoNuevaCuota = 0;
        let totalSegurosPagadosNuevaCuota = 0;
        let abonoAplicadoEnTabla = false;
        
        tablaNuevaData.push({
            period: 0, 
            initialBalance: 0, 
            payment: 0, 
            interestPayment: 0, 
            capitalPayment: 0, 
            extraPayment: 0, 
            insurancePayment: 0, 
            totalPayment: 0, 
            remainingBalance: this.loanAmount
        });
        
        for (let i = 1; i <= this.numberOfPayments; i++) {
            const initialBalance = saldoNuevo;
            
            // Si no hay saldo pendiente, salir del ciclo
            if (initialBalance <= 0) break;
            
            const currentPaymentBase = (i < this.valores.cuotaInicio) ? this.payment : nuevaCuotaBase;
            let abonoExtraDelPeriodo = 0;

            const interes = initialBalance * this.periodRate;
            let capital;
            let cuotaPeriodoReal;            // Aplicar abono extra en la cuota especificada ANTES de calcular capital
            if (i === this.valores.cuotaInicio && !abonoAplicadoEnTabla && this.valores.valorAbono > 0) {
                abonoExtraDelPeriodo = this.valores.valorAbono;
                abonoAplicadoEnTabla = true;
                
                // Aplicar el abono extra al saldo inmediatamente
                saldoNuevo = initialBalance - abonoExtraDelPeriodo;
                if (saldoNuevo < 0) saldoNuevo = 0;
            }

            // Calculate capital payment based on current balance after extra payment
            const capitalNormal = currentPaymentBase - interes;
            
            // Check if this is the final payment or if remaining balance is very small
            if (saldoNuevo <= capitalNormal || (i === this.numberOfPayments) || saldoNuevo < 1) {
                // Es la última cuota - pagar exactamente el saldo restante
                capital = saldoNuevo;
                cuotaPeriodoReal = capital + interes;
                saldoNuevo = 0;
            } else {
                // Cuota normal
                capital = capitalNormal;
                cuotaPeriodoReal = currentPaymentBase;
                saldoNuevo = saldoNuevo - capital;
                
                // Normalizar saldo cercano a cero
                if (saldoNuevo < 1 && saldoNuevo > -1) saldoNuevo = 0;
            }

            totalInteresesPagadosNuevaCuota += interes;
            totalCapitalPagadoNuevaCuota += capital;
            totalSegurosPagadosNuevaCuota += this.totalInsurance;

            tablaNuevaData.push({
                period: i,
                initialBalance: initialBalance,
                payment: cuotaPeriodoReal,
                interestPayment: interes,
                capitalPayment: capital,
                extraPayment: abonoExtraDelPeriodo,
                insurancePayment: this.totalInsurance,
                totalPayment: cuotaPeriodoReal + this.totalInsurance + abonoExtraDelPeriodo,
                remainingBalance: saldoNuevo
            });

            // Si el saldo llegó a cero, terminar
            if (saldoNuevo <= 0) break;
        }

        // Calculate metrics
        const cuotasEfectivasPagadas = tablaNuevaData.length - 1;
        const cuotasConNuevaCuota = cuotasEfectivasPagadas - this.valores.cuotaInicio + 1;
        
        const originalScenario = this.calculateOriginalScenario();
        const ahorroTotalIntereses = originalScenario.totalIntereses - totalInteresesPagadosNuevaCuota;
        const ahorroMensual = (this.payment - nuevaCuotaBase) > 0 ? (this.payment - nuevaCuotaBase) : 0;

        return {
            table: tablaNuevaData,
            totals: {
                totalInterestPaid: totalInteresesPagadosNuevaCuota,
                totalCapitalPaid: totalCapitalPagadoNuevaCuota + (abonoAplicadoEnTabla ? this.valores.valorAbono : 0),
                totalInsurancePaid: totalSegurosPagadosNuevaCuota
            },
            summary: {
                paymentOriginal: this.payment,
                nuevaCuotaBase,
                ahorroMensual,
                cuotasEfectivasPagadas,
                cuotasConNuevaCuota,
                ahorroTotalIntereses
            }
        };
    }

    render() {
        const calculation = this.calculate();
        const columns = ['period', 'initialBalance', 'payment', 'interestPayment', 'capitalPayment', 'extraPayment', 'insurancePayment', 'totalPayment', 'remainingBalance'];
        const totalsHTML = TableRenderer.renderExtraTotals(
            calculation.totals.totalInterestPaid,
            calculation.totals.totalCapitalPaid,
            calculation.totals.totalInsurancePaid
        );

        return `
            <div class="summary-panel">
                <h3>Resultado: Disminuir Cuota</h3>
                <div class="summary-row"><span>Cuota original (base):</span> <span>${NumberFormatter.formatCurrency(calculation.summary.paymentOriginal)}</span></div>
                <div class="summary-row"><span>Nueva cuota (base):</span> <span>${NumberFormatter.formatCurrency(calculation.summary.nuevaCuotaBase)}</span></div>
                <div class="summary-row"><span>Ahorro mensual (base):</span> <span>${NumberFormatter.formatCurrency(calculation.summary.ahorroMensual)}</span></div>
                <div class="summary-row"><span>Cuotas efectivas a pagar:</span> <span>${calculation.summary.cuotasEfectivasPagadas} cuotas</span></div>
                <div class="summary-row"><span>Total cuotas con nuevo valor:</span> <span>${calculation.summary.cuotasConNuevaCuota} cuotas</span></div>
                <div class="summary-row"><span>Ahorro total en intereses:</span> <span>${NumberFormatter.formatCurrency(calculation.summary.ahorroTotalIntereses)}</span></div>
            </div>
            ${TableRenderer.renderAmortizationTable({rows: calculation.table, columns, showAbono: true })}
            ${totalsHTML}
        `;
    }
}

/**
 * Handles comparative analysis of different payment strategies
 */
class ComparativeSimulation extends PaymentSimulation {
    constructor(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance, valores) {
        super(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance);
        this.valores = valores;
    }

    calculate() {
        const originalScenario = this.calculateOriginalScenario();
        
        // Capital payment scenario
        const capitalPaymentSim = new SingleCapitalPaymentSimulation(
            this.loanAmount, this.interestRate, this.numberOfPayments, 
            this.paymentFrequency, this.totalInsurance, this.valores
        );
        const capitalResult = capitalPaymentSim.calculate();

        // Payment reduction scenario
        const paymentReductionSim = new PaymentReductionSimulation(
            this.loanAmount, this.interestRate, this.numberOfPayments,
            this.paymentFrequency, this.totalInsurance, this.valores
        );
        const reductionResult = paymentReductionSim.calculate();

        return {
            original: originalScenario,
            capitalPayment: capitalResult,
            paymentReduction: reductionResult
        };
    }

    render() {
        const calculations = this.calculate();
        
        const tableComparativo = [
            {
                scenario: 'Crédito Original',
                plazo: `${calculations.original.cuotas} cuotas`,
                cuotaMensualBase: NumberFormatter.formatCurrency(this.payment),
                totalIntereses: NumberFormatter.formatCurrency(calculations.original.totalIntereses),
                totalPagado: NumberFormatter.formatCurrency(this.loanAmount + calculations.original.totalIntereses + calculations.original.totalSeguros)
            },
            {
                scenario: `Abono a Capital (${NumberFormatter.formatCurrency(this.valores.valorAbono)} en cuota ${this.valores.cuotaInicio})`,
                plazo: `${calculations.capitalPayment.summary.cuotaFinal} cuotas`,
                cuotaMensualBase: NumberFormatter.formatCurrency(this.payment),
                totalIntereses: NumberFormatter.formatCurrency(calculations.capitalPayment.result.totals.totalInterestPaid),
                totalPagado: NumberFormatter.formatCurrency(this.loanAmount + calculations.capitalPayment.result.totals.totalInterestPaid + calculations.capitalPayment.result.totals.totalInsurancePaid)
            },
            {
                scenario: `Reducir Cuota (con abono de ${NumberFormatter.formatCurrency(this.valores.valorAbono)} en cuota ${this.valores.cuotaInicio})`,
                plazo: `${this.numberOfPayments} cuotas`,
                cuotaMensualBase: NumberFormatter.formatCurrency(calculations.paymentReduction.summary.nuevaCuotaBase),
                totalIntereses: NumberFormatter.formatCurrency(calculations.paymentReduction.totals.totalInterestPaid),
                totalPagado: NumberFormatter.formatCurrency(this.loanAmount + calculations.paymentReduction.totals.totalInterestPaid + calculations.original.totalSeguros)
            }
        ];

        return `
            <div class="summary-panel">
                <h3>Comparativo de Estrategias con Abono Extra</h3>
                <p style="font-size:0.9em; text-align:center; color:#334155;">Comparación basada en un abono de <b>${NumberFormatter.formatCurrency(this.valores.valorAbono)}</b> aplicado en la <b>cuota ${this.valores.cuotaInicio}</b>.</p>
            </div>
            <div class="table-scroll" style="max-width:100%;max-height:none;overflow:auto;margin-bottom:32px;">
                <table class="amortization-table comparativo-table" style="min-width:700px;">
                    <thead>                        <tr>
                            <th>Escenario</th>
                            <th>Plazo Final</th>
                            <th>Cuota Mensual Base</th>
                            <th>Total Intereses Pagados</th>
                            <th>Total Pagado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableComparativo.map(row => `
                            <tr>
                                <td>${row.scenario}</td>
                                <td>${row.plazo}</td>
                                <td>${row.cuotaMensualBase}</td>
                                <td>${row.totalIntereses}</td>
                                <td><b>${row.totalPagado}</b></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="summary-panel" style="max-width: 700px; background: #f1f5f9; border-color: #cbd5e1;">
                <h4 style="color: #1e293b; font-size: 1.2rem;">Conclusiones del Abono Extra:</h4>
                <div class="summary-row" style="font-size:1rem;"><span>Ahorro en intereses (Abonando a Capital):</span> <span style="color:#16a34a;font-weight:bold;">${NumberFormatter.formatCurrency(calculations.capitalPayment.summary.ahorroIntereses)}</span></div>
                <div class="summary-row" style="font-size:1rem;"><span>Reducción de plazo (Abonando a Capital):</span> <span style="color:#16a34a;font-weight:bold;">${calculations.original.cuotas - calculations.capitalPayment.summary.cuotaFinal} cuotas</span></div>
                <hr style="width:80%; margin: 10px auto; border-color: #cbd5e1;">
                <div class="summary-row" style="font-size:1rem;"><span>Ahorro mensual (Reduciendo Cuota):</span> <span style="color:#2563eb;font-weight:bold;">${NumberFormatter.formatCurrency(calculations.paymentReduction.summary.ahorroMensual)}</span></div>
                <div class="summary-row" style="font-size:1rem;"><span>Ahorro en intereses (Reduciendo Cuota):</span> <span style="color:#2563eb;font-weight:bold;">${NumberFormatter.formatCurrency(calculations.paymentReduction.summary.ahorroTotalIntereses)}</span></div>
            </div>
        `;
    }
}

// =============================================================================
// MAIN APPLICATION CLASS
// =============================================================================

/**
 * Main application class that orchestrates all functionality
 */
class CreditSimulatorApp {    constructor() {
        this.initializeComponents();
        this.initializeElements();
        this.initializeEventListeners();
        this.setupToggleButtons();
        this.initializeInfoCards();
    }

    initializeComponents() {
        this.uiManager = new UIManager();
        this.insuranceManager = new InsuranceManager();
        this.formValidator = new FormValidator(this.uiManager);
        this.inputManager = new InputManager();
    }

    initializeElements() {
        this.amountInput = document.getElementById('amount');
        this.rateInput = document.getElementById('rate');
        this.termInput = document.getElementById('term');
        this.frequencyInput = document.getElementById('frequency');
        this.amortizationForm = document.getElementById('amortization-form');
        this.extraPaymentForm = document.getElementById('extra-payment-form');
        this.toggleInsuranceBtn = document.getElementById('toggle-insurance');
        this.insuranceFieldset = document.getElementById('insurance-options-fieldset');
        this.toggleExtraBtn = document.getElementById('toggle-extra-payment');
        this.extraPanel = document.getElementById('extra-payment-panel');
        this.extraType = document.getElementById('extra-type');
        this.extraCapitalOptions = document.getElementById('extra-capital-options');
        this.extraPeriodRow = document.getElementById('extra-period-row');
    }

    initializeEventListeners() {
        this.amortizationForm.addEventListener('submit', (e) => this.handleMainFormSubmit(e));
        this.amortizationForm.addEventListener('reset', (e) => this.handleMainFormReset(e));
        this.extraPaymentForm.addEventListener('submit', (e) => this.handleExtraPaymentSubmit(e));
        this.extraPaymentForm.addEventListener('reset', (e) => this.handleExtraPaymentReset(e));
        
        this.extraType.addEventListener('change', () => this.handleExtraTypeChange());
        document.getElementById('extra-capital-mode').addEventListener('change', () => this.handleExtraCapitalModeChange());
    }    setupToggleButtons() {
        this.toggleExtraBtn.addEventListener('click', () => {
            const expanded = this.toggleExtraBtn.getAttribute('aria-expanded') === 'true' || false;
            this.extraPanel.style.display = expanded ? 'none' : 'block';
            this.toggleExtraBtn.setAttribute('aria-expanded', !expanded);
            this.toggleExtraBtn.textContent = expanded ? 'Simular con abono extra' : 'Ocultar abono extra';
            if (!expanded) {
                this.extraPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });        this.toggleInsuranceBtn.addEventListener('click', () => {
            const expanded = this.toggleInsuranceBtn.getAttribute('aria-expanded') === 'true' || false;
            this.insuranceFieldset.style.display = expanded ? 'none' : 'block';
            this.toggleInsuranceBtn.setAttribute('aria-expanded', !expanded);
            this.toggleInsuranceBtn.textContent = expanded ? 'Agregar seguros opcionales' : 'Ocultar seguros opcionales';
            
            if (!expanded) {
                this.insuranceFieldset.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Show warning about insurance costs
                this.uiManager.showGlobalMessage(
                    'Recuerda que los seguros aumentan el costo total del crédito. Revisa bien las coberturas antes de incluirlos.',
                    'warning'
                );
            }
        });
    }

    initializeInfoCards() {
        // Initialize info cards display on page load
        this.updateInfoCardsDisplay();
    }

    handleMainFormSubmit(e) {
        e.preventDefault();
        this.uiManager.hideGlobalMessage();
        
        if (!this.formValidator.validateMainForm(this.amountInput, this.rateInput, this.termInput)) {
            this.uiManager.showGlobalMessage('Por favor, corrige los errores en el formulario.', 'error');
            this.uiManager.scrollToFirstError();
            return;
        }

        this.uiManager.showLoading();

        setTimeout(() => {
            try {
                this.calculateMainLoan();
                this.uiManager.showGlobalMessage('Cálculo de crédito realizado con éxito.', 'success');
            } catch (error) {
                console.error("Error en cálculo principal:", error);
                this.uiManager.showGlobalMessage('Ocurrió un error inesperado al calcular el crédito.', 'error');
            } finally {
                this.uiManager.hideLoading();
            }
        }, 500);
    }

    calculateMainLoan() {
        const loanAmount = NumberFormatter.getCleanNumber(this.amountInput);
        const interestRate = NumberFormatter.getCleanRate(this.rateInput);
        const numberOfPayments = NumberFormatter.getCleanNumber(this.termInput);
        const paymentFrequency = this.frequencyInput.value;
        const totalInsurance = this.insuranceManager.getTotalInsurance();

        const periodRate = LoanCalculator.calculatePeriodRate(interestRate, paymentFrequency);
        if (periodRate === 0 && interestRate > 0) {
            this.uiManager.hideLoading();
            this.uiManager.showGlobalMessage('La tasa de interés ingresada no es válida.', 'error');
            this.uiManager.displayFieldError('rate', 'Tasa inválida.');
            return;
        }

        const payment = LoanCalculator.calculatePayment(loanAmount, periodRate, numberOfPayments);
        const periodicidadLabel = this.frequencyInput.options[this.frequencyInput.selectedIndex].text;

        document.getElementById('summary').innerHTML = TableRenderer.renderSummaryPanel(
            payment, totalInsurance, periodicidadLabel, periodRate
        );

        const simulation = new PaymentSimulation(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance);
        const result = simulation.generateAmortizationTable();

        const columns = ['period', 'initialBalance', 'payment', 'interestPayment', 'capitalPayment', 'insurancePayment', 'totalPayment', 'remainingBalance'];
        
        document.getElementById('results').innerHTML = TableRenderer.renderAmortizationTable({
            rows: result.table,
            columns,
            showAbono: false
        });

        document.getElementById('totals').innerHTML = TableRenderer.renderExtraTotals(
            result.totals.totalInterestPaid,
            result.totals.totalCapitalPaid,
            result.totals.totalInsurancePaid
        );
    }    handleMainFormReset() {
        this.uiManager.clearAllErrors();
        this.uiManager.hideGlobalMessage();
        document.getElementById('summary').innerHTML = '';
        document.getElementById('results').innerHTML = '';
        document.getElementById('totals').innerHTML = '';
        this.insuranceManager.reset();
        
        // Show informational message about form reset
        setTimeout(() => {
            this.uiManager.showGlobalMessage('Formulario limpiado. Puedes ingresar nuevos datos para tu simulación.', 'info');
        }, 100);
    }handleExtraTypeChange() {
        this.extraPaymentForm.classList.toggle('comparative-mode', this.extraType.value === 'comparativo');

        if (this.extraType.value === 'capital') {
            this.extraCapitalOptions.style.display = '';
            const mode = document.getElementById('extra-capital-mode').value;
            this.extraPeriodRow.style.display = mode === 'periodo' ? '' : 'none';
        } else {
            this.extraCapitalOptions.style.display = 'none';
            this.extraPeriodRow.style.display = 'none';
        }

        // Handle dynamic info cards display based on selected simulation type
        this.updateInfoCardsDisplay();
        
        // Show informational message about selected simulation type
        const typeMessages = {
            'capital': 'Simulación configurada para reducir capital. Ideal para disminuir el plazo del crédito.',
            'cuota': 'Simulación configurada para reducir cuotas. Perfecto para mejorar el flujo de caja mensual.',
            'comparativo': 'Simulación comparativa activada. Te mostraremos ambas opciones para que decidas.'
        };
        
        const message = typeMessages[this.extraType.value];
        if (message) {
            this.uiManager.showGlobalMessage(message, 'info');
        }
    }

    updateInfoCardsDisplay() {
        const selectedType = this.extraType.value;
        const allInfoCards = document.querySelectorAll('.info-card');
        
        // Hide all cards first
        allInfoCards.forEach(card => {
            card.style.display = 'none';
        });
        
        // Show the card corresponding to the selected type
        const selectedCard = document.querySelector(`.info-card[data-type="${selectedType}"]`);
        if (selectedCard) {
            selectedCard.style.display = 'block';
            // Add animation class for smooth appearance
            selectedCard.style.animation = 'none';
            selectedCard.offsetHeight; // Trigger reflow
            selectedCard.style.animation = 'fadeInUp 0.3s ease-out';
        }
    }

    handleExtraCapitalModeChange() {
        const mode = document.getElementById('extra-capital-mode').value;
        this.extraPeriodRow.style.display = mode === 'periodo' ? '' : 'none';
    }

    getExtraFormValues() {
        return {
            tipo: document.getElementById('extra-type').value,
            cuotaInicio: NumberFormatter.getCleanNumber(document.getElementById('extra-start')),
            valorAbono: NumberFormatter.getCleanNumber(document.getElementById('extra-value')),
            modoCapital: document.getElementById('extra-capital-mode').value,
            cuotaFin: NumberFormatter.getCleanNumber(document.getElementById('extra-period-end'))
        };
    }

    handleExtraPaymentSubmit(e) {
        e.preventDefault();
        this.uiManager.hideGlobalMessage();
        const valores = this.getExtraFormValues();

        if (!this.formValidator.validateExtraForm(valores)) {
            this.uiManager.showGlobalMessage('Por favor, corrige los errores en el formulario de abono extra.', 'error');
            document.querySelector('#extra-payment-form .input-error')?.scrollIntoView({behavior: "smooth", block: "center"});
            return;
        }
        
        this.uiManager.showLoading();
        setTimeout(() => {
            try {
                this.calculateExtraPayment(valores);
                this.uiManager.showGlobalMessage('Simulación de abono extra realizada.', 'success');
            } catch (error) {
                console.error("Error en simulación de abono extra:", error);
                this.uiManager.showGlobalMessage('Ocurrió un error inesperado al simular el abono extra.', 'error');
            } finally {
                this.uiManager.hideLoading();
            }
        }, 500);
    }

    calculateExtraPayment(valores) {
        const loanAmount = NumberFormatter.getCleanNumber(this.amountInput);
        const interestRate = NumberFormatter.getCleanRate(this.rateInput);
        const numberOfPayments = NumberFormatter.getCleanNumber(this.termInput);
        const paymentFrequency = this.frequencyInput.value;
        const totalInsurance = this.insuranceManager.getTotalInsurance();

        let simulation;
        let result;

        switch (valores.tipo) {
            case 'capital':
                switch (valores.modoCapital) {
                    case 'unico':
                        simulation = new SingleCapitalPaymentSimulation(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance, valores);
                        break;
                    case 'recurrente':
                        simulation = new RecurringCapitalPaymentSimulation(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance, valores);
                        break;
                    case 'periodo':
                        simulation = new PeriodCapitalPaymentSimulation(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance, valores);
                        break;
                }
                break;
            case 'cuota':
                simulation = new PaymentReductionSimulation(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance, valores);
                break;
            case 'comparativo':
                simulation = new ComparativeSimulation(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance, valores);
                break;
        }

        if (simulation) {
            result = simulation.render();
            document.getElementById('extra-payment-results').innerHTML = result;
        }
    }    handleExtraPaymentReset() {
        this.uiManager.clearAllErrors();
        this.uiManager.hideGlobalMessage();
        document.getElementById('extra-payment-results').innerHTML = '';
        this.extraCapitalOptions.style.display = 'none';
        this.extraPeriodRow.style.display = 'none';
        this.extraPaymentForm.classList.remove('comparative-mode');
        
        // Show informational message about extra payment reset
        setTimeout(() => {
            this.uiManager.showGlobalMessage('Configuración de abono extra limpiada. Selecciona nuevos parámetros.', 'info');
        }, 100);
    }
}

// =============================================================================
// APPLICATION INITIALIZATION
// =============================================================================

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.creditSimulatorApp = new CreditSimulatorApp();
});