<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <FormField label="Tipo persona">
      <CustomSelect v-model="form.solicitante.tipo_persona" :options="tiposPersonaOptions"
        placeholder="Seleccionar tipo" clearable required />
    </FormField>

    <FormField label="Tipo documento">
      <CustomSelect v-model="form.solicitante.tipo_documento" :options="tiposDocumentoOptions"
        placeholder="Seleccionar tipo" clearable required />
    </FormField>

    <FormField label="Número documento">
      <Input v-model="form.solicitante.numero_documento" />
    </FormField>

    <FormField label="Nombres">
      <Input v-model="form.solicitante.nombres" />
    </FormField>

    <FormField label="Apellidos">
      <Input v-model="form.solicitante.apellidos" />
    </FormField>

    <FormField label="Razón social (opcional)">
      <Input v-model="form.informacion_laboral.empresa_razon_social" />
    </FormField>

    <FormField label="NIT (opcional)">
      <Input v-model="form.informacion_laboral.empresa_nit" />
    </FormField>

    <FormField label="Fecha nacimiento">
      <Input v-model="form.solicitante.fecha_nacimiento" type="date" />
    </FormField>

    <FormField label="Género">
      <CustomSelect v-model="form.solicitante.genero" :options="sexosOptions" placeholder="Seleccionar género"
        clearable />
    </FormField>

    <FormField label="Estado civil">
      <CustomSelect v-model="form.solicitante.estado_civil" :options="estadoCivilesOptions"
        placeholder="Seleccionar estado civil" clearable />
    </FormField>

    <FormField label="Nivel educativo">
      <CustomSelect v-model="form.solicitante.nivel_educativo" :options="nivelesEducativosOptions"
        placeholder="Seleccionar nivel" clearable searchable />
    </FormField>

    <FormField label="Profesión">
      <CustomSelect v-model="form.solicitante.profesion" :options="ocupacionesOptions"
        placeholder="Seleccionar profesión" clearable searchable />
    </FormField>

    <FormField label="Email">
      <Input v-model="form.solicitante.email" type="email" />
    </FormField>

    <FormField label="Teléfono (opcional)">
      <Input v-model="form.solicitante.telefono" />
    </FormField>

    <FormField label="Celular">
      <Input v-model="form.solicitante.celular" />
    </FormField>

    <FormField label="Dirección">
      <Input v-model="form.solicitante.direccion" />
    </FormField>

    <FormField label="Barrio">
      <Input v-model="form.solicitante.barrio" />
    </FormField>

    <FormField label="Ciudad">
      <CustomSelect v-model="form.solicitante.ciudad" :options="ciudadesOptions" placeholder="Seleccionar ciudad"
        clearable searchable @option:selected="handleCiudadChange" />
    </FormField>

    <FormField label="Departamento">
      <Input v-model="form.solicitante.departamento" />
    </FormField>

    <FormField label="Cargo">
      <Input v-model="form.solicitante.cargo" />
    </FormField>

    <FormField label="Salario (opcional)">
      <Input v-model.number="form.solicitante.salario" type="number" min="0" />
    </FormField>

    <FormField label="Antigüedad (meses, opcional)">
      <Input v-model.number="form.solicitante.antiguedad_meses" type="number" min="0" />
    </FormField>

    <FormField label="Tipo contrato (opcional)">
      <Input v-model="form.solicitante.tipo_contrato" />
    </FormField>

    <FormField label="Sector económico (opcional)">
      <Input v-model="form.solicitante.sector_economico" />
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

// Opciones para tipo persona
const tiposPersonaOptions = computed(() => [
  { label: 'Natural', value: 'natural' },
  { label: 'Jurídica', value: 'juridica' }
]);

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