<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <FormField label="Razón social">
      <Input v-model="form.informacion_laboral.empresa_razon_social" />
    </FormField>
    <FormField label="NIT">
      <Input v-model="form.informacion_laboral.empresa_nit" />
    </FormField>
    <FormField label="Teléfono">
      <Input v-model="form.informacion_laboral.empresa_telefono" />
    </FormField>
    <FormField label="Dirección">
      <Input v-model="form.informacion_laboral.empresa_direccion" />
    </FormField>
    <FormField label="Ciudad">
      <CustomSelect
        v-model="form.informacion_laboral.empresa_ciudad"
        :options="ciudadesOptions"
        placeholder="Seleccionar ciudad"
        clearable
        searchable
      />
    </FormField>
    <FormField label="Cargo">
      <CustomSelect
        v-model="form.informacion_laboral.cargo"
        :options="cargosOptions"
        placeholder="Seleccionar cargo"
        clearable
        searchable
      />
    </FormField>
    <FormField label="Fecha ingreso">
      <Input v-model="form.informacion_laboral.fecha_ingreso" type="date" />
    </FormField>
    <FormField label="Tipo contrato">
      <CustomSelect
        v-model="form.informacion_laboral.tipo_contrato"
        :options="tiposContratoOptions"
        placeholder="Seleccionar tipo"
        clearable
        searchable
      />
    </FormField>
    <FormField label="Nombramiento / Pagador">
      <Input v-model="form.informacion_laboral.nombramiento_o_pagador" />
    </FormField>
    <FormField label="Tiempo servicio">
      <Input v-model.number="form.informacion_laboral.tiempo_servicio" type="number" min="0" />
    </FormField>
    <FormField label="Unidad">
      <CustomSelect
        v-model="form.informacion_laboral.tiempo_servicio_unidad"
        :options="tiempoUnidadOptions"
        placeholder="Seleccionar unidad"
      />
    </FormField>
  </div>
</template>

<script setup lang="ts">
import { computed } from '#imports';
import FormField from '~/components/shared/FormField.vue'
import Input from '@/components/ui/Input.vue'
import CustomSelect from '~/components/ui/CustomSelect.vue'
import type { SelectOption, LaboralProps } from '~/shared/types/solicitud-credito'

const props = withDefaults(defineProps<LaboralProps>(), {
  ciudades: () => [],
  tiposContrato: () => [],
  ocupaciones: () => []
})

// Opciones para unidades de tiempo
const tiempoUnidadOptions: SelectOption[] = [
  { label: 'Meses', value: 'meses' },
  { label: 'Años', value: 'anios' }
]

// Convertir ocupaciones a formato SelectOption
const cargosOptions = computed(() => 
  props.ocupaciones.map(item => ({
    label: item.detalle,
    value: item.codocu
  }))
)

// Convertir ciudades a formato SelectOption
const ciudadesOptions = computed(() => 
  props.ciudades.map(item => ({
    label: item.detciu,
    value: item.codciu
  }))
)

// Convertir tipos de contrato a formato SelectOption
const tiposContratoOptions = computed(() => 
  props.tiposContrato.map(item => ({
    label: item.detalle,
    value: item.tipcon
  }))
)
</script>
