# Análisis del Simulador de Créditos - Comfaca

## Overview General

El simulador de créditos es una herramienta interactiviva que permite a los usuarios calcular estimaciones de cuotas mensuales, evaluar su capacidad de pago y determinar si son aptos para solicitar un crédito. Está implementado como una página completa en el frontend de la aplicación Comfaca.

## Arquitectura y Estructura

### Componentes Principales

1. **Página Principal**: `/app/pages/simulador/index.vue`
2. **Composable de Lógica**: `/app/composables/simulador/useSimulador.ts`
3. **Tipos de Datos**: `/app/shared/types/simulador.ts`

### Flujo de Datos

```
Usuario Input → useSimulador.ts → Cálculos → UI Reactiva
```

## Proceso y Flujo Detallado

### 1. Inicialización y Estado por Defecto

El simulador se inicializa con los siguientes valores predeterminados:

```typescript
monto: 5_000_000 COP
plazoMeses: 36 meses
tasaEfectivaAnual: 24%
ingresosMensuales: 2_500_000 COP
descuentosMensuales: 500_000 COP
maxEndeudamientoPct: 30%
```

### 2. Entrada de Datos del Usuario

El formulario captura la siguiente información:

#### Datos del Crédito

- **Monto**: Valor del crédito solicitado (COP)
- **Plazo**: Número de meses para pagar
- **Tasa EA**: Tasa efectiva anual (%)

#### Datos Financieros Personales

- **Ingresos mensuales**: Salario bruto mensual (COP)
- **Descuentos mensuales**: Deducciones actuales (COP)
- **Máximo endeudamiento**: Porcentaje de capacidad de pago permitido

### 3. Proceso de Validación y Saneamiento

Todos los valores de entrada pasan por un proceso de validación:

```typescript
const _num = (v: unknown) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};
```

- **Monto**: Mínimo 0 COP
- **Plazo**: Mínimo 1 mes (redondeado hacia abajo)
- **Tasa EA**: Mínimo 0%
- **Ingresos/Descuentos**: Mínimo 0 COP
- **Endeudamiento**: Entre 0% y 100%

### 4. Cálculos Financieros

#### 4.1 Cálculo de Tasa Mensual

Se convierte la tasa efectiva anual (EA) a tasa mensual:

```typescript
const tasaMensual = computed(() => {
  const ea = tasaEASan.value / 100;
  if (ea <= 0) return 0;
  return Math.pow(1 + ea, 1 / 12) - 1;
});
```

#### 4.2 Cálculo de Cuota Mensual

Utiliza la fórmula de amortización francesa:

```typescript
const cuotaMensual = computed(() => {
  const P = montoSan.value; // Principal
  const n = plazoMesesSan.value; // Número de períodos
  const r = tasaMensual.value; // Tasa mensual

  if (P <= 0 || n <= 0) return 0;
  if (r <= 0) return P / n;

  const denom = 1 - Math.pow(1 + r, -n);
  if (denom <= 0) return 0;

  return (P * r) / denom;
});
```

#### 4.3 Cálculos Derivados

```typescript
const totalPagar = cuotaMensual * plazoMeses;
const intereses = Math.max(0, totalPagar - monto);
```

### 5. Evaluación de Capacidad de Pago

#### 5.1 Cálculo de Capacidad Máxima

```typescript
const capacidadPagoMaxima = computed(() => {
  const bruto = ingresosBrutosSan.value;
  // Capacidad de Pago Mensual Máxima (50%) del salario menos el 8% de descuentos de Ley
  return bruto * 0.5 - bruto * 0.08;
});
```

#### 5.2 Capacidad Disponible

```typescript
const capacidadDisponible = capacidadPagoMaxima - descuentosActuales;
```

#### 5.3 Evaluación de Aprobación

```typescript
const maxCuotaPermitida = capacidadDisponible;
const margen = maxCuotaPermitida - cuotaMensual;
const apto = cuotaMensual <= maxCuotaPermitida;
```

### 6. Presentación de Resultados

