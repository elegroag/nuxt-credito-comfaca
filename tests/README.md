# Testing con Vitest - Frontend NUXT

Este proyecto utiliza **Vitest** como framework de testing para garantizar la calidad y funcionalidad del código.

## 📋 Tabla de Contenidos

- [Instalación](#instalación)
- [Comandos de Testing](#comandos-de-testing)
- [Estructura de Tests](#estructura-de-tests)
- [Escribir Tests](#escribir-tests)
- [Cobertura de Código](#cobertura-de-código)
- [Mejores Prácticas](#mejores-prácticas)

---

## 🚀 Instalación

Las dependencias de testing ya están configuradas en `package.json`. Para instalarlas:

```bash
pnpm install
```

### Dependencias Instaladas:

- **vitest**: Framework de testing
- **@vue/test-utils**: Utilidades para testing de componentes Vue
- **@nuxt/test-utils**: Utilidades específicas para Nuxt
- **@vitest/ui**: Interfaz gráfica para Vitest
- **happy-dom**: Entorno DOM para tests
- **@vitejs/plugin-vue**: Plugin de Vue para Vite

---

## 🧪 Comandos de Testing

### Ejecutar todos los tests
```bash
pnpm test
```

### Ejecutar tests en modo watch (recomendado para desarrollo)
```bash
pnpm test -- --watch
```

### Ejecutar tests con interfaz gráfica
```bash
pnpm test:ui
```

### Ejecutar tests con reporte de cobertura
```bash
pnpm test:coverage
```

### Ejecutar un archivo de test específico
```bash
pnpm test tests/composables/admin/useMonitoreoFirmasRealTime.test.ts
```

### Ejecutar tests que coincidan con un patrón
```bash
pnpm test -- --grep "cargarSolicitudes"
```

---

## 📁 Estructura de Tests

```
tests/
├── setup.ts                          # Configuración global de tests
├── composables/
│   └── admin/
│       └── useMonitoreoFirmasRealTime.test.ts
├── components/
│   └── admin/
│       ├── EstadisticasCard.test.ts
│       └── CambiosRecientesPanel.test.ts
└── README.md                         # Este archivo
```

### Convenciones de Nombres:

- **Archivos de test**: `*.test.ts` o `*.spec.ts`
- **Ubicación**: Misma estructura que `app/` pero dentro de `tests/`
- **Nombre**: Mismo nombre del archivo que se está testeando + `.test.ts`

---

## ✍️ Escribir Tests

### Test de Composable

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMonitoreoFirmasRealTime } from '~/composables/admin/useMonitoreoFirmasRealTime';

// Mock de dependencias
const mockGetJson = vi.fn();
vi.mock('~/composables/useApi', () => ({
    useApi: () => ({ getJson: mockGetJson })
}));

describe('useMonitoreoFirmasRealTime', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe inicializar con valores por defecto', () => {
        const { solicitudes, loading } = useMonitoreoFirmasRealTime();
        
        expect(solicitudes.value).toEqual([]);
        expect(loading.value).toBe(false);
    });

    it('debe cargar solicitudes exitosamente', async () => {
        mockGetJson.mockResolvedValueOnce({
            success: true,
            data: { solicitudes: [], total: 0 }
        });

        const { cargarSolicitudes, solicitudes } = useMonitoreoFirmasRealTime();
        await cargarSolicitudes();

        expect(mockGetJson).toHaveBeenCalled();
        expect(solicitudes.value).toEqual([]);
    });
});
```

### Test de Componente

```typescript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EstadisticasCard from '~/components/admin/firmas/EstadisticasCard.vue';

describe('EstadisticasCard', () => {
    it('debe renderizar correctamente', () => {
        const wrapper = mount(EstadisticasCard, {
            props: {
                titulo: 'Total',
                valor: 42,
                descripcion: 'Procesos',
                icono: 'lucide:file'
            }
        });

        expect(wrapper.text()).toContain('Total');
        expect(wrapper.text()).toContain('42');
    });

    it('debe emitir evento al hacer click', async () => {
        const wrapper = mount(MiComponente);
        
        await wrapper.find('button').trigger('click');
        
        expect(wrapper.emitted('click')).toBeTruthy();
    });
});
```

---

## 📊 Cobertura de Código

### Ver reporte de cobertura

```bash
pnpm test:coverage
```

Esto generará:
- **Terminal**: Resumen en consola
- **HTML**: Reporte detallado en `coverage/index.html`

### Abrir reporte HTML

```bash
# Linux/Mac
open coverage/index.html

# Windows
start coverage/index.html
```

### Configuración de Cobertura

En `vitest.config.ts`:

```typescript
coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    exclude: [
        'node_modules/',
        'tests/',
        '*.config.ts',
        '**/*.d.ts',
        'app/plugins/',
        '.nuxt/'
    ]
}
```

---

## 🎯 Tests Existentes

### Composables

#### `useMonitoreoFirmasRealTime.test.ts`
- ✅ Inicialización con valores por defecto
- ✅ Carga de solicitudes
- ✅ Filtrado de solicitudes sin proceso_firmado
- ✅ Manejo de errores
- ✅ Cálculo de estadísticas
- ✅ Detección de cambios de estado
- ✅ Polling automático
- ✅ Paginación
- ✅ Filtros por estado
- ✅ Formateo de fechas
- ✅ Navegación

**Total: 25+ tests**

### Componentes

#### `EstadisticasCard.test.ts`
- ✅ Renderizado con props básicas
- ✅ Valores tipo string y number
- ✅ Barra de progreso
- ✅ Aplicación de clases de color
- ✅ Valores por defecto
- ✅ Renderizado de iconos
- ✅ Porcentajes (0%, 100%)

**Total: 10 tests**

#### `CambiosRecientesPanel.test.ts`
- ✅ Renderizado con cambios
- ✅ Estado vacío
- ✅ Transiciones de estado
- ✅ Emisión de eventos
- ✅ Múltiples cambios
- ✅ Scroll automático
- ✅ Truncado de nombres largos
- ✅ Todos los estados posibles
- ✅ Formateo de timestamps
- ✅ Hover effects

**Total: 11 tests**

---

## 🏆 Mejores Prácticas

### 1. Organización

```typescript
describe('NombreDelComponente/Composable', () => {
    describe('Funcionalidad específica', () => {
        it('debe hacer algo específico', () => {
            // Test
        });
    });
});
```

### 2. Limpieza entre tests

```typescript
beforeEach(() => {
    vi.clearAllMocks();
});

afterEach(() => {
    vi.useRealTimers();
});
```

### 3. Nombres descriptivos

```typescript
// ✅ Bueno
it('debe cargar solicitudes exitosamente cuando la API responde correctamente')

// ❌ Malo
it('test 1')
```

### 4. Arrange-Act-Assert

```typescript
it('debe actualizar el estado', () => {
    // Arrange: Preparar
    const { estado, actualizar } = useComposable();
    
    // Act: Ejecutar
    actualizar('nuevo valor');
    
    // Assert: Verificar
    expect(estado.value).toBe('nuevo valor');
});
```

### 5. Mock de dependencias externas

```typescript
// Mock de API
vi.mock('~/composables/useApi', () => ({
    useApi: () => ({
        getJson: vi.fn().mockResolvedValue({ data: [] })
    })
}));

// Mock de router
vi.mock('vue-router', () => ({
    useRouter: () => ({
        push: vi.fn()
    })
}));
```

### 6. Tests independientes

Cada test debe poder ejecutarse de forma independiente:

```typescript
// ✅ Bueno
it('test 1', () => {
    const data = crearDatosDePrueba();
    // usar data
});

it('test 2', () => {
    const data = crearDatosDePrueba();
    // usar data
});

// ❌ Malo (estado compartido)
let sharedData;

it('test 1', () => {
    sharedData = { value: 1 };
});

it('test 2', () => {
    expect(sharedData.value).toBe(1); // Depende del test anterior
});
```

### 7. Evitar lógica compleja en tests

```typescript
// ✅ Bueno
it('debe sumar correctamente', () => {
    expect(sumar(2, 3)).toBe(5);
});

// ❌ Malo
it('debe sumar correctamente', () => {
    const resultado = sumar(2, 3);
    if (resultado > 0) {
        expect(resultado).toBe(5);
    }
});
```

---

## 🔧 Configuración

### vitest.config.ts

```typescript
import { defineVitestConfig } from '@nuxt/test-utils/config';

export default defineVitestConfig({
    test: {
        environment: 'happy-dom',
        globals: true,
        setupFiles: ['./tests/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html']
        }
    }
});
```

### tests/setup.ts

Archivo de configuración global que se ejecuta antes de todos los tests:

```typescript
import { vi } from 'vitest';

