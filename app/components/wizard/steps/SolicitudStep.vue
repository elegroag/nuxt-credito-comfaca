<template>
  <div class="grid gap-4">
    <div class="grid gap-4 sm:grid-cols-2">
      <!-- Fecha radicado -->
      <FormField label="Fecha radicado" class="sm:col-span-2">
        <Input :model-value="fechaRadicado" type="date" readonly />
      </FormField>
      
      <!-- Campos de solicitud -->
      <FormField label="Número solicitud">
        <Input v-model="form.solicitud.numero_solicitud" />
      </FormField>
      <FormField label="Número comprobante">
        <Input v-model="form.solicitud.numero_comprobante" />
      </FormField>
      <FormField label="Valor solicitud">
        <Input v-model.number="form.solicitud.valor_solicitud" type="number" min="0" />
      </FormField>
      <FormField label="Categoría">
        <Input v-model="form.solicitud.categoria" />
      </FormField>
      <FormField label="Rol en solicitud">
        <CustomSelect
          v-model="form.solicitud.rol_en_solicitud"
          :options="rolesOptions"
          placeholder="Seleccionar rol"
        />
      </FormField>
      <FormField label="Valor mensual">
        <Input v-model.number="form.solicitud.cuota_mensual" type="number" min="0" />
      </FormField>
      <FormField label="Plazo (meses)">
        <Input v-model.number="form.solicitud.plazo_meses" type="number" min="1" />
      </FormField>
      <FormField label="Producto">
        <CustomSelect
          v-model="form.producto_solicitado.tipo"
          :options="productosOptions"
          placeholder="Seleccionar producto"
        />
      </FormField>
      <FormField label="URL Foto documento (opcional)">
        <Input v-model="form.solicitud.foto_documento!.url" placeholder="https://..." />
      </FormField>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 mt-4">
      <label class="flex items-center gap-2 text-sm text-foreground">
        <input 
          v-model="form.producto_solicitado.ha_tenido_credito_comfaca" 
          type="checkbox" 
          class="h-4 w-4 rounded border-input text-primary focus:ring-primary" 
        />
        Ha tenido crédito con Comfaca
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import FormField from '~/components/shared/FormField.vue'
import Input from '@/components/ui/Input.vue'
import CustomSelect from '~/components/ui/CustomSelect.vue'
import type { SelectOption, SolicitudProps } from '~/shared/types/solicitud-credito'

defineProps<SolicitudProps>()

// Opciones para roles en solicitud
const rolesOptions: SelectOption[] = [
  { label: 'Solicitante', value: 'solicitante' },
  { label: 'Codeudor', value: 'codeudor' }
]

// Opciones para productos
const productosOptions: SelectOption[] = [
  { label: 'Educación', value: 'educacion' },
  { label: 'Salud', value: 'salud' },
  { label: 'Vivienda', value: 'vivienda' },
  { label: 'Electrodomésticos', value: 'electrodomesticos' },
  { label: 'Productos del hogar', value: 'productos_hogar' },
  { label: 'Vestuario', value: 'vestuario' },
  { label: 'Recreación', value: 'recreacion' },
  { label: 'Turismo', value: 'turismo' }
]
</script>
