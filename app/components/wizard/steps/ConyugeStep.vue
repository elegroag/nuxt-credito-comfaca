<template>
  <div class="grid gap-4">
    <label class="flex items-center gap-2 text-sm text-foreground">
      <input type="checkbox" class="h-4 w-4 rounded border-input text-primary focus:ring-primary"
        :checked="!!form.conyuge" :disabled="loadingLocal"
        @change="(ev) => toggleConyugeHandler((ev.target as HTMLInputElement).checked)" />
      <span class="flex items-center gap-2">
        Incluir datos del cónyuge
        <div v-if="loadingLocal" class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full">
        </div>
      </span>
    </label>

    <!-- Mensaje de carga -->
    <div v-if="loadingLocal" class="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div class="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      <span class="text-sm text-blue-700">Buscando datos del cónyuge...</span>
    </div>

    <div v-if="form.conyuge && !loadingLocal" class="grid gap-4 sm:grid-cols-2">
      <FormField label="Identificación">
        <Input v-model="form.conyuge.identificacion" />
      </FormField>
      <FormField label="Nombres y apellidos">
        <Input v-model="form.conyuge.nombres_apellidos" />
      </FormField>
      <FormField label="Ingresos laborales">
        <Input v-model.number="form.conyuge.ingresos_laborales" type="number" min="0" />
      </FormField>
      <label class="flex items-center gap-2 text-sm text-foreground">
        <input v-model="form.conyuge.trabaja" type="checkbox"
          class="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
        Trabaja
      </label>
      <FormField label="Teléfono móvil">
        <Input v-model="form.conyuge.telefono_movil" />
      </FormField>

      <div class="sm:col-span-2 mt-2 text-sm font-semibold text-foreground">Empresa (opcional)</div>
      <label class="sm:col-span-2 flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" class="h-4 w-4 rounded border-input text-primary focus:ring-primary"
          :checked="!!form.conyuge.empresa"
          @change="(ev) => toggleEmpresaConyuge((ev.target as HTMLInputElement).checked)" />
        Incluir empresa
      </label>

      <template v-if="form.conyuge.empresa">
        <FormField label="Nombre" class="sm:col-span-2">
          <Input v-model="form.conyuge.empresa.nombre" />
        </FormField>
        <FormField label="Dirección" class="sm:col-span-2">
          <Input v-model="form.conyuge.empresa.direccion" />
        </FormField>
        <FormField label="Teléfono">
          <Input v-model="form.conyuge.empresa.telefono" />
        </FormField>
        <FormField label="Email">
          <Input v-model="form.conyuge.empresa.email" type="email" />
        </FormField>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FormField from '~/components/shared/FormField.vue'
import Input from '@/components/ui/Input.vue'
import type { ConyugeProps } from '~/shared/types/solicitud-credito'
import { useSession } from '~/composables/useSession'
import { useConyugeTrabajador } from '~/composables/solicitud/useConyugeComposable'

const props = defineProps<ConyugeProps>()

// Obtener datos del trabajador desde la sesión
const { session } = useSession()

// Obtener composable de cónyuge
const { buscarConyuge } = useConyugeTrabajador()

// Estado local para loading
const loadingLocal = ref(false)

// Función para buscar datos del cónyuge usando el composable
const buscarDatosConyuge = async (cedulaTrabajador: string) => {
  try {
    const conyuges = await buscarConyuge(cedulaTrabajador, 'A')

    if (conyuges.length > 0) {
      const conyugeData = conyuges[0]

      // Validar que conyugeData exista
      if (!conyugeData) {
        console.warn('No se encontraron datos válidos del cónyuge')
        return
      }

      // Mapear datos del cónyuge al formulario
      if (props.form.conyuge) {
        props.form.conyuge.identificacion = conyugeData.cedcon || ''
        props.form.conyuge.nombres_apellidos = conyugeData.nombre || ''
        props.form.conyuge.ingresos_laborales = conyugeData.salario || 0
        props.form.conyuge.trabaja = (conyugeData.salario || 0) > 0
        props.form.conyuge.telefono_movil = conyugeData.telefono || ''

        // Cargar datos de la empresa si tiene
        if ((conyugeData.salario || 0) > 0) {
          props.form.informacion_laboral.empresa = {
            nombre: 'Empresa del cónyuge', // Valor por defecto ya que no viene en la API
            direccion: conyugeData.direccion || '',
            telefono: conyugeData.telefono || '',
            email: conyugeData.email || ''
          }
        }
      }
    }
  } catch (error) {
    console.error('Error buscando datos del cónyuge:', error)
  } finally {
    loadingLocal.value = false
  }
}

// Función modificada para toggleConyuge que busca datos del backend
const toggleConyugeHandler = async (checked: boolean) => {
  loadingLocal.value = checked // Activar loading si se está activando
  props.toggleConyuge(checked)

  // Si se está activando el cónyuge y tenemos la cédula del trabajador, buscar datos
  if (checked && session.value?.user?.trabajador?.cedula) {
    await buscarDatosConyuge(session.value.user.trabajador.cedula)
  } else {
    loadingLocal.value = false
  }
}
</script>