// Mocks globales
vi.mock('vue-router', () => ({
    useRouter: () => ({ push: vi.fn() })
}));

global.fetch = vi.fn();
```

---

## 📚 Recursos

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Nuxt Testing](https://nuxt.com/docs/getting-started/testing)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## 🐛 Troubleshooting

### Error: Cannot find module

**Solución**: Verificar que los alias estén configurados en `vitest.config.ts`:

```typescript
resolve: {
    alias: {
        '~': fileURLToPath(new URL('./app', import.meta.url)),
        '@': fileURLToPath(new URL('./app', import.meta.url))
    }
}
```

### Tests no se ejecutan

**Solución**: Verificar que los archivos terminen en `.test.ts` o `.spec.ts`

### Mock no funciona

**Solución**: Asegurarse de que el mock esté antes del import:

```typescript
// ✅ Correcto
vi.mock('~/composables/useApi');
import { useApi } from '~/composables/useApi';

// ❌ Incorrecto
import { useApi } from '~/composables/useApi';
vi.mock('~/composables/useApi');
```

---

## 📈 Objetivos de Cobertura

| Tipo | Objetivo | Actual |
|------|----------|--------|
| Statements | 80% | - |
| Branches | 75% | - |
| Functions | 80% | - |
| Lines | 80% | - |

---

## 🚦 CI/CD Integration

Para integrar en CI/CD, agregar en `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test
      - run: pnpm test:coverage
```

---

## 📝 Notas

- Los errores de TypeScript en los archivos de test son normales hasta que se ejecute `pnpm install`
- La interfaz UI (`pnpm test:ui`) es muy útil para debugging
- Usar `--watch` durante desarrollo para feedback inmediato
- Los tests se ejecutan en paralelo por defecto para mayor velocidad

---

**Última actualización**: Febrero 2024
