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
        <select v-model="form.solicitud.rol_en_solicitud" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          <option value="solicitante">solicitante</option>
          <option value="codeudor">codeudor</option>
        </select>
      </FormField>
      <FormField label="Valor solicitado">
        <Input v-model.number="form.solicitud.valor_solicitado" type="number" min="0" />
      </FormField>
      <FormField label="Plazo (meses)">
        <Input v-model.number="form.solicitud.plazo_meses" type="number" min="1" />
      </FormField>
      <FormField label="Producto">
        <select v-model="form.producto_solicitado.tipo" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          <option value="educacion">educacion</option>
          <option value="salud">salud</option>
          <option value="vivienda">vivienda</option>
          <option value="electrodomesticos">electrodomesticos</option>
          <option value="productos_hogar">productos_hogar</option>
          <option value="vestuario">vestuario</option>
          <option value="recreacion">recreacion</option>
          <option value="turismo">turismo</option>
        </select>
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

interface Props {
  form: any
  fechaRadicado: string
}

defineProps<Props>()
</script>
