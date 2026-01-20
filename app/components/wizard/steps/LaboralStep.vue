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
      <select v-model="form.informacion_laboral.empresa_ciudad" :class="selectClass">
        <option value="" disabled>Seleccionar ciudad</option>
        <option 
          v-for="item in ciudades" 
          :key="item.codciu" 
          :value="item.codciu"
        >
          {{ item.detciu }}
        </option>
      </select>
    </FormField>
    <FormField label="Cargo">
      <Input v-model="form.informacion_laboral.cargo" />
    </FormField>
    <FormField label="Fecha ingreso">
      <Input v-model="form.informacion_laboral.fecha_ingreso" type="date" />
    </FormField>
    <FormField label="Tipo contrato">
      <select v-model="form.informacion_laboral.tipo_contrato" :class="selectClass">
        <option value="" disabled>Seleccionar tipo</option>
        <option 
          v-for="item in tiposContrato" 
          :key="item.tipcon" 
          :value="item.tipcon"
        >
          {{ item.detalle }}
        </option>
      </select>
    </FormField>
    <FormField label="Nombramiento / Pagador">
      <Input v-model="form.informacion_laboral.nombramiento_o_pagador" />
    </FormField>
    <FormField label="Tiempo servicio">
      <Input v-model.number="form.informacion_laboral.tiempo_servicio" type="number" min="0" />
    </FormField>
    <FormField label="Unidad">
      <select v-model="form.informacion_laboral.tiempo_servicio_unidad" :class="selectClass">
        <option value="meses">meses</option>
        <option value="anios">anios</option>
      </select>
    </FormField>
  </div>
</template>

<script setup lang="ts">
import FormField from '~/components/shared/FormField.vue'
import Input from '@/components/ui/Input.vue'

interface Props {
  form: any
  ciudades?: any[]
  tiposContrato?: any[]
}

withDefaults(defineProps<Props>(), {
  ciudades: () => [],
  tiposContrato: () => []
})

const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
</script>
