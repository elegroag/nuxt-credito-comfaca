<template>
  <div class="form-group">
    <label v-if="label" :for="selectId" class="form-label">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <v-select
      :id="selectId"
      v-model="selectedValue"
      :options="normalizedOptions"
      :placeholder="placeholder"
      :disabled="disabled"
      :loading="loading"
      :clearable="clearable"
      :searchable="searchable"
      :multiple="multiple"
      :close-on-select="closeOnSelect"
      :max-height="maxHeight"
      :reduce="reduceOption"
      :get-option-label="getOptionLabel"
      :class="selectClasses"
      @search="handleSearch"
      @option:selected="handleSelect"
      @option:deselected="handleDeselect"
      @open="handleOpen"
      @close="handleClose"
    >
      <!-- Slot para opciones personalizadas -->
      <template #option="option">
        <div class="custom-option">
          <slot name="option" :option="option">
            <span class="option-label">{{ getDisplayLabel(option) }}</span>
            <span v-if="option.description" class="option-description">
              {{ option.description }}
            </span>
          </slot>
        </div>
      </template>
      
      <!-- Slot para opciones seleccionadas -->
      <template #selected-option="option">
        <div class="custom-selected">
          <slot name="selected-option" :option="option">
            <span class="selected-label">{{ getDisplayLabel(option) }}</span>
          </slot>
        </div>
      </template>
      
      <!-- Slot para no hay resultados -->
      <template #no-options>
        <div class="no-options">
          <slot name="no-options">
            <span class="text-gray-400">No hay opciones disponibles</span>
          </slot>
        </div>
      </template>
    </v-select>
    
    <!-- Mensaje de error -->
    <div v-if="hasError" class="error-message">
      <span class="text-red-500 text-sm">{{ errorMessage }}</span>
    </div>
    
    <!-- Mensaje de ayuda -->
    <div v-if="helpText && !errorMessage" class="help-message">
      <span class="text-gray-400 text-sm">{{ helpText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from '#imports';
import vSelect from 'vue-select';

// Constants
const DEFAULT_DEBOUNCE = 300;
const DEFAULT_MAX_HEIGHT = 200;
const ID_PREFIX = 'custom-select-';

// Types
interface VueSelectOption {
  label: string;
  value: string | number | boolean;
  [key: string]: any;
}

type SelectValue = string | number | VueSelectOption | (string | number | VueSelectOption)[] | null;
type RawOption = VueSelectOption | string | number;

interface SelectOption {
  label: string;
  value: string | number | boolean;
  description?: string;
  [key: string]: any;
}

interface Props {
  modelValue?: SelectValue;
  options?: RawOption[];
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  closeOnSelect?: boolean;
  maxHeight?: number;
  variant?: 'default' | 'filter';
  size?: 'default' | 'lg';
  errorMessage?: string;
  helpText?: string;
  asyncSearch?: boolean;
  searchDebounce?: number;
}

interface Emits {
  'update:modelValue': [value: SelectValue];
  'search': [query: string];
  'option:selected': [option: SelectOption];
  'option:deselected': [option: SelectOption];
  'open': [];
  'close': [];
}

// Props con valores por defecto optimizados
const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  options: () => [],
  label: '',
  placeholder: 'Seleccionar opción...',
  required: false,
  disabled: false,
  loading: false,
  clearable: true,
  searchable: true,
  multiple: false,
  closeOnSelect: true,
  maxHeight: DEFAULT_MAX_HEIGHT,
  variant: 'default',
  size: 'default',
  errorMessage: '',
  helpText: '',
  asyncSearch: false,
  searchDebounce: DEFAULT_DEBOUNCE
});

const emit = defineEmits<Emits>();

// ID único optimizado con counter
let selectCounter = 0;
const selectId = computed(() => `${ID_PREFIX}${++selectCounter}`);

// Estado reactivo optimizado
const searchTimeout = ref<NodeJS.Timeout>();

// Computed properties optimizadas
const selectedValue = computed<SelectValue>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const hasError = computed(() => Boolean(props.errorMessage));

const selectClasses = computed(() => [
  'custom-vue-select',
  {
    'filter-select': props.variant === 'filter',
    'form-select-lg': props.size === 'lg',
    'has-error': hasError.value
  }
]);

// Funciones puras para mejor rendimiento
const normalizeOption = (option: RawOption): SelectOption => {
  if (typeof option === 'string' || typeof option === 'number') {
    return {
      label: String(option),
      value: option,
      description: ''
    };
  }
  return option as SelectOption;
};

const normalizedOptions = computed(() => 
  props.options.map(normalizeOption)
);

const reduceOption = (option: VueSelectOption) => option.value;

const getOptionLabel = (option: VueSelectOption) => option.label;

const getDisplayLabel = (option: SelectOption | RawOption) => {
  if (typeof option === 'string' || typeof option === 'number') {
    return String(option);
  }
  return (option as SelectOption).label || String(option);
};

// Event handlers optimizados
const createDebouncedSearch = () => {
  let timeoutId: NodeJS.Timeout;
  
  return (query: string) => {
    if (!props.asyncSearch) return;
    
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      emit('search', query);
    }, props.searchDebounce);
  };
};

const debouncedSearch = createDebouncedSearch();

const handleSearch = (query: string): void => {
  debouncedSearch(query);
};

const handleSelect = (option: SelectOption): void => {
  emit('option:selected', option);
};

const handleDeselect = (option: SelectOption): void => {
  emit('option:deselected', option);
};

const handleOpen = (): void => {
  emit('open');
};

const handleClose = (): void => {
  emit('close');
};

// Cleanup optimizado
onUnmounted(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
});
</script>

<style scoped>
/* Importar estilos personalizados */
@import '~/assets/css/vue-select-custom.css';

/* Estilos adicionales para slots personalizados */
.custom-option {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.option-label {
  font-weight: 500;
  color: #1f2937;
}

.option-description {
  font-size: 0.75rem;
  color: #6b7280;
}

.custom-selected {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.selected-label {
  font-weight: 500;
}

.no-options {
  padding: 1rem;
  text-align: center;
}

.error-message,
.help-message {
  margin-top: 0.25rem;
}

/* Integración con clases existentes */
.form-label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

/* Override de estilos de vue-select para mejor integración */
:deep(.vs__dropdown-toggle) {
  width: 100% !important;
}

:deep(.vs__selected-options-container) {
  flex-wrap: wrap;
  gap: 0.25rem;
}

:deep(.vs__selected) {
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .custom-option {
    gap: 0.0625rem;
  }
  
  .option-description {
    font-size: 0.7rem;
  }
}
</style>
