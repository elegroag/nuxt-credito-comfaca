# Vue Select Personalizado - Guía de Implementación

## 📋 Resumen

Se ha implementado una personalización completa de **vue-select** para mantener el estándar de diseño del sistema Comfaca Crédito, integrándose perfectamente con los estilos existentes en `admin-solicitudes.css`.

## 🎨 Características del Diseño

### **Estilos Base**

- **Colores consistentes**: Usa la paleta del sistema (`#3b82f6`, `#1f2937`, `#6b7280`)
- **Bordes y sombras**: Coincide con `.form-control` y `.estado-card`
- **Tipografía**: Mismos tamaños y pesos que el diseño existente
- **Transiciones**: Animaciones suaves de 0.2s como los cards

### **Estados Interactivos**

- **Hover**: `transform: translateY(-2px)` + sombra enhanced
- **Focus**: Borde azul (`#3b82f6`) con shadow `rgba(59, 130, 246, 0.25)`
- **Selected**: Background azul claro (`#dbeafe`)
- **Disabled**: Opacidad reducida y cursor not-allowed

### **Variantes Disponibles**

```css
/* Variante por defecto */
.custom-vue-select

/* Variante filtro (más compacta) */
.custom-vue-select.filter-select

/* Variante grande */
.custom-vue-select.form-select-lg

/* Estado error */
.custom-vue-select.has-error
```

## 📁 Archivos Creados

```
frontend-nuxt/
├── assets/css/
│   └── vue-select-custom.css      # Estilos personalizados
├── components/ui/
│   └── CustomSelect.vue            # Componente wrapper
├── components/dashboard/
│   └── AdminSolicitudesDemo.vue   # Ejemplo de uso
└── types/
    └── vue-select.d.ts            # Declaración de tipos
```

## 🚀 Uso Básico

### **Importación**

```vue
<script setup lang="ts">
import CustomSelect from '~/components/ui/CustomSelect.vue';
</script>
```

### **Ejemplo Simple**

```vue
<template>
  <CustomSelect
    v-model="selectedValue"
    :options="options"
    label="Seleccionar opción"
    placeholder="Elegir..."
  />
</template>

<script setup lang="ts">
const selectedValue = ref(null);
const options = [
  { label: 'Opción 1', value: 'opt1' },
  { label: 'Opción 2', value: 'opt2' },
];
</script>
```

## 🎛️ Props Disponibles

| Prop           | Tipo                                                | Default                   | Descripción          |
| -------------- | --------------------------------------------------- | ------------------------- | -------------------- |
| `modelValue`   | `string \| number \| SelectOption \| array \| null` | `null`                    | Valor seleccionado   |
| `options`      | `SelectOption[] \| string[] \| number[]`            | `[]`                      | Opciones disponibles |
| `label`        | `string`                                            | `''`                      | Etiqueta del campo   |
| `placeholder`  | `string`                                            | `'Seleccionar opción...'` | Texto placeholder    |
| `required`     | `boolean`                                           | `false`                   | Campo requerido      |
| `disabled`     | `boolean`                                           | `false`                   | Deshabilitar control |
| `loading`      | `boolean`                                           | `false`                   | Mostrar loading      |
| `clearable`    | `boolean`                                           | `true`                    | Permitir limpiar     |
| `searchable`   | `boolean`                                           | `true`                    | Permitir búsqueda    |
| `multiple`     | `boolean`                                           | `false`                   | Selección múltiple   |
| `variant`      | `'default' \| 'filter'`                             | `'default'`               | Variante visual      |
| `size`         | `'default' \| 'lg'`                                 | `'default'`               | Tamaño del control   |
| `errorMessage` | `string`                                            | `''`                      | Mensaje de error     |
| `helpText`     | `string`                                            | `''`                      | Texto de ayuda       |

## 🎯 Eventos

```vue
<CustomSelect
  v-model="selectedValue"
  :options="options"
  @search="handleSearch"
  @option:selected="handleSelect"
  @option:deselected="handleDeselect"
  @open="handleOpen"
  @close="handleClose"
/>
```

| Evento              | Parámetros               | Descripción                 |
| ------------------- | ------------------------ | --------------------------- |
| `search`            | `(query: string)`        | Usuario escribe en búsqueda |
| `option:selected`   | `(option: SelectOption)` | Opción seleccionada         |
| `option:deselected` | `(option: SelectOption)` | Opción deseleccionada       |
| `open`              | -                        | Dropdown se abre            |
| `close`             | -                        | Dropdown se cierra          |

## 🔧 Slots Personalizados

### **Opción Personalizada**

```vue
<CustomSelect v-model="value" :options="options">
  <template #option="{ option }">
    <div class="custom-option">
      <strong>{{ option.label }}</strong>
      <small>{{ option.description }}</small>
    </div>
  </template>
</CustomSelect>
```

### **Opción Seleccionada**

```vue
<CustomSelect v-model="value" :options="options">
  <template #selected-option="{ option }">
    <span class="selected-badge">{{ option.label }}</span>
  </template>
</CustomSelect>
```

### **Sin Resultados**

