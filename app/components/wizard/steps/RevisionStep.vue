<template>
  <div class="grid gap-6">
    <!-- Resumen de datos -->
    <Card class="border-border/50 bg-muted/10 shadow-none">
      <CardHeader class="py-3">
        <CardTitle class="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <ClipboardList class="h-4 w-4" />
          Resumen de la solicitud
        </CardTitle>
      </CardHeader>
      <CardContent class="pb-4">
        <div class="grid gap-4 text-sm">
          <!-- Encabezado -->
          <div class="border-l-4 border-indigo-200 pl-4">
            <h4 class="font-semibold text-indigo-700 mb-2">Encabezado</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div v-for="(value, key) in getResumenEncabezado()" :key="String(key)">
                <span class="font-medium">{{ formatKey(String(key)) }}:</span> {{ formatValue(value) }}
              </div>
            </div>
          </div>

          <!-- Solicitud -->
          <div class="border-l-4 border-green-200 pl-4">
            <h4 class="font-semibold text-green-700 mb-2">Solicitud</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div v-for="(value, key) in getResumenSolicitud()" :key="String(key)">
                <span class="font-medium">{{ formatKey(String(key)) }}:</span> {{ formatValue(value) }}
              </div>
            </div>
          </div>

          <!-- Solicitante -->
          <div class="border-l-4 border-blue-200 pl-4">
            <h4 class="font-semibold text-blue-700 mb-2">Datos del Solicitante</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div v-for="(value, key) in getResumenSolicitante()" :key="String(key)">
                <span class="font-medium">{{ formatKey(String(key)) }}:</span> {{ formatValue(value) }}
              </div>
            </div>
          </div>

          <!-- Datos del Simulador -->
          <div v-if="getResumenSimulador()" class="border-l-4 border-orange-200 pl-4">
            <h4 class="font-semibold text-orange-700 mb-2">Datos del Simulador</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div v-for="(value, key) in getResumenSimulador()" :key="String(key)">
                <span class="font-medium">{{ formatKey(String(key)) }}:</span> {{ formatValue(value) }}
              </div>
            </div>
          </div>

          <!-- Cónyuge (si aplica) -->
          <div v-if="getResumenConyuge()" class="border-l-4 border-purple-200 pl-4">
            <h4 class="font-semibold text-purple-700 mb-2">Datos del Cónyuge</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div v-for="(value, key) in getResumenConyuge()" :key="String(key)">
                <span class="font-medium">{{ formatKey(String(key)) }}:</span> {{ formatValue(value) }}
              </div>
            </div>
          </div>

          <!-- Información Laboral -->
          <div class="border-l-4 border-orange-200 pl-4">
            <h4 class="font-semibold text-orange-700 mb-2">Información Laboral</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div v-for="(value, key) in getResumenLaboral()" :key="String(key)">
                <span class="font-medium">{{ formatKey(String(key)) }}:</span> {{ formatValue(value) }}
              </div>
            </div>
          </div>

          <!-- Ingresos y Descuentos -->
          <div class="border-l-4 border-teal-200 pl-4">
            <h4 class="font-semibold text-teal-700 mb-2">Ingresos y Descuentos</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div v-for="(value, key) in getResumenIngresos()" :key="String(key)">
                <span class="font-medium">{{ formatKey(String(key)) }}:</span> {{ formatValue(value) }}
              </div>
            </div>
          </div>

          <!-- Información Económica -->
          <div class="border-l-4 border-cyan-200 pl-4">
            <h4 class="font-semibold text-cyan-700 mb-2">Información Económica</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div v-for="(value, key) in getResumenEconomica()" :key="String(key)">
                <span class="font-medium">{{ formatKey(String(key)) }}:</span> {{ formatValue(value) }}
              </div>
            </div>
          </div>

          <!-- Propiedades -->
          <div v-if="getResumenPropiedades().length > 0" class="border-l-4 border-lime-200 pl-4">
            <h4 class="font-semibold text-lime-700 mb-2">Propiedades</h4>
            <div v-for="(propiedad, index) in getResumenPropiedades()" :key="index" class="mb-3">
              <div class="text-xs font-medium text-lime-600 mb-1">Propiedad {{ formatIndex(index) }}</div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs ml-2">
                <div v-for="(value, key) in propiedad" :key="String(key)">
                  <span class="font-medium">{{ formatKey(String(key)) }}:</span> {{ formatValue(value) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Deudas -->
          <div v-if="getResumenDeudas().length > 0" class="border-l-4 border-rose-200 pl-4">
            <h4 class="font-semibold text-rose-700 mb-2">Deudas y Obligaciones</h4>
            <div v-for="(deuda, index) in getResumenDeudas()" :key="index" class="mb-3">
              <div class="text-xs font-medium text-rose-600 mb-1">Deuda {{ formatIndex(index) }}</div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs ml-2">
                <div v-for="(value, key) in deuda" :key="String(key)">
                  <span class="font-medium">{{ formatKey(String(key)) }}:</span> {{ formatValue(value) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Referencias Familiares -->
          <div v-if="getResumenReferenciasFamiliares().length > 0" class="border-l-4 border-amber-200 pl-4">
            <h4 class="font-semibold text-amber-700 mb-2">Referencias Familiares</h4>
            <div v-for="(referencia, index) in getResumenReferenciasFamiliares()" :key="index" class="mb-3">
              <div class="text-xs font-medium text-amber-600 mb-1">Referencia {{ formatIndex(index) }}</div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs ml-2">
                <div v-for="(value, key) in referencia" :key="String(key)">
                  <span class="font-medium">{{ formatKey(String(key)) }}:</span> {{ formatValue(value) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Referencias Personales -->
          <div v-if="getResumenReferenciasPersonales().length > 0" class="border-l-4 border-violet-200 pl-4">
            <h4 class="font-semibold text-violet-700 mb-2">Referencias Personales</h4>
            <div v-for="(referencia, index) in getResumenReferenciasPersonales()" :key="index" class="mb-3">
              <div class="text-xs font-medium text-violet-600 mb-1">Referencia {{ formatIndex(index) }}</div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs ml-2">
                <div v-for="(value, key) in referencia" :key="String(key)">
                  <span class="font-medium">{{ formatKey(String(key)) }}:</span> {{ formatValue(value) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Payload JSON colapsable -->
    <Card class="border-border/50 bg-muted/10 shadow-none">
      <CardHeader class="py-3">
        <div class="flex items-center justify-between">
          <CardTitle class="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <FileCode class="h-4 w-4" />
            Payload (JSON)
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            class="h-8 gap-2 bg-background"
            @click="togglePayload"
          >
            <PenTool class="h-3.5 w-3.5" />
            {{ mostrarPayload ? 'Ocultar' : 'Mostrar' }}
          </Button>
        </div>
      </CardHeader>
      <CardContent v-if="mostrarPayload" class="pb-4">
        <div class="rounded-lg bg-background p-4 border border-border">
          <pre class="overflow-auto text-[10px] text-foreground font-mono leading-relaxed">{{ prettyPayload }}</pre>
        </div>
      </CardContent>
    </Card>

    <Card v-if="xmlText" class="border-primary/20 bg-primary/5 shadow-none animate-in fade-in slide-in-from-bottom-2">
      <CardHeader class="flex flex-row items-center justify-between py-3">
        <CardTitle class="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
          <FileCode class="h-4 w-4" />
          XML generado
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          class="h-8 gap-2 bg-background"
          @click="downloadXml"
        >
          <Download class="h-3.5 w-3.5" />
          Descargar
        </Button>
      </CardHeader>
      <CardContent class="pb-4 space-y-3">
        <div v-if="savedFilename" class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-secondary/20 text-secondary-foreground text-[10px] font-bold uppercase tracking-wider">
          <CheckCircle2 class="h-3 w-3" />
          Guardado en: {{ savedFilename }}
        </div>
        <div class="rounded-lg bg-background p-4 border border-border">
          <pre class="overflow-auto text-[10px] text-foreground font-mono leading-relaxed">{{ xmlText }}</pre>
        </div>
      </CardContent>
    </Card>

    <div v-if="errorMsg" class="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-3">
      <AlertCircle class="h-5 w-5 shrink-0" />
      <span class="font-medium">{{ errorMsg }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FileCode, Download, CheckCircle2, AlertCircle, ClipboardList, PenTool } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'

interface Props {
  prettyPayload: string
  xmlText?: string
  savedFilename?: string
  errorMsg?: string
  downloadXml: () => void
}

const props = defineProps<Props>()

// Estado para controlar la visibilidad del payload
const mostrarPayload = ref(false)

// Función para toggle del payload
const togglePayload = () => {
  mostrarPayload.value = !mostrarPayload.value
}

// Función para parsear el payload JSON
const parsePayload = () => {
  try {
    return JSON.parse(props.prettyPayload)
  } catch {
    return {}
  }
}

// Funciones para obtener resúmenes de datos
const getResumenEncabezado = () => {
  const data = parsePayload()
  return data.encabezado || {}
}

const getResumenSolicitud = () => {
  const data = parsePayload()
  return data.solicitud || {}
}

const getResumenSolicitante = () => {
  const data = parsePayload()
  return data.solicitante || {}
}

const getResumenSimulador = () => {
  if (typeof window === 'undefined') return null
  
  try {
    const simuladorData = localStorage.getItem('comfaca_simulador_data')
    if (!simuladorData) return null
    
    // Decodificar los datos para corregir problemas de codificación
    const decodedData = decodeURIComponent(simuladorData)
    const parsed = JSON.parse(decodedData)
    const lineaCredito = parsed.lineaCredito
    
    if (!lineaCredito) return null
    
    // Función para corregir texto
    const corregirTexto = (texto: string | undefined) => {
      if (!texto) return ''
      try {
        // Decodificar caracteres especiales
        return decodeURIComponent(texto)
      } catch {
        return texto
      }
    }
    
    // Extraer campos relevantes del simulador con corrección de codificación
    return {
      'linea_credito': corregirTexto(lineaCredito.detalle),
      'tipo_credito': lineaCredito.tipcre || '',
      'modelo_xml4': lineaCredito.modxml4 || '',
      'codigo_cre': lineaCredito.codcre || '',
      'codigo_cap': lineaCredito.codcap || '',
      'codigo_ser': lineaCredito.codser || '',
      'numero_cuotas': lineaCredito.numcuo || '',
      'estado': lineaCredito.estado || '',
      'monto_simulado': parsed.monto ? `$${parsed.monto.toLocaleString('es-CO')}` : '',
      'plazo_meses': parsed.plazoMeses || '',
      'tasa_anual': parsed.tasaInteresAnual ? `${parsed.tasaInteresAnual}%` : '',
      'cuota_mensual': parsed.cuotaMensual ? `$${parsed.cuotaMensual.toLocaleString('es-CO')}` : ''
    }
  } catch (error) {
    console.error('Error obteniendo datos del simulador:', error)
    return null
  }
}

const getResumenConyuge = () => {
  const data = parsePayload()
  return data.conyuge || null
}

const getResumenLaboral = () => {
  const data = parsePayload()
  return data.informacion_laboral || {}
}

const getResumenIngresos = () => {
  const data = parsePayload()
  return data.ingresos_descuentos || {}
}

const getResumenEconomica = () => {
  const data = parsePayload()
  return data.informacion_economica || {}
}

const getResumenPropiedades = () => {
  const data = parsePayload()
  return data.propiedades || []
}

const getResumenDeudas = () => {
  const data = parsePayload()
  return data.deudas || []
}

const getResumenReferenciasFamiliares = () => {
  const data = parsePayload()
  return data.referencias?.familiares || []
}

const getResumenReferenciasPersonales = () => {
  const data = parsePayload()
  return data.referencias?.personales || []
}

// Función helper para formatear índices
const formatIndex = (index: number | string) => {
  const numIndex = typeof index === 'string' ? parseInt(index, 10) : index
  return String(numIndex + 1)
}

// Función para formatear las claves
const formatKey = (key: string) => {
  // Mapeo de claves a nombres legibles en español
  const keyMap: Record<string, string> = {
    'linea_credito': 'Línea de Crédito',
    'tipo_credito': 'Tipo Crédito',
    'modelo_xml4': 'Modelo XML4',
    'codigo_cre': 'Código Cre',
    'codigo_cap': 'Código Cap',
    'codigo_ser': 'Código Ser',
    'numero_cuotas': 'Número Cuotas',
    'estado': 'Estado',
    'monto_simulado': 'Monto Simulado',
    'plazo_meses': 'Plazo Meses',
    'tasa_anual': 'Tasa Anual',
    'cuota_mensual': 'Cuota Mensual',
    'fecha_radicado': 'Fecha Radicado',
    'valor_solicitud': 'Valor Solicitud',
    'categoria': 'Categoría',
    'tipcre': 'Tipo Crédito',
    'modxml4': 'Modelo XML4',
    'detalle_modalidad': 'Modalidad de Crédito',
    'nombres_apellidos': 'Nombres y Apellidos',
    'tipo_identificacion': 'Tipo Identificación',
    'numero_identificacion': 'Número Identificación',
    'fecha_nacimiento': 'Fecha Nacimiento',
    'telefono_movil': 'Teléfono',
    'email': 'Email',
    'barrio_residencia': 'Dirección',
    'ciudad_residencia': 'Ciudad Residencia',
    'empresa_razon_social': 'Empresa',
    'empresa_nit': 'NIT',
    'cargo': 'Cargo',
    'fecha_ingreso': 'Fecha Ingreso',
    'salario_basico_mensual': 'Salario Básico',
    'subsidio_transporte': 'Subsidio Transporte',
    'salud_pension': 'Salud y Pensión'
  }
  
  return keyMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Función para formatear valores
const formatValue = (value: any) => {
  if (value === null || value === undefined || value === '') {
    return 'N/A'
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No'
  }
  
  if (typeof value === 'number') {
    return value.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  }
  
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  
  return String(value)
}
</script>
