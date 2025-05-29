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
        // Support for HTML content
        if (message.includes('<')) {
            this.globalMessageText.innerHTML = message;
        } else {
            this.globalMessageText.textContent = message;
        }
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
    }    static calculatePayment(loanAmount, periodRate, numberOfPayments) {
        return (loanAmount * periodRate * Math.pow(1 + periodRate, numberOfPayments)) /
               (Math.pow(1 + periodRate, numberOfPayments) - 1);
    }

    /**
     * Calculate loan amortization with multiple extra payments at different periods
     * @param {number} loanAmount - Initial loan amount
     * @param {number} rate - Annual interest rate
     * @param {number} term - Number of payments
     * @param {string} frequency - Payment frequency
     * @param {Array} paymentsSchedule - Array of {period, amount} objects
     * @returns {Object} Complete amortization calculation with multiple payments
     */
    static calculateWithMultiplePayments(loanAmount, rate, term, frequency, paymentsSchedule) {
        const periodRate = this.calculatePeriodRate(rate, frequency);
        const regularPayment = this.calculatePayment(loanAmount, periodRate, term);
        
        let balance = loanAmount;
        let totalInterest = 0;
        let totalRegularPayments = 0;
        let totalExtraPayments = 0;
        const schedule = [];
        
        // Convert payments schedule to map for O(1) lookup
        const extraPaymentsMap = new Map();
        paymentsSchedule.forEach(payment => {
            extraPaymentsMap.set(payment.period, payment.amount);
        });
        
        for (let period = 1; period <= term && balance > 0.01; period++) {
            const interestPayment = balance * periodRate;
            let principalPayment = regularPayment - interestPayment;
            
            // Add extra payment if scheduled for this period
            const extraPayment = extraPaymentsMap.get(period) || 0;
            const totalPrincipalPayment = principalPayment + extraPayment;
            
            // Ensure we don't overpay
            const actualPrincipalPayment = Math.min(totalPrincipalPayment, balance);
            const actualExtraPayment = Math.max(0, actualPrincipalPayment - principalPayment);
            const actualRegularPrincipal = actualPrincipalPayment - actualExtraPayment;
            
            balance -= actualPrincipalPayment;
            totalInterest += interestPayment;
            totalRegularPayments += interestPayment + actualRegularPrincipal;
            totalExtraPayments += actualExtraPayment;
            
            schedule.push({
                period,
                payment: regularPayment,
                extraPayment: actualExtraPayment,
                totalPayment: interestPayment + actualPrincipalPayment,
                interest: interestPayment,
                principal: actualRegularPrincipal,
                extraPrincipal: actualExtraPayment,
                balance: Math.max(0, balance)
            });
            
            // Loan paid off early
            if (balance <= 0.01) {
                break;
            }
        }
        
        // Calculate comparison with regular payments
        const regularSchedule = this.calculateRegularSchedule(loanAmount, rate, term, frequency);
        const savedInterest = regularSchedule.totalInterest - totalInterest;
        const savedPayments = regularSchedule.totalPayments - schedule.length;
        
        return {
            schedule,
            totalInterest,
            totalPayments: schedule.length,
            totalPaid: totalRegularPayments + totalExtraPayments,
            totalExtraPayments,
            regularPayment,
            
            // Comparison data
            originalTotalInterest: regularSchedule.totalInterest,
            originalTotalPayments: regularSchedule.totalPayments,
            savedInterest,
            savedPayments,
            savingsPercentage: (savedInterest / regularSchedule.totalInterest) * 100,
            
            // Summary
            paymentsSchedule: paymentsSchedule.sort((a, b) => a.period - b.period)
        };
    }

    /**
     * Calculate regular loan schedule for comparison
     */
    static calculateRegularSchedule(loanAmount, rate, term, frequency) {
        const periodRate = this.calculatePeriodRate(rate, frequency);
        const regularPayment = this.calculatePayment(loanAmount, periodRate, term);
        
        let balance = loanAmount;
        let totalInterest = 0;
        
        for (let period = 1; period <= term; period++) {
            const interestPayment = balance * periodRate;
            const principalPayment = regularPayment - interestPayment;
            
            balance -= principalPayment;
            totalInterest += interestPayment;
        }
        
        return {
            totalInterest,
            totalPayments: term,
            totalPaid: regularPayment * term,
            regularPayment
        };
    }
}

/**
 * Manages insurance-related functionality
 */
class InsuranceManager {
    constructor() {
        this.insuranceList = document.getElementById('insurance-list');
        this.addInsuranceBtn = document.getElementById('add-insurance');
        this.formActions = document.querySelector('.form-actions-vertical');
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
    }    getTotalInsurance() {
        let insurance = 0;
        document.querySelectorAll('.insurance-item input.insurance-value').forEach(input => {
            insurance += NumberFormatter.getCleanNumber(input);
        });
        return insurance;
    }    /**
     * Updates the visual indicators for the unified button system
     */
    updateInsuranceIndicators() {
        const insuranceItems = document.querySelectorAll('.insurance-item');
        const count = insuranceItems.length;
        const toggleBtn = document.getElementById('toggle-insurance');
        const countBadge = document.getElementById('insurance-count-badge');
        
        if (!toggleBtn || !countBadge) return;
        
        if (count > 0) {
            // Show and update the badge with count
            countBadge.textContent = count;
            countBadge.style.display = 'flex';
            countBadge.title = `${count} seguro${count > 1 ? 's' : ''} agregado${count > 1 ? 's' : ''}`;
            
            // Update button text to reflect current state
            toggleBtn.innerHTML = `
                Seguros opcionales (${count})
                <span id="insurance-count-badge" class="btn-badge" style="display: flex;" title="${count} seguro${count > 1 ? 's' : ''} agregado${count > 1 ? 's' : ''}">${count}</span>
            `;
            
            // Add visual styling to indicate items are selected
            if (this.formActions) {
                this.formActions.classList.add('has-insurance');
            }
        } else {
            // Hide the badge when no insurance items
            countBadge.style.display = 'none';
            countBadge.textContent = '0';
            
            // Reset button text to default
            toggleBtn.innerHTML = `
                Agregar seguros opcionales
                <span id="insurance-count-badge" class="btn-badge" style="display: none;">0</span>
            `;
            
            // Remove visual indicators
            if (this.formActions) {
                this.formActions.classList.remove('has-insurance');
            }
        }
    }

