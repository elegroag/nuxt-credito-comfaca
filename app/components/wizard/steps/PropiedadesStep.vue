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
          <CardTitle class="text-sm font-semibold">Propiedad #{{ (idx as number) + 1 }}</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            class="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2" 
            @click="removePropiedad(idx as number)"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent class="grid gap-4 sm:grid-cols-2 pb-4">
          <FormField label="Tipo bien">
            <CustomSelect
              v-model="p.tipo_bien"
              :options="tiposBienOptions"
              placeholder="Seleccionar tipo"
            />
          </FormField>
          <FormField label="Ciudad">
            <CustomSelect
              v-model="p.ciudad"
              :options="ciudadesOptions"
              placeholder="Seleccionar ciudad"
              clearable
              searchable
            />
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
import { computed } from '#imports'
import FormField from '~/components/shared/FormField.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CustomSelect from '~/components/ui/CustomSelect.vue'

interface Props {
  form: any
  addPropiedad: () => void
  removePropiedad: (index: number) => void
  ciudades?: any[]
}

interface SelectOption {
  label: string
  value: string | number
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  ciudades: () => []
})

// Opciones para tipo de bien
const tiposBienOptions: SelectOption[] = [
  { label: 'Vivienda', value: 'vivienda' },
  { label: 'Vehículo', value: 'vehiculo' }
]

// Convertir ciudades a formato SelectOption
const ciudadesOptions = computed(() => 
  props.ciudades.map(item => ({
    label: item.detciu,
    value: item.codciu
  }))
)
</script>
