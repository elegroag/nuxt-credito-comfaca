<template>
  <div class="grid gap-4">
    <div class="grid gap-4 sm:grid-cols-2">
      <!-- Fecha radicado -->
      <FormField label="Fecha radicado" class="sm:col-span-2">
        <Input v-model="form.solicitud.fecha_radicado" type="date" :disabled="true" />
      </FormField>

      <!-- Campos de solicitud -->
      <FormField label="Número solicitud">
        <Input v-model="form.solicitud.numero_solicitud" :disabled="true" />
      </FormField>
      <FormField label="Número comprobante">
        <Input v-model="form.solicitud.numero_comprobante" />
      </FormField>
      <FormField label="Valor solicitud">
        <Input v-model.number="form.solicitud.valor_solicitud" type="number" min="0" :disabled="true" />
      </FormField>
      <FormField label="Categoría">
        <Input v-model="form.solicitante.codigo_categoria" :disabled="true" />
      </FormField>
      <FormField label="Rol en solicitud">
        <CustomSelect v-model="form.solicitud.rol_en_solicitud" :options="rolesOptions" placeholder="Seleccionar rol" />
      </FormField>
      <FormField label="Valor mensual">
        <Input v-model.number="form.solicitud.cuota_mensual" type="number" min="0" :disabled="true" />
      </FormField>
      <FormField label="Plazo (meses)">
        <Input v-model.number="form.solicitud.plazo_meses" type="number" min="1" :disabled="true" />
      </FormField>
      <FormField label="Producto">
        <CustomSelect v-model="form.solicitud.producto_tipo" :options="productosOptions"
          placeholder="Seleccionar producto" />
      </FormField>
      <FormField label="Linea de crédito">
        <Input v-model="form.solicitud.detalle_modalidad" :disabled="true" placeholder="Seleccionar linea" />
      </FormField>

    </div>

    <div class="grid gap-4 sm:grid-cols-2 mt-4">
      <label class="flex items-center gap-2 text-sm text-foreground">
        <input v-model="form.solicitud.ha_tenido_credito" type="checkbox"
          class="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
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

interface Props extends SolicitudProps { }

const props = defineProps<Props>()

// Opciones para roles en solicitud
const rolesOptions: SelectOption[] = [
  { label: 'Trabajador', value: 'trabajador' },
  { label: 'Empleador', value: 'empleador' }
]

// Opciones para productos basadas en tiposInversion
const productosOptions = computed<SelectOption[]>(() => {
  return (props.tiposInversion || []).map(tipo => ({
    label: tipo.detalle,
    value: tipo.tipinv
  }))
})
</script>
