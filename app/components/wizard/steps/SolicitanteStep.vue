<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <FormField label="Fecha vinculación">
      <Input v-model="form.solicitante.fecha_vinculacion" type="date" />
    </FormField>
    <FormField label="Tipo identificación">
      <Select v-model="form.solicitante.tipo_identificacion">
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="CC">CC</SelectItem>
          <SelectItem value="CE">CE</SelectItem>
        </SelectContent>
      </Select>
    </FormField>
    <FormField label="Número identificación">
      <Input v-model="form.solicitante.numero_identificacion" />
    </FormField>
    <FormField label="Fecha nacimiento">
      <Input v-model="form.solicitante.fecha_nacimiento" type="date" />
    </FormField>
    <FormField label="País nacimiento">
      <Input v-model="form.solicitante.pais_nacimiento" />
    </FormField>
    <FormField label="Nombres y apellidos">
      <Input v-model="form.solicitante.nombres_apellidos" />
    </FormField>
    <FormField label="Fecha expedición documento">
      <Input v-model="form.solicitante.fecha_expedicion_documento" type="date" />
    </FormField>
    <FormField label="Profesión/Ocupación">
      <Input v-model="form.solicitante.profesion_ocupacion" />
    </FormField>
    <FormField label="Sexo">
      <Select v-model="form.solicitante.sexo">
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar sexo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="M">M</SelectItem>
          <SelectItem value="F">F</SelectItem>
        </SelectContent>
      </Select>
    </FormField>
    <FormField label="Nivel educativo">
      <Select v-model="form.solicitante.nivel_educativo">
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar nivel" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="primaria">primaria</SelectItem>
          <SelectItem value="bachillerato">bachillerato</SelectItem>
          <SelectItem value="tecnico">tecnico</SelectItem>
          <SelectItem value="universitario">universitario</SelectItem>
          <SelectItem value="posgrado">posgrado</SelectItem>
          <SelectItem value="ninguno">ninguno</SelectItem>
        </SelectContent>
      </Select>
    </FormField>

    <FormField label="Barrio residencia">
      <Input v-model="form.solicitante.barrio_residencia" />
    </FormField>
    <FormField label="Ciudad residencia">
      <Input v-model="form.solicitante.ciudad_residencia" />
    </FormField>
    <FormField label="País residencia">
      <Input v-model="form.solicitante.pais_residencia" />
    </FormField>
    <FormField label="Teléfono fijo (opcional)">
      <Input v-model="form.solicitante.telefono_fijo" />
    </FormField>
    <FormField label="Teléfono móvil">
      <Input v-model="form.solicitante.telefono_movil" />
    </FormField>
    <FormField label="Email">
      <Input v-model="form.solicitante.email" type="email" />
    </FormField>

    <FormField label="Tipo vivienda">
      <Select v-model="form.solicitante.tipo_vivienda">
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="propia">propia</SelectItem>
          <SelectItem value="familiar">familiar</SelectItem>
          <SelectItem value="arrendada">arrendada</SelectItem>
        </SelectContent>
      </Select>
    </FormField>

    <label class="flex items-center gap-2 text-sm text-foreground">
      <input 
        v-model="form.solicitante.vive_con_nucleo_familiar" 
        type="checkbox" 
        class="h-4 w-4 rounded border-input text-primary focus:ring-primary" 
      />
      Vive con núcleo familiar
    </label>

    <FormField label="Personas a cargo">
      <Input v-model.number="form.solicitante.personas_a_cargo" type="number" min="0" />
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
