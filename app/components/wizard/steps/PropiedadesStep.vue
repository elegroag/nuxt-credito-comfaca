<template>
  <div class="grid gap-4">
    <div class="flex items-center justify-between mb-4">
      <div class="text-sm font-bold uppercase tracking-wider text-muted-foreground">Propiedades</div>
      <Button
        variant="outline"
        size="sm"
        type="button"
        @click="addPropiedad"
      >
        <Plus class="mr-2 h-4 w-4" />
        Agregar
      </Button>
    </div>

    <div v-if="form.propiedades.length === 0" class="rounded-lg bg-muted/50 p-8 text-center border-2 border-dashed border-border">
      <p class="text-sm text-muted-foreground italic">No se han registrado propiedades.</p>
    </div>

    <div class="grid gap-4">
      <Card v-for="(p, idx) in form.propiedades" :key="idx" class="border-border/50 bg-muted/20">
        <CardHeader class="flex flex-row items-center justify-between py-3">
          <CardTitle class="text-sm font-semibold">Propiedad #{{ idx + 1 }}</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            class="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2" 
            @click="removePropiedad(idx)"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent class="grid gap-4 sm:grid-cols-2 pb-4">
          <FormField label="Tipo bien">
            <select v-model="p.tipo_bien" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <option value="vivienda">vivienda</option>
              <option value="vehiculo">vehiculo</option>
            </select>
          </FormField>
          <FormField label="Ciudad">
            <Input v-model="p.ciudad" />
          </FormField>
          <FormField label="Descripción" class="sm:col-span-2">
            <Input v-model="p.descripcion" />
          </FormField>

          <FormField v-if="p.tipo_bien === 'vivienda'" label="Matrícula inmobiliaria">
            <Input v-model="p.matricula_inmobiliaria" />
          </FormField>
          <FormField v-else label="Modelo o matrícula">
            <Input v-model="p.modelo_o_matricula" />
          </FormField>

          <FormField label="Valor comercial">
            <Input v-model.number="p.valor_comercial" type="number" min="0" />
          </FormField>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import FormField from '~/components/shared/FormField.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'

interface Props {
  form: any
  addPropiedad: () => void
  removePropiedad: (index: number) => void
}

defineProps<Props>()
</script>
