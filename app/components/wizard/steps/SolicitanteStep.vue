<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <FormField label="Fecha vinculación">
      <Input v-model="form.solicitante.fecha_vinculacion" type="date" />
    </FormField>
    
    <FormField label="Tipo identificación">
      <select v-model="form.solicitante.tipo_identificacion" :class="selectClass">
        <option value="" disabled>Seleccionar tipo</option>
        <option 
          v-for="item in tiposDocumento" 
          :key="item.coddoc" 
          :value="item.coddoc"
        >
          {{ item.detdoc }}
        </option>
      </select>
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
      <select v-model="form.solicitante.profesion_ocupacion" :class="selectClass">
        <option value="" disabled>Seleccionar ocupación</option>
        <option 
          v-for="item in ocupaciones" 
          :key="item.codocu" 
          :value="item.codocu"
        >
          {{ item.detalle }}
        </option>
      </select>
    </FormField>
    
    <FormField label="Sexo">
      <select v-model="form.solicitante.sexo" :class="selectClass">
        <option value="" disabled>Seleccionar sexo</option>
        <option 
          v-for="item in sexos" 
          :key="item.codsex" 
          :value="item.codsex"
        >
          {{ item.detsex }}
        </option>
      </select>
    </FormField>
    
    <FormField label="Nivel educativo">
      <select v-model="form.solicitante.nivel_educativo" :class="selectClass">
        <option value="" disabled>Seleccionar nivel</option>
        <option 
          v-for="item in nivelesEducativos" 
          :key="item.nivedu" 
          :value="item.nivedu"
        >
          {{ item.detalle }}
        </option>
      </select>
    </FormField>

    <FormField label="Barrio residencia">
      <Input v-model="form.solicitante.barrio_residencia" />
    </FormField>
    
    <FormField label="Ciudad residencia (Vue Select)">
      <vSelect
        v-model="form.solicitante.ciudad_residencia"
        :options="ciudades"
        :reduce="(item: CiudadOption) => item.codciu"
        label="detciu"
        placeholder="Seleccionar ciudad"
        :clearable="true"
        :searchable="true"
        class="w-full"
      />
    </FormField>
    
    <FormField label="País residencia">
      <Input v-model="form.solicitante.pais_residencia" />
    </FormField>
    <FormField label="Estado civil">
      <select v-model="form.solicitante.estado_civil" :class="selectClass">
        <option value="" disabled>Seleccionar estado civil</option>
        <option 
          v-for="item in estadoCiviles" 
          :key="item.estciv" 
          :value="item.estciv"
        >
          {{ item.detest }}
        </option>
      </select>
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
      <select v-model="form.solicitante.tipo_vivienda" :class="selectClass">
        <option value="" disabled>Seleccionar tipo</option>
        <option 
          v-for="item in tiposVivienda" 
          :key="item.vivienda" 
          :value="item.vivienda"
        >
          {{ item.detalle }}
        </option>
      </select>
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
import { h } from 'vue'
import FormField from '~/components/shared/FormField.vue'
import Input from '@/components/ui/Input.vue'
import vSelect from 'vue-select'
import "~/assets/css/vue-select.css";

// Configurar componentes personalizados para vue-select
vSelect.props.components.default = () => ({
  Deselect: {
    render: () => h('span', '❌'),
  },
  OpenIndicator: {
    render: () => h('span', '🔽'),
  },
})

interface CiudadOption {
  codciu: string
  detciu: string
}

interface Props {
  form: any
  ciudades?: CiudadOption[]
  tiposDocumento?: any[]
  sexos?: any[]
  nivelesEducativos?: any[]
  tiposVivienda?: any[]
  ocupaciones?: any[]
  estadoCiviles?: any[]
}

withDefaults(defineProps<Props>(), {
  ciudades: () => [],
  tiposDocumento: () => [],
  sexos: () => [],
  nivelesEducativos: () => [],
  tiposVivienda: () => [],
  ocupaciones: () => [],
  estadoCiviles: () => []
})

const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
</script>

<style scoped>
:root {
  --vs-controls-color: #664cc3;
  --vs-border-color: #664cc3;

  --vs-dropdown-bg: #282c34;
  --vs-dropdown-color: #cc99cd;
  --vs-dropdown-option-color: #cc99cd;

  --vs-selected-bg: #664cc3;
  --vs-selected-color: #eeeeee;

  --vs-search-input-color: #eeeeee;

  --vs-dropdown-option--active-bg: #664cc3;
  --vs-dropdown-option--active-color: #eeeeee;
}
</style>