La interfaz muestra los resultados en varias tarjetas informativas:

#### 6.1 Resumen Financiero

- **Cuota estimada**: Valor mensual a pagar
- **Capacidad disponible**: Límite de endeudamiento
- **Total a pagar**: Monto total + intereses
- **Intereses estimados**: Costo financiero total

#### 6.2 Evaluación Rápida

- **Estado**: Apto/No apto
- **Margen/Exceso**: Diferencia entre cuota y capacidad
- **Indicador visual**: Icono y colores según resultado

#### 6.3 Resumen Detallado

- Todos los parámetros de entrada validados
- Ingresos brutos y netos (92% del bruto)
- Descuentos actuales

### 7. Acciones del Usuario

#### 7.1 Continuar con Solicitud

- Navega a la página `/solicitud`
- Los datos del simulador podrían transferirse al formulario

#### 7.2 Restablecer

- Reinicia todos los valores a los predeterminados
- Limpia los cálculos y resultados

## Integración con el Sistema

### Conexión con Módulo de Solicitud

El simulador funciona como un punto de entrada al proceso de solicitud formal:

```
Simulador → Evaluación → Solicitud Formal → Wizard → XML → Firmas
```

### Flujo Completo del Usuario

1. **Simulación**: Usuario evalúa diferentes escenarios
2. **Evaluación**: Sistema determina capacidad de pago
3. **Decisión**: Usuario decide continuar o ajustar parámetros
4. **Solicitud**: Ingreso al wizard formal de solicitud
5. **Documentación**: Captura de documentos y datos personales
6. **Generación**: Creación de XML con datos completos
7. **Firmas**: Proceso de firma digital

## Características Técnicas

### Reactividad

- Usa Vue 3 Composition API
- Computaciones reactivas con `computed()`
- Actualización instantánea de resultados

### Formateo

- Moneda colombiana (COP)
- Porcentajes con 2 decimales
- Formato localizado `es-CO`

### Validación

- Saneamiento de entradas
- Prevención de valores inválidos
- Cálculos seguros con validación de división por cero

### UI/UX

- Diseño responsive con TailwindCSS
- Tarjetas informativas con gradientes
- Indicadores visuales de estado
- Navegación intuitiva

## Reglas de Negocio Implementadas

### Capacidad de Endeudamiento

- **Máximo legal**: 50% del salario bruto
- **Descuentos obligatorios**: 8% del salario bruto
- **Capacidad neta**: 42% del salario bruto menos descuentos actuales

### Cálculos Financieros

- **Tasa efectiva anual**: Convertida a tasa mensual compuesta
- **Amortización**: Sistema francés (cuotas fijas)
- **Intereses**: Calculados sobre saldo decreciente

### Validaciones

- **Mínimos**: Todos los valores no pueden ser negativos
- **Plazos**: Mínimo 1 mes
- **Tasas**: No negativas
- **Endeudamiento**: Máximo 100% de capacidad

## Mejoras Potenciales

### Funcionalidades Adicionales

1. **Comparación de escenarios**: Guardar múltiples simulaciones
2. **Historial**: Registro de simulaciones previas
3. **Exportación**: PDF o Excel con resultados
4. **Integración**: Transferencia automática al formulario

### Mejoras Técnicas

1. **Persistencia**: Guardar estado en localStorage
2. **Validaciones avanzadas**: Reglas específicas por tipo de crédito
3. **Gráficos**: Visualización de amortización
4. **Accesibilidad**: Mejoras para lectores de pantalla

## Conclusión

El simulador de créditos actual es una herramienta robusta y bien estructurada que proporciona una evaluación financiera precisa y una experiencia de usuario intuitiva. Su arquitectura modular permite fácil mantenimiento y extensión, mientras que sus cálculos financieros siguen las mejores prácticas y normativas vigentes en Colombia.

La integración fluida con el proceso de solicitud formal lo convierte en un componente clave del ecosistema digital de Comfaca, facilitando la toma de decisiones informadas para los usuarios y optimizando el proceso de originación de créditos.