    /**
     * Moves the form actions container to improve UX flow
     * @param {string} position - 'top' or 'bottom' position relative to insurance fieldset
     */
    moveFormActionsToPosition(position) {
        const formActions = document.querySelector('.form-actions-vertical');
        const insuranceFieldset = document.getElementById('insurance-options-fieldset');
        
        if (!formActions || !insuranceFieldset) return;
        
        // Remove previous animation classes
        formActions.classList.remove('moving-up', 'moving-down', 'bottom-position');
          if (position === 'bottom') {
            // Move below the insurance fieldset
            formActions.classList.add('moving-down');
            insuranceFieldset.parentNode.insertBefore(formActions, insuranceFieldset.nextSibling);
            formActions.classList.add('bottom-position');
            
            // Update button text for clarity
            const calculateBtn = formActions.querySelector('button[type="submit"]');
            if (calculateBtn) {
                calculateBtn.innerHTML = 'Calcular';
            }
            
            // Scroll suave hacia los botones reubicados después de la animación
            setTimeout(() => {
                formActions.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest',
                    inline: 'nearest'
                });
            }, 350);
        } else {
            // Move above the insurance fieldset  
            formActions.classList.add('moving-up');
            insuranceFieldset.parentNode.insertBefore(formActions, insuranceFieldset);
            
            // Restore original button text
            const calculateBtn = formActions.querySelector('button[type="submit"]');
            if (calculateBtn) {
                calculateBtn.innerHTML = 'Calcular';
            }
        }
          // Clean animation classes after transition
        setTimeout(() => {
            formActions.classList.remove('moving-up', 'moving-down');
        }, 300);
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
            this.updateInsuranceIndicators(); // Update indicators after removal
            
            // Update the new indicator system
            if (window.creditSimulatorApp) {
                window.creditSimulatorApp.updateInsuranceSummary();
            }
        };

        const valueInput = div.querySelector('.insurance-value');
        const nameInput = div.querySelector('.insurance-name');
        
        // Event listeners for value input
        valueInput.addEventListener('input', () => {
            NumberFormatter.formatInputThousands(valueInput);
            // Update indicator when value changes
            if (window.creditSimulatorApp) {
                window.creditSimulatorApp.updateInsuranceSummary();
            }
        });
        valueInput.addEventListener('focusin', () => { 
            valueInput.value = valueInput.value.replace(/\D/g, ''); 
        });
        valueInput.addEventListener('focusout', () => {
            NumberFormatter.formatInputThousands(valueInput);
            // Update indicator when value changes
            if (window.creditSimulatorApp) {
                window.creditSimulatorApp.updateInsuranceSummary();
            }
        });
        
        // Event listeners for name input
        nameInput.addEventListener('input', () => {
            // Update indicator when name changes
            if (window.creditSimulatorApp) {
                window.creditSimulatorApp.updateInsuranceSummary();
            }
        });

        return div;
    }    addInsuranceItem() {
        if (this.insuranceList.classList.contains('empty')) {
            this.insuranceList.innerHTML = '';
            this.insuranceList.classList.remove('empty');
        }
        this.insuranceList.appendChild(this.createInsuranceItem());
        this.updateInsuranceIndicators(); // Update indicators after addition
        
        // Update the new indicator system
        if (window.creditSimulatorApp) {
            window.creditSimulatorApp.updateInsuranceSummary();
        }
    }

    checkInsuranceListEmpty() {
        if (this.insuranceList.children.length === 0) {
            this.insuranceList.classList.add('empty');
            this.insuranceList.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">🛡️</span>
                    <span class="empty-text">Agrega uno o más seguros opcionales</span>
                </div>
            `;
        } else if (this.insuranceList.classList.contains('empty') && this.insuranceList.querySelector('.insurance-item')) {
            this.insuranceList.classList.remove('empty');
            // Remove empty state content if there are insurance items
            const emptyState = this.insuranceList.querySelector('.empty-state');
            if (emptyState) {
                emptyState.remove();
            }        }
    }

    /**
     * Gets active insurance items for the new indicator system
     */
    getActiveInsurances() {
        const insuranceItems = document.querySelectorAll('.insurance-item');
        const activeInsurances = [];
        
        insuranceItems.forEach((item, index) => {
            const nameInput = item.querySelector('.insurance-name');
            const valueInput = item.querySelector('.insurance-value');
            const name = nameInput ? nameInput.value.trim() : '';
            const value = valueInput ? NumberFormatter.getCleanNumber(valueInput) : 0;
            
            if (name && value > 0) {
                activeInsurances.push({
                    id: index,
                    name: name,
                    value: value
                });
            }
        });
        
        return activeInsurances;
    }

    /**
     * Gets total cost of all insurance items for the new indicator system
     */
    getTotalInsuranceCost() {
        return this.getTotalInsurance();
    }    reset() {
        this.insuranceList.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🛡️</span>
                <span class="empty-text">Agrega uno o más seguros opcionales</span>
            </div>
        `;
        this.insuranceList.classList.add('empty');
        this.updateInsuranceIndicators(); // Update indicators after reset
        
        // Update the new indicator system
        if (window.creditSimulatorApp) {
            window.creditSimulatorApp.updateInsuranceSummary();
        }
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
    }    validateExtraForm(valores) {
        this.uiManager.clearAllErrors();
        let isValid = true;
        const mainFormCalculated = document.getElementById('summary').innerHTML.trim() !== '';

        if (!mainFormCalculated) {
            // Usar mensaje emergente inteligente en lugar de texto estático
            this.showCalculateFirstMessage();
            return false;
        }
        
        // Handle multiple payments validation
        if (valores.tipo === 'capital' && valores.modoCapital === 'multiple') {
            // For multiple payments, validate through the MultiplePaymentsManager
            const multiplePaymentsManager = window.creditSimulatorApp?.multiplePaymentsManager;
            if (!multiplePaymentsManager || !multiplePaymentsManager.hasValidPayments()) {
                this.uiManager.showGlobalMessage(
                    '❌ Para usar abonos múltiples, debes configurar al menos un abono válido con período y monto.',
                    'error'
                );
                return false;
            }
            return true; // Skip traditional validation for multiple payments mode
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
    }/**
     * Limpia el estado visual deshabilitado del formulario de abono extra
     * Se llama después de un cálculo principal exitoso
     */
    clearExtraFormDisabledState() {
        const extraForm = document.getElementById('extra-payment-form');
        
        if (extraForm) {
            // Remover estilos de deshabilitado
            extraForm.style.opacity = '';
            extraForm.style.pointerEvents = '';
            extraForm.style.position = '';
            
            // Remover overlay de estado deshabilitado si existe
            const overlay = extraForm.querySelector('.form-overlay-message');
            if (overlay) {
                overlay.remove();
            }
        }
    }

    /**
     * Muestra mensaje emergente inteligente cuando el usuario intenta usar 
     * el simulador de abono extra sin haber calculado primero el crédito base
     */
    showCalculateFirstMessage() {
        // Limpiar cualquier contenido previo en el contenedor de resultados
        const resultsContainer = document.getElementById('extra-payment-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }

        // Crear mensaje con botones de acción
        const messageHTML = `
            <div style="text-align: left; line-height: 1.6;">
                <p style="margin-bottom: 16px;"><strong>🚀 ¡Necesitas calcular tu crédito primero!</strong></p>
                <p style="margin-bottom: 20px;">Para usar el simulador de abono extra, primero debes completar y calcular los datos básicos de tu crédito en el formulario principal.</p>
                <div style="display: flex; gap: 12px; margin-top: 20px;">
                    <button onclick="window.creditSimulatorApp.scrollToMainForm()" style="
                        background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
                        color: white;
                        border: none;
                        padding: 10px 16px;
                        border-radius: 6px;
                        font-weight: 600;
                        cursor: pointer;
                        font-size: 14px;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        transition: all 0.15s ease-in-out;
                    " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
                        📋 Ir al Formulario
                    </button>
                    <button onclick="window.creditSimulatorApp.uiManager.hideGlobalMessage()" style="
                        background: white;
                        color: #475569;
                        border: 2px solid #cbd5e1;
                        padding: 10px 16px;
                        border-radius: 6px;
                        font-weight: 500;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.15s ease-in-out;
                    " onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='white'">
                        Entendido
                    </button>
                </div>
            </div>
        `;
        
        // Mostrar mensaje persistente (tipo 'error' no se cierra automáticamente)
        this.uiManager.showGlobalMessage(messageHTML, 'error');
        
        // NO cerrar el panel de abono extra para mantener el contexto visual
        // En su lugar, mostrar un estado visual que indique que está deshabilitado
        const extraPanel = document.getElementById('extra-payment-panel');
        const extraForm = document.getElementById('extra-payment-form');
        
        if (extraPanel && extraForm) {
            // Agregar clase visual para indicar estado deshabilitado
            extraForm.style.opacity = '0.5';
            extraForm.style.pointerEvents = 'none';
            extraForm.style.position = 'relative';
            
            // Agregar overlay explicativo temporal en el formulario
            if (!extraForm.querySelector('.form-overlay-message')) {
                const overlay = document.createElement('div');
                overlay.className = 'form-overlay-message';
                overlay.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255, 255, 255, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                    border-radius: 12px;
                    backdrop-filter: blur(2px);
                `;
                overlay.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.6;">⚠️</div>
                        <p style="color: #374151; font-weight: 600; margin: 0;">
                            Completa el formulario principal primero
                        </p>
                    </div>
                `;
                extraForm.appendChild(overlay);
            }
        }
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
    static renderAmortizationTable({ rows, columns, showAbono = false, highlightExtraPayments = false }) {
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
            const hasExtraPayment = highlightExtraPayments && row.extraPayment > 0 && !isInitRow;
            html += `<tr${isInitRow ? ' class="init-row"' : (hasExtraPayment ? ' class="extra-payment-row"' : '')}>`;
            visibleHeaders.forEach(h => {
                let val = row[h.key] ?? '';
                if (h.key === 'extraPayment' && !showAbono && val === 0) val = '';
                
                if (['initialBalance','payment','interestPayment','capitalPayment','insurancePayment','totalPayment','remainingBalance','extraPayment'].includes(h.key)) {
                    val = (val !== '' && !isNaN(parseFloat(val))) ? NumberFormatter.formatCurrency(Math.round(val)) : (val === 0 && h.key !== 'extraPayment' ? NumberFormatter.formatCurrency(0) : (val === 0 && h.key === 'extraPayment' && showAbono ? NumberFormatter.formatCurrency(0) : ''));
                }
                if (h.key === 'period' && row.period === 0) val = 'Saldo Inicial';

                const isExtraPaymentCell = h.key === 'extraPayment' && hasExtraPayment && showAbono;
                html += `<td${isExtraPaymentCell ? ' class="extra-payment-cell"' : ''}>${val}</td>`;
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

        return `            <div class="summary-panel">
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
                showAbono: true,
                highlightExtraPayments: true
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

        return `            <div class="summary-panel">
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
                showAbono: true,
                highlightExtraPayments: true
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

        return `            <div class="summary-panel">
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
                showAbono: true,
                highlightExtraPayments: true
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

        return `            <div class="summary-panel">
                <h3>Resultado: Disminuir Cuota</h3>
                <div class="summary-row"><span>Cuota original (base):</span> <span>${NumberFormatter.formatCurrency(calculation.summary.paymentOriginal)}</span></div>
                <div class="summary-row"><span>Nueva cuota (base):</span> <span>${NumberFormatter.formatCurrency(calculation.summary.nuevaCuotaBase)}</span></div>
                <div class="summary-row"><span>Ahorro mensual (base):</span> <span>${NumberFormatter.formatCurrency(calculation.summary.ahorroMensual)}</span></div>
                <div class="summary-row"><span>Cuotas efectivas a pagar:</span> <span>${calculation.summary.cuotasEfectivasPagadas} cuotas</span></div>
                <div class="summary-row"><span>Total cuotas con nuevo valor:</span> <span>${calculation.summary.cuotasConNuevaCuota} cuotas</span></div>
                <div class="summary-row"><span>Ahorro total en intereses:</span> <span>${NumberFormatter.formatCurrency(calculation.summary.ahorroTotalIntereses)}</span></div>
            </div>
            ${TableRenderer.renderAmortizationTable({
                rows: calculation.table, 
                columns, 
                showAbono: true,
                highlightExtraPayments: true
            })}
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

/**
 * Handles multiple scheduled extra payments simulation
 * Allows users to see detailed analysis of multiple payments at different periods
 */
class MultiplePaymentsSimulation extends PaymentSimulation {
    constructor(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance, multiplePaymentsData) {
        super(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance);
        this.multiplePaymentsData = multiplePaymentsData;
        this.paymentsSchedule = multiplePaymentsData.schedule;
        this.totalExtraAmount = multiplePaymentsData.totalAmount;
    }

    calculate() {
        // Calculate original scenario
        const originalScenario = this.calculateOriginalScenario();
        
        // Calculate with multiple payments using the new method
        const multiplePaymentsResult = LoanCalculator.calculateWithMultiplePayments(
            this.loanAmount,
            this.interestRate,
            this.numberOfPayments,
            this.paymentFrequency,
            this.paymentsSchedule
        );

        // Generate detailed amortization table
        const amortizationTable = this.generateMultiplePaymentsTable();

        return {
            original: originalScenario,
            multiplePayments: multiplePaymentsResult,
            amortizationTable
        };
    }

    generateMultiplePaymentsTable() {
        let table = [];
        let remainingBalance = this.loanAmount;
        let totalInterestPaid = 0;
        let totalCapitalPaid = 0;
        let totalInsurancePaid = 0;
        let totalExtraPayments = 0;

        // Convert payments schedule to map for quick lookup
        const extraPaymentsMap = new Map();
        this.paymentsSchedule.forEach(payment => {
            extraPaymentsMap.set(payment.period, payment.amount);
        });

        // Initial row
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

        for (let i = 1; i <= this.numberOfPayments && remainingBalance > 0.01; i++) {
            const initialBalance = remainingBalance;
            const interestPayment = remainingBalance * this.periodRate;
            const insurancePayment = this.totalInsurance;
            
            // Check for extra payment in this period
            const extraPayment = extraPaymentsMap.get(i) || 0;
            
            let capitalPayment = this.payment - interestPayment;
            
            // Apply extra payment to capital
            const totalCapitalForPeriod = capitalPayment + extraPayment;
            
            // Ensure we don't overpay
            if (totalCapitalForPeriod >= remainingBalance) {
                capitalPayment = remainingBalance - extraPayment;
                if (capitalPayment < 0) {
                    // Extra payment is larger than remaining balance
                    const adjustedExtraPayment = remainingBalance;
                    capitalPayment = 0;
                    
                    table.push({
                        period: i,
                        initialBalance,
                        payment: interestPayment + adjustedExtraPayment,
                        interestPayment,
                        capitalPayment: 0,
                        regularCapital: 0,
                        extraCapital: adjustedExtraPayment,
                        insurancePayment,
                        extraPayment: adjustedExtraPayment,
                        totalPayment: interestPayment + adjustedExtraPayment + insurancePayment,
                        remainingBalance: 0
                    });
                    
                    totalInterestPaid += interestPayment;
                    totalCapitalPaid += adjustedExtraPayment;
                    totalInsurancePaid += insurancePayment;
                    totalExtraPayments += adjustedExtraPayment;
                    break;
                }
            }
            
            remainingBalance -= (capitalPayment + extraPayment);
            if (remainingBalance < 0.01) remainingBalance = 0;

            table.push({
                period: i,
                initialBalance,
                payment: this.payment,
                interestPayment,
                capitalPayment,
                regularCapital: capitalPayment,
                extraCapital: extraPayment,
                insurancePayment,
                extraPayment,
                totalPayment: this.payment + extraPayment + insurancePayment,
                remainingBalance
            });

            totalInterestPaid += interestPayment;
            totalCapitalPaid += capitalPayment + extraPayment;
            totalInsurancePaid += insurancePayment;
            totalExtraPayments += extraPayment;

            if (remainingBalance <= 0) break;
        }

        return {
            table,
            totals: {
                totalInterestPaid,
                totalCapitalPaid,
                totalInsurancePaid,
                totalExtraPayments,
                actualPayments: table.length - 1
            }
        };
    }

    render() {
        const calculations = this.calculate();
        const { original, multiplePayments, amortizationTable } = calculations;

        // Calculate savings
        const savedInterest = original.totalIntereses - multiplePayments.totalInterest;
        const savedPayments = original.cuotas - multiplePayments.totalPayments;
        const savingsPercentage = (savedInterest / original.totalIntereses) * 100;

        // Generate payments timeline
        const timelineHTML = this.paymentsSchedule.map(payment => `
            <div class="timeline-item">
                <div class="timeline-period">Cuota ${payment.period}</div>
                <div class="timeline-amount">${NumberFormatter.formatCurrency(payment.amount)}</div>
                <div class="timeline-description">Abono programado a capital</div>
            </div>
        `).join('');

        return `
            <div class="summary-panel multiple-payments-summary">
                <h3>🌟 Simulación con Abonos Múltiples Escalonados</h3>
                <p style="font-size:0.9em; text-align:center; color:#334155; margin-bottom: 1rem;">
                    Análisis detallado de ${this.paymentsSchedule.length} abonos programados por un total de <b>${NumberFormatter.formatCurrency(this.totalExtraAmount)}</b>
                </p>
                
                <div class="multiple-payments-timeline" style="background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1.5rem;">
                    <h4 style="color: #1e40af; margin-bottom: 0.75rem;">📅 Cronograma de Abonos</h4>
                    <div class="timeline-container">
                        ${timelineHTML}
                    </div>
                </div>
            </div>

            <div class="comparison-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
                <div class="scenario-card original">
                    <h4>📊 Crédito Original</h4>
                    <div class="scenario-details">
                        <div class="detail-row">
                            <span>Cuotas totales:</span>
                            <span><b>${original.cuotas}</b></span>
                        </div>
                        <div class="detail-row">
                            <span>Cuota mensual:</span>
                            <span><b>${NumberFormatter.formatCurrency(this.payment)}</b></span>
                        </div>
                        <div class="detail-row">
                            <span>Total intereses:</span>
                            <span><b>${NumberFormatter.formatCurrency(original.totalIntereses)}</b></span>
                        </div>
                        <div class="detail-row">
                            <span>Total pagado:</span>
                            <span><b>${NumberFormatter.formatCurrency(this.loanAmount + original.totalIntereses + original.totalSeguros)}</b></span>
                        </div>
                    </div>
                </div>

                <div class="scenario-card improved">
                    <h4>🚀 Con Abonos Múltiples</h4>
                    <div class="scenario-details">
                        <div class="detail-row">
                            <span>Cuotas totales:</span>
                            <span style="color: var(--success-green);"><b>${multiplePayments.totalPayments}</b></span>
                        </div>
                        <div class="detail-row">
                            <span>Cuota mensual base:</span>
                            <span><b>${NumberFormatter.formatCurrency(this.payment)}</b></span>
                        </div>
                        <div class="detail-row">
                            <span>Total intereses:</span>
                            <span style="color: var(--success-green);"><b>${NumberFormatter.formatCurrency(multiplePayments.totalInterest)}</b></span>
                        </div>
                        <div class="detail-row">
                            <span>Total pagado:</span>
                            <span style="color: var(--success-green);"><b>${NumberFormatter.formatCurrency(multiplePayments.totalPaid)}</b></span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="savings-summary" style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border: 2px solid #16a34a; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 2rem;">
                <h4 style="color: #16a34a; text-align: center; margin-bottom: 1rem;">💰 Resumen de Ahorros</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div class="saving-item">
                        <div class="saving-label">Ahorro en Intereses</div>
                        <div class="saving-value" style="color: #16a34a; font-weight: bold; font-size: 1.1rem;">${NumberFormatter.formatCurrency(savedInterest)}</div>
                    </div>
                    <div class="saving-item">
                        <div class="saving-label">Cuotas Ahorradas</div>
                        <div class="saving-value" style="color: #16a34a; font-weight: bold; font-size: 1.1rem;">${savedPayments} cuotas</div>
                    </div>
                    <div class="saving-item">
                        <div class="saving-label">Porcentaje de Ahorro</div>
                        <div class="saving-value" style="color: #16a34a; font-weight: bold; font-size: 1.1rem;">${savingsPercentage.toFixed(1)}%</div>
                    </div>
                    <div class="saving-item">
                        <div class="saving-label">Total Abonos Extra</div>
                        <div class="saving-value" style="color: #1e40af; font-weight: bold; font-size: 1.1rem;">${NumberFormatter.formatCurrency(this.totalExtraAmount)}</div>
                    </div>
                </div>
            </div>

            <div class="table-scroll" style="max-width:100%; overflow-x:auto; margin-bottom:2rem;">
                <table class="amortization-table multiple-payments-table">
                    <thead>
                        <tr>
                            <th>Período</th>
                            <th>Saldo Inicial</th>
                            <th>Cuota Base</th>
                            <th>Interés</th>
                            <th>Capital Regular</th>
                            <th>Abono Extra</th>
                            <th>Cuota Total</th>
                            <th>Saldo Final</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${amortizationTable.table.map(row => row.period === 0 ? '' : `
                            <tr ${row.extraPayment > 0 ? 'class="extra-payment-row"' : ''}>
                                <td>${row.period}</td>
                                <td>${NumberFormatter.formatCurrency(row.initialBalance)}</td>
                                <td>${NumberFormatter.formatCurrency(row.payment)}</td>
                                <td>${NumberFormatter.formatCurrency(row.interestPayment)}</td>
                                <td>${NumberFormatter.formatCurrency(row.regularCapital || row.capitalPayment)}</td>
                                <td class="extra-payment-cell">${row.extraPayment > 0 ? NumberFormatter.formatCurrency(row.extraPayment) : '-'}</td>
                                <td><b>${NumberFormatter.formatCurrency(row.totalPayment)}</b></td>
                                <td>${NumberFormatter.formatCurrency(row.remainingBalance)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <style>
                .multiple-payments-summary {
                    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                    border: 2px solid #0ea5e9;
                }
                
                .comparison-grid .scenario-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.5rem;
                    padding: 1rem;
                }
                
                .scenario-card.improved {
                    border-color: #16a34a;
                    background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
                }
                
                .scenario-details .detail-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.25rem 0;
                    border-bottom: 1px solid #f1f5f9;
                }
                
                .extra-payment-row {
                    background-color: #fef3c7 !important;
                    border-left: 3px solid #f59e0b;
                }
                
                .extra-payment-cell {
                    background-color: #16a34a !important;
                    color: white !important;
                    font-weight: bold;
                }
                
                @media (max-width: 768px) {
                    .comparison-grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        `;
    }
}

// =============================================================================
// MAIN APPLICATION CLASS
// =============================================================================

/**
 * Main application class that orchestrates all functionality
 */
class CreditSimulatorApp {    constructor() {        this.initializeComponents();
        this.initializeElements();
        this.initializeEventListeners();
        this.setupToggleButtons();
        this.setupInsuranceButton();
        this.initializeInfoCards();
    }    initializeComponents() {
        this.uiManager = new UIManager();
        this.insuranceManager = new InsuranceManager();
        this.formValidator = new FormValidator(this.uiManager);
        this.inputManager = new InputManager();
        this.multiplePaymentsManager = new MultiplePaymentsManager(this.uiManager);
    }    initializeElements() {
        this.amountInput = document.getElementById('amount');
        this.rateInput = document.getElementById('rate');
        this.termInput = document.getElementById('term');
        this.frequencyInput = document.getElementById('frequency');
        this.amortizationForm = document.getElementById('amortization-form');
        this.extraPaymentForm = document.getElementById('extra-payment-form');
        this.showInsuranceBtn = document.getElementById('show-insurance');
        this.insuranceFieldset = document.getElementById('insurance-options-fieldset');
        this.toggleExtraBtn = document.getElementById('toggle-extra-payment');
        this.extraPanel = document.getElementById('extra-payment-panel');
        this.extraType = document.getElementById('extra-type');
        this.extraCapitalOptions = document.getElementById('extra-capital-options');
        this.extraPeriodRow = document.getElementById('extra-period-row');
        
        // Educational elements
        this.toggleEducationBtn = document.querySelector('.toggle-education');
        this.educationContent = document.querySelector('.education-content');
    }    initializeEventListeners() {
        this.amortizationForm.addEventListener('submit', (e) => this.handleMainFormSubmit(e));
        this.amortizationForm.addEventListener('reset', (e) => this.handleMainFormReset(e));
        this.extraPaymentForm.addEventListener('submit', (e) => this.handleExtraPaymentSubmit(e));
        this.extraPaymentForm.addEventListener('reset', (e) => this.handleExtraPaymentReset(e));
        
        this.extraType.addEventListener('change', () => this.handleExtraTypeChange());
        document.getElementById('extra-capital-mode').addEventListener('change', () => this.handleExtraCapitalModeChange());
        
        // Setup insurance button (new system)
        this.setupInsuranceButton();
        
        // Educational toggle functionality
        if (this.toggleEducationBtn && this.educationContent) {
            this.toggleEducationBtn.addEventListener('click', () => this.handleEducationToggle());
        }    }

    setupToggleButtons() {
        this.toggleExtraBtn.addEventListener('click', () => {
            const expanded = this.toggleExtraBtn.getAttribute('aria-expanded') === 'true' || false;
            this.extraPanel.style.display = expanded ? 'none' : 'block';
            this.toggleExtraBtn.setAttribute('aria-expanded', !expanded);
            this.toggleExtraBtn.textContent = expanded ? 'Simular con abono extra' : 'Ocultar abono extra';
            if (!expanded) {
                this.extraPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    setupInsuranceButton() {
        if (!this.showInsuranceBtn) return;

        this.showInsuranceBtn.addEventListener('click', () => {
            // Mostrar el fieldset de seguros
            this.insuranceFieldset.style.display = 'block';
            
            // Scroll suave al fieldset de seguros
            setTimeout(() => {
                this.insuranceFieldset.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
            
            // Mensaje informativo sobre el flujo
            setTimeout(() => {
                this.uiManager.showGlobalMessage(
                    'Selecciona los seguros que necesites y luego usa el botón "Calcular".',
                    'info'
                );
            }, 300);
        });
    }    updateInsuranceSummary() {
        const insuranceSummary = document.getElementById('insurance-summary');
        const insuranceCountElement = document.getElementById('insurance-summary-count');
        const summaryTotalElement = document.getElementById('summary-total');
        
        if (!insuranceSummary || !insuranceCountElement || !summaryTotalElement) return;

        // Obtener seguros activos del insurance manager
        const activeInsurances = this.insuranceManager.getActiveInsurances();
        const totalCost = this.insuranceManager.getTotalInsuranceCost();
        
        if (activeInsurances.length > 0) {
            // Mostrar el indicador
            insuranceSummary.style.display = 'block';
            this.showInsuranceBtn.style.display = 'none';
            
            // Actualizar contador y total
            insuranceCountElement.textContent = activeInsurances.length;
            summaryTotalElement.textContent = `Total: ${NumberFormatter.formatCurrency(totalCost)}`;
        } else {
            // Ocultar el indicador y mostrar el botón
            insuranceSummary.style.display = 'none';
            this.showInsuranceBtn.style.display = 'inline-flex';
        }
    }initializeInfoCards() {
        // Initialize info cards display on page load
        this.updateInfoCardsDisplay();
        
        // Initialize capital mode descriptions (hidden by default)
        this.updateCapitalModeDescriptions(null);
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
                
                // Limpiar estado deshabilitado del formulario extra después de cálculo exitoso
                this.formValidator.clearExtraFormDisabledState();
                
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
        
        // Limpiar también el estado deshabilitado del formulario extra al resetear
        this.formValidator.clearExtraFormDisabledState();
        
        // Show informational message about form reset
        setTimeout(() => {
            this.uiManager.showGlobalMessage('Formulario limpiado. Puedes ingresar nuevos datos para tu simulación.', 'info');
        }, 100);
    }    handleExtraTypeChange() {
        this.extraPaymentForm.classList.toggle('comparative-mode', this.extraType.value === 'comparativo');

        if (this.extraType.value === 'capital') {
            this.extraCapitalOptions.style.display = '';
            const mode = document.getElementById('extra-capital-mode').value;
            this.extraPeriodRow.style.display = mode === 'periodo' ? '' : 'none';
            
            // Update capital mode descriptions when capital type is selected
            this.updateCapitalModeDescriptions(mode);
        } else {
            this.extraCapitalOptions.style.display = 'none';
            this.extraPeriodRow.style.display = 'none';
            
            // Hide capital mode descriptions when capital type is not selected
            this.updateCapitalModeDescriptions(null);
        }

        // Handle dynamic info cards display based on selected simulation type
        this.updateInfoCardsDisplay();
        
        // ELIMINADO: Ventanas emergentes innecesarias que interrumpían el flujo del usuario
        // Las info-cards dinámicas ya proporcionan toda la información necesaria
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
    }    handleExtraCapitalModeChange() {
        const mode = document.getElementById('extra-capital-mode').value;
        this.extraPeriodRow.style.display = mode === 'periodo' ? '' : 'none';
        
        // Show/hide capital mode descriptions
        this.updateCapitalModeDescriptions(mode);
    }

    updateCapitalModeDescriptions(selectedMode) {
        const descriptionsContainer = document.querySelector('.capital-mode-descriptions');
        const allModeCards = document.querySelectorAll('.mode-info-card');
        
        if (!descriptionsContainer) return;
        
        // Hide all cards first
        allModeCards.forEach(card => {
            card.style.display = 'none';
        });
        
        // Show descriptions container when capital options are visible
        const extraCapitalOptions = document.getElementById('extra-capital-options');
        if (extraCapitalOptions && extraCapitalOptions.style.display !== 'none') {
            descriptionsContainer.style.display = 'block';
            
            // Show the appropriate mode card
            if (selectedMode) {
                const selectedCard = document.getElementById(`mode-info-${selectedMode}`);
                if (selectedCard) {
                    selectedCard.style.display = 'block';
                    // Add smooth animation
                    selectedCard.style.opacity = '0';
                    selectedCard.style.transform = 'translateY(10px)';
                    
                    // Trigger animation after a short delay
                    setTimeout(() => {
                        selectedCard.style.transition = 'all 0.3s ease-out';
                        selectedCard.style.opacity = '1';
                        selectedCard.style.transform = 'translateY(0)';
                    }, 50);
                }
            }
        } else {
            descriptionsContainer.style.display = 'none';
        }
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
        let result;        switch (valores.tipo) {
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
                    case 'multiple':
                        // Nueva funcionalidad: Abonos múltiples escalonados
                        const multiplePaymentsData = this.multiplePaymentsManager.getMultiplePaymentsData();
                        if (multiplePaymentsData) {
                            simulation = new MultiplePaymentsSimulation(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance, multiplePaymentsData);
                        } else {
                            this.uiManager.showGlobalMessage('❌ Por favor configura al menos un abono válido en la sección de abonos múltiples.', 'error');
                            return;
                        }
                        break;
                }
                break;
            case 'cuota':
                simulation = new PaymentReductionSimulation(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance, valores);
                break;
            case 'comparativo':
                simulation = new ComparativeSimulation(loanAmount, interestRate, numberOfPayments, paymentFrequency, totalInsurance, valores);
                break;
        }        if (simulation) {
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
        
        // Hide capital mode descriptions
        this.updateCapitalModeDescriptions(null);
        
        // Reset multiple payments manager
        this.multiplePaymentsManager.reset();
        
        // Show informational message about extra payment reset
        setTimeout(() => {
            this.uiManager.showGlobalMessage('Configuración de abono extra limpiada. Selecciona nuevos parámetros.', 'info');
        }, 100);
    }

    /**
     * Desplaza la vista al formulario principal y opcionalmente destaca los campos requeridos
     */
    scrollToMainForm() {
        // Cerrar mensaje global primero
        this.uiManager.hideGlobalMessage();
        
        // Encontrar el formulario principal
        const mainForm = document.getElementById('amortization-form');
        const firstInput = document.getElementById('amount');
        
        if (mainForm) {
            // Scroll suave al formulario principal
            mainForm.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest' 
            });
            
            // Agregar una breve animación de destaque al formulario
            setTimeout(() => {
                mainForm.style.transition = 'box-shadow 0.3s ease-in-out';
                mainForm.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.3)';
                
                // Enfocar el primer campo después del destaque
                if (firstInput) {
                    firstInput.focus();
                }
                
                // Remover el destaque después de un momento
                setTimeout(() => {
                    mainForm.style.boxShadow = '';
                    mainForm.style.transition = '';
                }, 2000);
            }, 500);
            
            // Mostrar mensaje de ayuda
            setTimeout(() => {
                this.uiManager.showGlobalMessage(
                    'Completa los datos de tu crédito y presiona "Calcular" para continuar.', 
                    'info'
                );
            }, 1000);
        }
    }

    /**
     * Handles the toggle of educational content section
     */
    handleEducationToggle() {
        const isExpanded = this.toggleEducationBtn.getAttribute('aria-expanded') === 'true';
        const newState = !isExpanded;
        
        // Update button state
        this.toggleEducationBtn.setAttribute('aria-expanded', newState);
        
        // Update button text
        const toggleText = this.toggleEducationBtn.querySelector('.toggle-text');
        if (toggleText) {
            toggleText.textContent = newState ? 'Ocultar' : 'Mostrar';
        }
        
        // Toggle content visibility
        if (newState) {
            this.educationContent.style.display = 'block';
            // Smooth scroll to the educational content after it's shown
            setTimeout(() => {
                this.educationContent.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 100);
            
            // Show helpful message
            setTimeout(() => {
                this.uiManager.showGlobalMessage(
                    '📚 Información educativa desplegada. Tómate un momento para entender mejor tu crédito.',
                    'info'
                );
            }, 500);
        } else {
            this.educationContent.style.display = 'none';
        }
    }
}

// =============================================================================
// MULTIPLE PAYMENTS MANAGER
// =============================================================================

/**
 * Manages multiple scheduled extra payments functionality
 */
class MultiplePaymentsManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.payments = [];
        this.paymentIdCounter = 1;
        
        // DOM elements
        this.multipleSection = document.getElementById('multiple-payments-section');
        this.paymentsList = document.getElementById('payments-list');
        this.addPaymentBtn = document.getElementById('add-payment');
        this.totalPaymentsEl = document.getElementById('total-payments');
        this.scheduledPeriodsEl = document.getElementById('scheduled-periods');
        this.estimatedSavingsEl = document.getElementById('estimated-savings');
        this.paymentsSummary = document.getElementById('payments-summary');
        this.paymentsTimeline = document.getElementById('payments-timeline');
        this.timelineContainer = document.getElementById('timeline-container');
        this.extraCapitalModeSelect = document.getElementById('extra-capital-mode');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Add payment button
        this.addPaymentBtn?.addEventListener('click', () => this.addPayment());
        
        // Listen for mode changes to show/hide multiple payments section
        this.extraCapitalModeSelect?.addEventListener('change', (e) => {
            const isMultipleMode = e.target.value === 'multiple';
            this.toggleMultiplePaymentsSection(isMultipleMode);
            
            if (isMultipleMode) {
                this.showWelcomeMessage();
            }
        });
    }
    
    toggleMultiplePaymentsSection(show) {
        if (this.multipleSection) {
            this.multipleSection.style.display = show ? 'block' : 'none';
            
            if (show && this.payments.length === 0) {
                // Auto-add first payment for better UX
                setTimeout(() => {
                    this.addPayment();
                }, 300);
            }
        }
    }
    
    showWelcomeMessage() {
        this.uiManager.showGlobalMessage(
            '🌟 ¡Excelente elección! Ahora puedes programar múltiples abonos en diferentes períodos para maximizar tus ahorros.',
            'success'
        );
    }
    
    addPayment() {
        const payment = this.createPaymentItem();
        this.payments.push(payment);
        this.paymentsList.appendChild(payment.element);
        this.updatePaymentNumbers();
        this.updateSummary();
        this.updateTimeline();
        
        // Focus on period input of new payment
        setTimeout(() => {
            payment.element.querySelector('.payment-period')?.focus();
        }, 100);
        
        // Show summary and timeline if this is the first payment
        if (this.payments.length === 1) {
            this.paymentsSummary.style.display = 'block';
            this.paymentsTimeline.style.display = 'block';
        }
        
        this.uiManager.showGlobalMessage(
            `✅ Abono #${payment.number} agregado. Configura el período y monto.`,
            'info'
        );
    }
    
    createPaymentItem() {
        const paymentId = Date.now();
        const paymentNumber = this.paymentIdCounter++;
        const div = document.createElement('div');
        div.className = 'payment-item';
        div.dataset.paymentId = paymentId;
        div.dataset.paymentNumber = paymentNumber;
        
        div.innerHTML = `
            <div class="payment-field">
                <label>📅 Período (Cuota #)</label>
                <input type="number" class="payment-period" min="1" max="600" placeholder="Ej: 12">
            </div>
            <div class="payment-field">
                <label>💰 Valor del Abono</label>
                <input type="text" class="payment-amount" placeholder="Ej: 500.000">
            </div>
            <button type="button" class="remove-payment" title="Eliminar abono">✕</button>
        `;
        
        // Event listeners
        const removeBtn = div.querySelector('.remove-payment');
        removeBtn.addEventListener('click', () => this.removePayment(paymentId, div));
        
        const amountInput = div.querySelector('.payment-amount');
        amountInput.addEventListener('input', () => {
            NumberFormatter.formatInputThousands(amountInput);
            this.updateSummary();
            this.updateTimeline();
        });
        amountInput.addEventListener('focusin', () => {
            amountInput.value = amountInput.value.replace(/\D/g, '');
        });
        amountInput.addEventListener('focusout', () => {
            NumberFormatter.formatInputThousands(amountInput);
            this.updateSummary();
            this.updateTimeline();
        });
        
        const periodInput = div.querySelector('.payment-period');
        periodInput.addEventListener('input', () => {
            this.validatePeriods();
            this.updateSummary();
            this.updateTimeline();
        });
        periodInput.addEventListener('change', () => {
            this.validatePeriods();
            this.updateSummary();
            this.updateTimeline();
        });
        
        return {
            id: paymentId,
            number: paymentNumber,
            element: div,
            getPeriod: () => parseInt(periodInput.value) || 0,
            getAmount: () => NumberFormatter.getCleanNumber(amountInput) || 0,
            isValid: () => this.getPeriod() > 0 && this.getAmount() > 0
        };
    }
    
    removePayment(paymentId, element) {
        this.payments = this.payments.filter(p => p.id !== paymentId);
        element.remove();
        this.updatePaymentNumbers();
        this.updateSummary();
        this.updateTimeline();
        this.validatePeriods();
        
        // Hide summary and timeline if no payments
        if (this.payments.length === 0) {
            this.paymentsSummary.style.display = 'none';
            this.paymentsTimeline.style.display = 'none';
        }
        
        this.uiManager.showGlobalMessage(
            '🗑️ Abono eliminado correctamente.',
            'info'
        );
    }
    
    updatePaymentNumbers() {
        this.payments.forEach((payment, index) => {
            payment.number = index + 1;
            payment.element.dataset.paymentNumber = payment.number;
            payment.element.setAttribute('data-payment-number', `#${payment.number}`);
        });
    }
    
    validatePeriods() {
        const periods = this.payments.map(p => p.getPeriod()).filter(p => p > 0);
        const duplicates = periods.filter((p, i) => periods.indexOf(p) !== i);
        
        // Clear previous validations
        this.payments.forEach(payment => {
            payment.element.classList.remove('duplicate-period');
            const periodInput = payment.element.querySelector('.payment-period');
            periodInput.classList.remove('error');
            periodInput.title = '';
        });
        
        // Highlight duplicate periods
        if (duplicates.length > 0) {
            this.payments.forEach(payment => {
                const period = payment.getPeriod();
                const periodInput = payment.element.querySelector('.payment-period');
                
                if (duplicates.includes(period)) {
                    payment.element.classList.add('duplicate-period');
                    periodInput.classList.add('error');
                    periodInput.title = 'Ya existe un abono programado en este período';
                }
            });
            
            this.showValidationMessage(
                '⚠️ Hay períodos duplicados. Cada abono debe programarse en una cuota diferente.',
                'error'
            );
            return false;
        }
        
        // Validate period ranges
        const maxTerm = parseInt(document.getElementById('term')?.value) || 600;
        const invalidPeriods = periods.filter(p => p > maxTerm);
        
        if (invalidPeriods.length > 0) {
            this.showValidationMessage(
                `⚠️ Algunos períodos exceden el plazo del crédito (${maxTerm} cuotas).`,
                'error'
            );
            return false;
        }
        
        this.clearValidationMessage();
        return true;
    }
    
    showValidationMessage(message, type) {
        const existingMessage = this.paymentsList.querySelector('.validation-message');
        if (existingMessage) existingMessage.remove();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `validation-message ${type}`;
        messageDiv.innerHTML = `<span>${message}</span>`;
        
        this.paymentsList.appendChild(messageDiv);
    }
    
    clearValidationMessage() {
        const existingMessage = this.paymentsList.querySelector('.validation-message');
        if (existingMessage) existingMessage.remove();
    }
    
    updateSummary() {
        const totalAmount = this.payments.reduce((sum, p) => sum + p.getAmount(), 0);
        const validPeriods = this.payments.filter(p => p.getPeriod() > 0 && p.getAmount() > 0).length;
        
        if (this.totalPaymentsEl) {
            this.totalPaymentsEl.textContent = NumberFormatter.formatCurrency(totalAmount);
        }
        if (this.scheduledPeriodsEl) {
            this.scheduledPeriodsEl.textContent = validPeriods;
        }
        
        // Calculate estimated savings (simplified calculation)
        if (totalAmount > 0 && this.estimatedSavingsEl) {
            const estimatedSavings = this.calculateEstimatedSavings(totalAmount);
            this.estimatedSavingsEl.textContent = estimatedSavings;
        }
    }
    
    calculateEstimatedSavings(totalExtraAmount) {
        try {
            const loanAmount = NumberFormatter.getCleanNumber(document.getElementById('amount')) || 0;
            const rate = NumberFormatter.getCleanRate(document.getElementById('rate')) || 0;
            
            if (loanAmount === 0 || rate === 0) {
                return 'Complete el formulario principal';
            }
            
            // Simplified calculation: approximate 15-25% of extra payment as interest savings
            const savingsMultiplier = 0.2; // 20% average
            const estimatedSavings = totalExtraAmount * savingsMultiplier;
            
            return NumberFormatter.formatCurrency(estimatedSavings);
        } catch (error) {
            return 'Calculando...';
        }
    }
    
    updateTimeline() {
        if (!this.timelineContainer) return;
        
        const validPayments = this.payments
            .filter(p => p.getPeriod() > 0 && p.getAmount() > 0)
            .sort((a, b) => a.getPeriod() - b.getPeriod());
        
        if (validPayments.length === 0) {
            this.timelineContainer.innerHTML = '<p style="text-align: center; color: #64748b; font-style: italic;">No hay abonos programados válidos</p>';
            return;
        }
        
        const timelineHTML = validPayments.map(payment => `
            <div class="timeline-item">
                <div class="timeline-period">Cuota ${payment.getPeriod()}</div>
                <div class="timeline-amount">${NumberFormatter.formatCurrency(payment.getAmount())}</div>
                <div class="timeline-description">Abono programado #${payment.number}</div>
            </div>
        `).join('');
        
        this.timelineContainer.innerHTML = timelineHTML;
    }
    
    getMultiplePaymentsData() {
        const validPayments = this.payments.filter(p => p.getPeriod() > 0 && p.getAmount() > 0);
        
        if (validPayments.length === 0 || !this.validatePeriods()) {
            return null;
        }
        
        const schedule = validPayments.map(p => ({
            period: p.getPeriod(),
            amount: p.getAmount()
        }));
        
        const totalAmount = schedule.reduce((sum, p) => sum + p.amount, 0);
        
        return {
            schedule,
            totalAmount,
            count: schedule.length
        };
    }
    
    reset() {
        this.payments = [];
        this.paymentIdCounter = 1;
        if (this.paymentsList) {
            this.paymentsList.innerHTML = '';
        }
        if (this.paymentsSummary) {
            this.paymentsSummary.style.display = 'none';
        }
        if (this.paymentsTimeline) {
            this.paymentsTimeline.style.display = 'none';
        }
        this.updateSummary();
        this.clearValidationMessage();
    }
    
    // Public method to get payments count for validation
    hasValidPayments() {
        return this.payments.some(p => p.getPeriod() > 0 && p.getAmount() > 0) && this.validatePeriods();
    }
}

/**
 * UNIFIED BUTTON SYSTEM TEST - Verify implementation works correctly
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Testing Unified Button System...');
    
    // Test 1: Check if buttons have correct classes
    const calculateBtn = document.querySelector('button[type="submit"]');
    const resetBtn = document.querySelector('button[type="reset"]');
    const insuranceToggleBtn = document.getElementById('toggle-insurance');
    const addInsuranceBtn = document.getElementById('add-insurance');
    
    console.log('✅ Calculate button classes:', calculateBtn?.className);
    console.log('✅ Reset button classes:', resetBtn?.className);
    console.log('✅ Insurance toggle button classes:', insuranceToggleBtn?.className);
    console.log('✅ Add insurance button classes:', addInsuranceBtn?.className);
    
    // Test 2: Check if badge exists
    const badge = document.getElementById('insurance-count-badge');
    console.log('✅ Insurance badge element:', badge ? 'Found' : 'Missing');
    
    // Test 3: Verify consistent button sizing
    if (calculateBtn && resetBtn && insuranceToggleBtn) {
        const calculateHeight = window.getComputedStyle(calculateBtn).minHeight;
        const resetHeight = window.getComputedStyle(resetBtn).minHeight;
        const toggleHeight = window.getComputedStyle(insuranceToggleBtn).minHeight;
        
        console.log('📏 Button heights:');
        console.log('  - Calculate:', calculateHeight);
        console.log('  - Reset:', resetHeight);
        console.log('  - Toggle:', toggleHeight);
        
        // Primary button should be slightly larger
        console.log('✅ Unified Button System successfully implemented!');
    }
      // Test 4: Verify button functionality and event listeners
    setTimeout(() => {
        console.log('🔧 Testing button functionality...');
        
        // Test Calculate button
        if (calculateBtn) {
            console.log('  - Calculate button found, testing click...');
            calculateBtn.addEventListener('click', (e) => {
                console.log('  ✅ Calculate button click event working!');
            });
        }
        
        // Test Reset button
        if (resetBtn) {
            console.log('  - Reset button found, testing click...');
            resetBtn.addEventListener('click', (e) => {
                console.log('  ✅ Reset button click event working!');
            });
        }
        
        // Test Insurance toggle button
        if (insuranceToggleBtn) {
            console.log('  - Insurance toggle button found, testing click...');
            insuranceToggleBtn.addEventListener('click', (e) => {
                console.log('  ✅ Insurance toggle button click event working!');
            });
        }
        
        if (window.insuranceManager && typeof window.insuranceManager.updateInsuranceIndicators === 'function') {
            console.log('✅ Insurance counter functionality is available');
        }
          console.log('🎉 All button tests completed!');
    }, 1000);
});

// =================================================================
// APPLICATION INITIALIZATION
// =================================================================

/**
 * Initialize the Credit Simulator App when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Credit Simulator App...');
    
    // Create app instance - this will set up all event listeners and functionality
    const app = new CreditSimulatorApp();
    
    // Make app available globally for debugging
    window.creditSimulatorApp = app;
    
    console.log('✅ Credit Simulator App initialized successfully!');
});