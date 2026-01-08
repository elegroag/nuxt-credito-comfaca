<template>
  <div class="grid gap-8">
    <!-- Referencias Familiares -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="h-8 w-1 bg-primary rounded-full"></div>
          <h3 class="text-sm font-bold uppercase tracking-wider text-muted-foreground">Referencias familiares</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          type="button"
          @click="addReferencia('familiares')"
        >
          <Plus class="mr-2 h-4 w-4" />
          Agregar
        </Button>
      </div>

      <div v-if="form.referencias.familiares.length === 0" class="rounded-lg bg-muted/50 p-6 text-center border-2 border-dashed border-border">
        <p class="text-sm text-muted-foreground italic">No se han registrado referencias familiares.</p>
      </div>

      <div class="grid gap-4">
        <Card v-for="(r, idx) in form.referencias.familiares" :key="`f-${idx}`" class="border-border/50 bg-muted/20 shadow-none">
          <CardHeader class="flex flex-row items-center justify-between py-3">
            <CardTitle class="text-sm font-semibold">Familiar #{{ idx + 1 }}</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              class="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2" 
              @click="removeReferencia('familiares', idx)"
            >
              <Trash2 class="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent class="grid gap-4 sm:grid-cols-2 pb-4">
            <FormField label="Nombre y apellidos">
              <Input v-model="r.nombre_apellidos" placeholder="Nombre completo" />
            </FormField>
            <FormField label="Celular">
              <Input v-model="r.celular" placeholder="Número de celular" />
            </FormField>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Referencias Personales -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="h-8 w-1 bg-secondary rounded-full"></div>
          <h3 class="text-sm font-bold uppercase tracking-wider text-muted-foreground">Referencias personales</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          type="button"
          @click="addReferencia('personales')"
        >
          <Plus class="mr-2 h-4 w-4" />
          Agregar
        </Button>
      </div>

      <div v-if="form.referencias.personales.length === 0" class="rounded-lg bg-muted/50 p-6 text-center border-2 border-dashed border-border">
        <p class="text-sm text-muted-foreground italic">No se han registrado referencias personales.</p>
      </div>

      <div class="grid gap-4">
        <Card v-for="(r, idx) in form.referencias.personales" :key="`p-${idx}`" class="border-border/50 bg-muted/20 shadow-none">
          <CardHeader class="flex flex-row items-center justify-between py-3">
            <CardTitle class="text-sm font-semibold">Personal #{{ idx + 1 }}</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              class="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2" 
              @click="removeReferencia('personales', idx)"
            >
              <Trash2 class="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent class="grid gap-4 sm:grid-cols-2 pb-4">
            <FormField label="Nombre y apellidos">
              <Input v-model="r.nombre_apellidos" placeholder="Nombre completo" />
            </FormField>
            <FormField label="Celular">
              <Input v-model="r.celular" placeholder="Número de celular" />
            </FormField>
          </CardContent>
        </Card>
      </div>
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
  addReferencia: (type: 'familiares' | 'personales') => void
  removeReferencia: (type: 'familiares' | 'personales', index: number) => void
}

defineProps<Props>()
</script>