```vue
<CustomSelect v-model="value" :options="options">
  <template #no-options>
    <div class="no-results">
      <p>No se encontraron resultados</p>
      <button @click="loadMore">Cargar más</button>
    </div>
  </template>
</CustomSelect>
```

## 🎨 Ejemplos de Uso

### **1. Select de Filtros**

```vue
<CustomSelect
  v-model="selectedEstado"
  :options="estadosOptions"
  label="Estado"
  placeholder="Todos los estados"
  variant="filter"
  clearable
  @option:selected="filtrarPorEstado"
/>
```

### **2. Select con Validación**

```vue
<CustomSelect
  v-model="formData.tipoCredito"
  :options="tiposCredito"
  label="Tipo de Crédito"
  placeholder="Seleccionar tipo"
  required
  :error-message="errors.tipoCredito"
  size="lg"
/>
```

### **3. Select Múltiple**

```vue
<CustomSelect
  v-model="selectedDocumentos"
  :options="documentosOptions"
  label="Documentos"
  placeholder="Seleccionar documentos"
  multiple
  searchable
  @option:selected="agregarDocumento"
  @option:deselected="removerDocumento"
/>
```

### **4. Select Asíncrono**

```vue
<CustomSelect
  v-model="selectedUser"
  :options="userOptions"
  label="Usuario"
  placeholder="Buscar usuario..."
  :loading="loadingUsers"
  searchable
  async-search
  @search="searchUsers"
/>
```

## 🎭 Integración con Diseño Existente

### **En Headers**

```css
.table-header .custom-vue-select {
  min-width: 200px;
}
```

### **En Formularios**

```css
.form-group .custom-vue-select {
  width: 100%;
}
```

### **En Modales**

```css
.modal-content .custom-vue-select .vs__dropdown-menu {
  max-height: 180px;
}
```

## 📱 Responsive Design

```css
@media (max-width: 768px) {
  .vs__dropdown-menu {
    max-height: 150px;
  }

  .vs__dropdown-option {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
}
```

## 🌙 Dark Mode (Preparado)

Los estilos incluyen soporte para dark mode futuro:

```css
@media (prefers-color-scheme: dark) {
  .vs__dropdown-toggle {
    background: #1f2937;
    border-color: #374151;
    color: #f9fafb;
  }
}
```

## 🔍 Búsqueda Asíncrona

```vue
<script setup lang="ts">
const searchQuery = ref('');
const loading = ref(false);
const options = ref([]);

const searchUsers = async (query: string) => {
  if (!query) return;

  loading.value = true;
  try {
    const results = await $fetch('/api/users/search', {
      method: 'POST',
      body: { query },
    });
    options.value = results.map((user) => ({
      label: user.name,
      value: user.id,
      description: user.email,
    }));
  } finally {
    loading.value = false;
  }
};
</script>
```

## 🚨 Tips y Best Practices

### **✅ Buenas Prácticas**

1. **Usar variantes**: `variant="filter"` para selects compactos
2. **Validación**: Siempre mostrar `errorMessage` cuando haya errores
3. **Accesibilidad**: Incluir siempre `label` descriptivo
4. **Loading**: Mostrar `loading` durante búsquedas asíncronas

### **❌ Errores Comunes**

1. No usar `clearable` en campos requeridos
2. Olvidar manejar el estado `loading`
3. No proveer opciones por defecto
4. Ignorar eventos de accesibilidad

## 🎯 Comparación con Diseño Original

| Elemento       | Diseño Original                 | Vue Select Personalizado |
| -------------- | ------------------------------- | ------------------------ |
| **Bordes**     | `1px solid #d1d5db`             | ✅ Igual                 |
| **Focus**      | `border-color: #3b82f6`         | ✅ Igual                 |
| **Shadow**     | `0 1px 3px rgba(0, 0, 0, 0.1)`  | ✅ Igual                 |
| **Hover**      | `transform: translateY(-2px)`   | ✅ Igual                 |
| **Colores**    | `#3b82f6`, `#1f2937`, `#6b7280` | ✅ Igual                 |
| **Tipografía** | `0.875rem`                      | ✅ Igual                 |

## 🔄 Migración desde Selects Nativos

### **Antes**

```vue
<select v-model="value" class="form-select">
  <option value="">Seleccionar...</option>
  <option v-for="opt in options" :key="opt.value" :value="opt.value">
    {{ opt.label }}
  </option>
</select>
```

### **Después**

```vue
<CustomSelect v-model="value" :options="options" placeholder="Seleccionar..." />
```

## 📦 Instalación de Dependencias

```bash
# Instalar vue-select
pnpm add vue-select

# Los tipos ya están configurados en types/vue-select.d.ts
```

## 🎉 Conclusión

El componente `CustomSelect` proporciona una integración perfecta de vue-select con el diseño existente del sistema, manteniendo:

- ✅ **Consistencia visual** total con el diseño actual
- ✅ **Accesibilidad** y usabilidad mejoradas
- ✅ **Flexibilidad** con slots y variantes
- ✅ **TypeScript** completamente tipado
- ✅ **Responsive** y preparado para dark mode

Ahora puedes usar selects personalizados que se ven y se sienten como parte nativa del sistema Comfaca Crédito.
