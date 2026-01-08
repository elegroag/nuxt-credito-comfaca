<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <FormField label="Arrendamientos">
      <Input v-model.number="form.informacion_economica.arrendamientos" type="number" min="0" />
    </FormField>
    <FormField label="Otros ingresos">
      <Input v-model.number="form.informacion_economica.otros" type="number" min="0" />
    </FormField>
    <FormField label="Descripción otros ingresos" class="sm:col-span-2">
      <textarea 
        v-model="form.informacion_economica.descripcion" 
        class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        placeholder="Describa otros ingresos..."
      ></textarea>
    </FormField>

    <FormField label="Total gastos">
      <Input v-model.number="form.informacion_economica.total_gastos" type="number" min="0" />
    </FormField>
    <FormField label="Descripción gastos" class="sm:col-span-2">
      <textarea 
        v-model="form.informacion_economica.gastos_descripcion" 
        class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        placeholder="Describa los gastos..."
      ></textarea>
    </FormField>

    <FormField label="Total activos">
      <Input v-model.number="form.informacion_economica.total_activos" type="number" min="0" />
    </FormField>
    <FormField label="Total pasivos">
      <Input v-model.number="form.informacion_economica.total_pasivos" type="number" min="0" />
    </FormField>
  </div>
</template>

<script setup lang="ts">
import FormField from '~/components/shared/FormField.vue'
import Input from '@/components/ui/Input.vue'

interface Props {
  form: any
}

defineProps<Props>()
</script>
