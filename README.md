# Simulador de Crédito - Versión Profesional

Un simulador de crédito completo y profesional que permite calcular tablas de amortización y analizar diferentes estrategias de pago de créditos. Incluye funcionalidades avanzadas para descarga de reportes profesionales.

## 🚀 Características Principales

### Simulaciones Disponibles

- **Crédito Básico**: Cálculo de tabla de amortización estándar
- **Abono Único a Capital**: Simulación de un abono extra en una cuota específica
- **Abono Recurrente a Capital**: Abonos extras desde una cuota determinada hasta el final
- **Abono por Período Limitado**: Abonos extras en un rango específico de cuotas
- **Reducción de Cuota**: Aplicar abono extra para reducir el valor de la cuota mensual
- **Análisis Comparativo**: Comparación automática entre estrategias de abono a capital vs reducción de cuota
- **Abonos Múltiples Escalonados**: Programación de múltiples abonos en diferentes períodos

## 🛠️ Tecnologías Utilizadas

### Frontend

- **HTML5**: Estructura semántica y moderna
- **CSS3**: Diseño responsivo con gradientes y animaciones
- **JavaScript ES6+**: Lógica de simulación y UI

### Librerías para Reportes

- **jsPDF**: Generación de documentos PDF
- **jsPDF-AutoTable**: Creación de tablas profesionales en PDF
- **SheetJS (XLSX)**: Exportación a Excel
- **html2canvas**: Captura de pantalla de elementos HTML

### Características de UI/UX

- Diseño completamente responsivo
- Animaciones suaves y transiciones
- Estados de carga con spinners
- Mensajes de error y éxito
- Validación en tiempo real
- Interfaz intuitiva y profesional

## 📁 Estructura del Proyecto

```
simulador-credito-sj/
├── index.html          # Página principal
├── main.js             # Lógica principal y clases
├── styles.css          # Estilos y diseño responsivo
└── README.md           # Documentación
```

## 🚀 Instalación y Uso

### Método 1: Archivo Local

1. Descarga todos los archivos en una carpeta
2. Abre `index.html` en cualquier navegador moderno
3. ¡Listo para usar!

### Método 2: Servidor Local

```bash
# Con Python
python -m http.server 8000

# Con Node.js
npx http-server

# Luego abrir: http://localhost:8000
```

## 📋 Cómo Usar

1. **Datos Básicos**: Ingresa el valor del crédito, tasa de interés, plazo y periodicidad
2. **Seguro (Opcional)**: Configura el seguro de vida si aplica
3. **Simular**: Haz clic en "Simular Crédito" para ver la tabla de amortización básica
4. **Abonos Extra**: Utiliza la sección de abonos extras para analizar diferentes estrategias
5. **Descargar Reportes**: Usa los botones de descarga para obtener reportes profesionales

## 💡 Tipos de Simulación Detallados

### Abono Único a Capital

- Permite simular un abono extra en una cuota específica
- Muestra el ahorro en intereses y cuotas
- Calcula la nueva fecha de finalización del crédito

### Abono Recurrente a Capital

- Abonos constantes desde una cuota determinada
- Ideal para personas con ingresos extra regulares
- Muestra el impacto acumulativo de los abonos

### Reducción de Cuota

- Aplica el abono extra para reducir la cuota mensual
- Mantiene el mismo plazo original
- Útil para mejorar el flujo de caja mensual

### Análisis Comparativo

- Compara automáticamente las estrategias de abono vs reducción
- Ayuda a tomar decisiones informadas
- Muestra los beneficios de cada estrategia

### Abonos Múltiples

- Permite programar diferentes abonos en períodos específicos
- Ideal para bonificaciones, aguinaldos o ingresos variables
- Análisis detallado del impacto conjunto

## 🎨 Características de Diseño

- **Responsive Design**: Funciona perfectamente en dispositivos móviles y desktop
- **Animaciones Suaves**: Transiciones fluidas y feedback visual
- **Color Coding**: Diferentes colores para cada tipo de simulación
- **Estados de Carga**: Spinners y indicadores de progreso
- **Validación Visual**: Campos con validación en tiempo real

## 📊 Reportes Profesionales

Los reportes generados incluyen:

- **Identificación completa** del crédito y parámetros
- **Resumen ejecutivo** con métricas clave
- **Tablas de amortización** detalladas
- **Análisis de ahorros** cuando aplique
- **Fechas y timestamps** para trazabilidad
- **Formato profesional** apto para presentaciones

## 🔧 Personalización

El simulador es fácilmente personalizable:

- **Tasas de interés**: Se pueden ajustar los rangos permitidos
- **Períodos de pago**: Modificables en el código
- **Estilos**: CSS completamente personalizable
- **Validaciones**: Reglas de negocio ajustables

## 📈 Casos de Uso

- **Personas naturales**: Planificación de pagos de créditos hipotecarios o de consumo
- **Asesores financieros**: Herramienta para mostrar opciones a clientes
- **Entidades financieras**: Simulaciones previas a aprobación de créditos
- **Educación financiera**: Enseñanza de conceptos de amortización

## 🌟 Próximas Mejoras

- Gráficos interactivos de amortización
- Comparación con otros productos financieros
- Calculadora de capacidad de pago
- Integración con APIs de tasas de mercado
- Simulaciones con períodos de gracia

---

**Desarrollado con ❤️ para facilitar la toma de decisiones financieras inteligentes.**

