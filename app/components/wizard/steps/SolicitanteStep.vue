<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <FormField label="Fecha vinculación">
      <Input v-model="form.solicitante.fecha_vinculacion" type="date" />
    </FormField>

    <FormField label="Tipo identificación">
      <CustomSelect v-model="form.solicitante.tipo_identificacion" :options="tiposDocumentoOptions"
        placeholder="Seleccionar tipo" clearable required />
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
      <CustomSelect v-model="form.solicitante.profesion_ocupacion" :options="ocupacionesOptions"
        placeholder="Seleccionar ocupación" clearable searchable />
    </FormField>
    <FormField label="Sexo">
      <CustomSelect v-model="form.solicitante.sexo" :options="sexosOptions" placeholder="Seleccionar sexo" clearable />
    </FormField>

    <FormField label="Nivel educativo">
      <CustomSelect v-model="form.solicitante.nivel_educativo" :options="nivelesEducativosOptions"
        placeholder="Seleccionar nivel" clearable searchable />
    </FormField>

    <FormField label="Barrio residencia">
      <Input v-model="form.solicitante.barrio_residencia" />
    </FormField>

    <FormField label="Ciudad residencia">
      <CustomSelect v-model="form.solicitante.ciudad_residencia" :options="ciudadesOptions"
        placeholder="Seleccionar ciudad" clearable searchable @option:selected="handleCiudadChange" />
    </FormField>

    <FormField label="País residencia">
      <Input v-model="form.solicitante.pais_residencia" />
    </FormField>
    <FormField label="Estado civil">
      <CustomSelect v-model="form.solicitante.estado_civil" :options="estadoCivilesOptions"
        placeholder="Seleccionar estado civil" clearable />
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
      <CustomSelect v-model="form.solicitante.tipo_vivienda" :options="tiposViviendaOptions"
        placeholder="Seleccionar tipo" clearable />
    </FormField>

    <label class="flex items-center gap-2 text-sm text-foreground">
      <input v-model="form.solicitante.vive_con_nucleo_familiar" type="checkbox"
        class="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
      Vive con núcleo familiar
    </label>

    <FormField label="Personas a cargo">
      <Input v-model.number="form.solicitante.personas_a_cargo" type="number" min="0" />
    </FormField>
  </div>
</template>

<script setup lang="ts">
import { computed } from '#imports';
import FormField from '~/components/shared/FormField.vue';
import Input from '@/components/ui/Input.vue';
import CustomSelect from '~/components/ui/CustomSelect.vue';
import type { CiudadOption, SelectOption, SolocitanteProps } from '~/shared/types/solicitud-credito';

const props = withDefaults(defineProps<SolocitanteProps>(), {
  ciudades: () => [],
  tiposDocumento: () => [],
  sexos: () => [],
  nivelesEducativos: () => [],
  tiposVivienda: () => [],
  ocupaciones: () => [],
  estadoCiviles: () => []
});

// Convertir datos a formato SelectOption
const tiposDocumentoOptions = computed(() =>
  props.tiposDocumento.map(item => ({
    label: item.detdoc,
    value: item.coddoc
  }))
);

const ocupacionesOptions = computed(() =>
  props.ocupaciones.map(item => ({
    label: item.detalle,
    value: item.codocu
  }))
);

const sexosOptions = computed(() =>
  props.sexos.map(item => ({
    label: item.detsex,
    value: item.codsex
  }))
);

const nivelesEducativosOptions = computed(() =>
  props.nivelesEducativos.map(item => ({
    label: item.detalle,
    value: item.nivedu
  }))
);

const tiposViviendaOptions = computed(() =>
  props.tiposVivienda.map(item => ({
    label: item.detalle,
    value: item.vivienda
  }))
);

const estadoCivilesOptions = computed(() =>
  props.estadoCiviles.map(item => ({
    label: item.detest,
    value: item.estciv
  }))
);

const ciudadesOptions = computed(() =>
  props.ciudades.map(item => ({
    label: item.detciu,
    value: item.codciu,
    description: `Código: ${item.codciu}`
  }))
);

// Event handlers
const handleCiudadChange = (option: SelectOption) => {
  console.log('Ciudad seleccionada:', option);
  // Aquí puedes agregar lógica adicional cuando se selecciona una ciudad
};
</script>