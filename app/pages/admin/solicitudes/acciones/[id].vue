<template>
    <div class="container mx-auto py-8 px-4 max-w-4xl">
        <!-- Header -->
        <div class="mb-6">
            <div class="flex items-center gap-4 mb-4">
                <Button variant="outline" @click="volverADetalle()" class="shrink-0">
                    <ChevronLeft class="h-4 w-4 mr-2" />
                    Volver a Detalles
                </Button>
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">
                        Registro de Acciones
                    </h1>
                    <p class="text-sm text-gray-500">
                        Gestionar estado y notificaciones de la solicitud
                    </p>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div
            v-if="loading || loadingEstados"
            class="flex flex-col items-center justify-center py-16 space-y-4"
        >
            <Icon
                name="lucide:loader-2"
                class="w-10 h-10 animate-spin text-primary"
            />
            <p class="text-gray-500">Cargando información...</p>
        </div>

        <!-- Error State -->
        <div
            v-else-if="error"
            class="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center"
        >
            <Icon
                name="lucide:alert-circle"
                class="w-8 h-8 mx-auto mb-2 text-red-500"
            />
            <h3 class="font-bold mb-1">Error al cargar la información</h3>
            <p>{{ error }}</p>
            <Button class="mt-4" variant="outline" @click="cargarSolicitud">
                Reintentar
            </Button>
        </div>

        <!-- Formulario -->
        <div v-else-if="solicitud" class="space-y-6">
            <!-- Información de la Solicitud -->
            <Card class="border-0 shadow-md">
                <CardContent class="p-6">
                    <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText class="h-5 w-5" />
                        Información de la Solicitud
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="text-sm font-medium text-gray-500">
                                Número de Solicitud
                            </label>
                            <p class="text-lg font-semibold">
                                {{ solicitud.numero_solicitud || '-' }}
                            </p>
                        </div>
                        <div>
                            <label class="text-sm font-medium text-gray-500">
                                Estado Actual
                            </label>
                            <div class="flex items-center gap-2 mt-1">
                                <Badge
                                    v-if="estadoActualInfo"
                                    :style="{ backgroundColor: estadoActualInfo.color }"
                                    class="text-white"
                                >
                                    {{ estadoActualInfo.nombre }}
                                </Badge>
                                <Badge v-else>
                                    {{ solicitud.estado }}
                                </Badge>
                            </div>
                        </div>
                        <div>
                            <label class="text-sm font-medium text-gray-500">
                                Solicitante
                            </label>
                            <p class="text-lg">
                                {{ solicitud.solicitante?.nombres_apellidos || '-' }}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <!-- Sección de Firmantes (solo para ENVIADO_VALIDACION) -->
            <Card v-if="solicitud.estado === 'ENVIADO_VALIDACION'" class="border-0 shadow-md">
                <CardContent class="p-6">
                    <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Icon name="lucide:file-signature" class="h-5 w-5" />
                        Gestión de Firmantes para Firma Digital
                    </h2>
                    
                    <!-- Lista de Firmantes Actuales -->
                    <div v-if="firmantes.length > 0" class="mb-6">
                        <h3 class="text-sm font-medium text-gray-700 mb-3">
                            Firmantes Registrados ({{ firmantes.length }})
                        </h3>
                        <div class="space-y-2">
                            <div
                                v-for="(firmante, index) in firmantes"
                                :key="index"
                                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                            >
                                <div class="flex-1">
                                    <p class="font-medium text-gray-900">
                                        {{ firmante.nombre_completo }}
                                    </p>
                                    <div class="flex gap-4 text-sm text-gray-600 mt-1">
                                        <span>{{ firmante.tipo_documento || 'CC' }}: {{ firmante.numero_documento }}</span>
                                        <span>{{ firmante.email }}</span>
                                        <span v-if="firmante.rol" class="text-blue-600">{{ firmante.rol }}</span>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    @click="eliminarFirmante(index)"
                                    class="text-red-600 hover:text-red-700"
                                >
                                    <Icon name="lucide:trash-2" class="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    
                    <div v-else class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p class="text-sm text-yellow-800">
                            No hay firmantes registrados. Agregue al menos un firmante para poder iniciar el proceso de firma digital.
                        </p>
                    </div>
                    
                    <!-- Formulario para Agregar Nuevo Firmante -->
                    <div class="border-t pt-6">
                        <h3 class="text-sm font-medium text-gray-700 mb-3">
                            Agregar Nuevo Firmante
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre Completo *
                                </label>
                                <input
                                    v-model="nuevoFirmante.nombre_completo"
                                    type="text"
                                    class="input input-bordered w-full"
                                    placeholder="Nombre completo del firmante"
                                />
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    v-model="nuevoFirmante.email"
                                    type="email"
                                    class="input input-bordered w-full"
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de Documento
                                </label>
                                <select
                                    v-model="nuevoFirmante.tipo_documento"
                                    class="select select-bordered w-full"
                                >
                                    <option value="CC">Cédula de Ciudadanía</option>
                                    <option value="CE">Cédula de Extranjería</option>
                                    <option value="NIT">NIT</option>
                                    <option value="PAS">Pasaporte</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Número de Documento *
                                </label>
                                <input
                                    v-model="nuevoFirmante.numero_documento"
                                    type="text"
                                    class="input input-bordered w-full"
                                    placeholder="Número de documento"
                                />
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Rol
                                </label>
                                <select
                                    v-model="nuevoFirmante.rol"
                                    class="select select-bordered w-full"
                                >
                                    <option value="Solicitante">Solicitante</option>
                                    <option value="Codeudor">Codeudor</option>
                                    <option value="Empleador">Empleador</option>
                                    <option value="Firmante">Firmante</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Teléfono
                                </label>
                                <input
                                    v-model="nuevoFirmante.telefono"
                                    type="tel"
                                    class="input input-bordered w-full"
                                    placeholder="Teléfono (opcional)"
                                />
                            </div>
                        </div>
                        
                        <Button
                            type="button"
                            variant="outline"
                            class="mt-4 gap-2"
                            @click="handleAgregarFirmante"
                        >
                            <Icon name="lucide:user-plus" class="h-4 w-4" />
                            Agregar Firmante
                        </Button>
                    </div>
                    
                    <!-- Botón de Envío para Firma -->
                    <div class="border-t mt-6 pt-6">
                        <Button
                            type="button"
                            variant="default"
                            class="gap-2"
                            :disabled="loadingFirmado || firmantes.length === 0"
                            @click="handleIniciarFirmado"
                        >
                            <Icon
                                v-if="loadingFirmado"
                                name="lucide:loader-2"
                                class="h-4 w-4 animate-spin"
                            />
                            <Icon
                                v-else
                                name="lucide:send"
                                class="h-4 w-4"
                            />
                            {{ loadingFirmado ? 'Enviando...' : 'Enviar para Firma Digital' }}
                        </Button>
                        <p class="text-xs text-gray-500 mt-2">
                            Se enviará el documento a todos los firmantes registrados para su firma digital
                        </p>
                    </div>
                </CardContent>
            </Card>

            <!-- Formulario de Acción -->
            <Card class="border-0 shadow-md">
                <CardContent class="p-6">
                    <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Settings class="h-5 w-5" />
                        Cambiar Estado de la Solicitud
                    </h2>
                    
                    <form @submit.prevent="handleSubmit" class="space-y-6">
                        <!-- Selector de Estado -->
                        <div>
                            <label for="estado" class="block text-sm font-medium text-gray-700 mb-2">
                                Nuevo Estado *
                            </label>
                            <select
                                id="estado"
                                v-model="estadoSeleccionado"
                                class="select select-bordered w-full"
                                required
                            >
                                <option value="" disabled>Seleccione un estado</option>
                                <option
                                    v-for="estado in estados"
                                    :key="estado.id"
                                    :value="estado.id"
                                >
                                    {{ estado.nombre }} - {{ estado.descripcion }}
                                </option>
                            </select>
                            <p class="text-xs text-gray-500 mt-1">
                                Seleccione el nuevo estado para esta solicitud
                            </p>
                        </div>

                        <!-- Vista Previa del Estado -->
                        <div
                            v-if="estadoCambiado"
                            class="bg-blue-50 border border-blue-200 rounded-lg p-4"
                        >
                            <div class="flex items-start gap-3">
                                <Icon
                                    name="lucide:info"
                                    class="h-5 w-5 text-blue-600 mt-0.5"
                                />
                                <div>
                                    <h3 class="font-medium text-blue-900">
                                        Cambio de Estado
                                    </h3>
                                    <p class="text-sm text-blue-700 mt-1">
                                        La solicitud pasará de 
                                        <strong>{{ estadoActualInfo?.nombre || solicitud.estado }}</strong>
                                        a
                                        <strong>{{ getNombreEstado(estadoSeleccionado) }}</strong>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Notificación al Solicitante -->
                        <div>
                            <label for="notificacion" class="block text-sm font-medium text-gray-700 mb-2">
                                Mensaje de Notificación
                            </label>
                            <textarea
                                id="notificacion"
                                v-model="notificacion"
                                rows="4"
                                class="textarea textarea-bordered w-full"
                                placeholder="Escriba un mensaje que será enviado al solicitante sobre este cambio de estado..."
                            ></textarea>
                            <p class="text-xs text-gray-500 mt-1">
                                Este mensaje será incluido en la notificación al solicitante (opcional)
                            </p>
                        </div>

                        <!-- Advertencia -->
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div class="flex items-start gap-3">
                                <Icon
                                    name="lucide:alert-triangle"
                                    class="h-5 w-5 text-yellow-600 mt-0.5"
                                />
                                <div>
                                    <h3 class="font-medium text-yellow-900">
                                        Importante
                                    </h3>
                                    <p class="text-sm text-yellow-700 mt-1">
                                        El cambio de estado actualizará el timeline de la solicitud y 
                                        se registrará en el historial. Esta acción no se puede deshacer.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Botones de Acción -->
                        <div class="flex flex-wrap gap-3 pt-4">
                            <Button
                                type="submit"
                                variant="default"
                                :disabled="loadingAccion || !estadoCambiado"
                                class="gap-2"
                            >
                                <Icon
                                    v-if="loadingAccion"
                                    name="lucide:loader-2"
                                    class="h-4 w-4 animate-spin"
                                />
                                <Icon
                                    v-else
                                    name="lucide:save"
                                    class="h-4 w-4"
                                />
                                {{ loadingAccion ? 'Guardando...' : 'Registrar Acción' }}
                            </Button>
                            
                            <Button
                                type="button"
                                variant="outline"
                                @click="volverADetalle()"
                                :disabled="loadingAccion"
                            >
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <!-- Timeline Reciente -->
            <Card v-if="solicitud.timeline && solicitud.timeline.length > 0" class="border-0 shadow-md">
                <CardContent class="p-6">
                    <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
                        <History class="h-5 w-5" />
                        Historial Reciente
                    </h2>
                    <div class="space-y-3">
                        <div
                            v-for="(item, index) in solicitud.timeline.slice(0, 5)"
                            :key="index"
                            class="flex items-start gap-3 pb-3 border-b last:border-b-0"
                        >
                            <div class="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                            <div class="flex-1">
                                <p class="font-medium text-gray-900">{{ item.estado }}</p>
                                <p class="text-sm text-gray-600">{{ item.detalle }}</p>
                                <p class="text-xs text-gray-400 mt-1">
                                    {{ new Date(item.fecha).toLocaleString('es-CO') }}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    ChevronLeft,
    FileText,
    Settings,
    History,
} from 'lucide-vue-next';
import Button from '@/components/ui/Button.vue';
import Badge from '@/components/ui/Badge.vue';
import Card from '@/components/ui/Card.vue';
import CardContent from '@/components/ui/CardContent.vue';
import { useAccionesSolicitud } from '~/composables/admin/useAccionesSolicitud';

const {
    solicitud,
    solicitudId,
    estados,
    loading,
    loadingEstados,
    loadingAccion,
    loadingFirmado,
    error,
    estadoSeleccionado,
    notificacion,
    firmantes,
    nuevoFirmante,
    estadoActualInfo,
    estadoCambiado,
    cargarSolicitud,
    registrarAccion,
    getNombreEstado,
    volverADetalle,
    volverAListado,
    agregarFirmante,
    eliminarFirmante,
    iniciarProcesoDeFirmado,
} = useAccionesSolicitud();

const handleSubmit = async () => {
    const confirmacion = confirm(
        `¿Está seguro de cambiar el estado de la solicitud a "${getNombreEstado(estadoSeleccionado.value)}"?`
    );
    
    if (!confirmacion) return;
    
    const resultado = await registrarAccion();
    
    if (resultado.success) {
        alert(resultado.message || 'Estado actualizado exitosamente');
        volverADetalle();
    } else {
        alert(resultado.message || 'Error al actualizar el estado');
    }
};

const handleAgregarFirmante = () => {
    const resultado = agregarFirmante();
    if (resultado.success) {
        alert(resultado.message || 'Firmante agregado exitosamente');
    } else {
        alert(resultado.message || 'Error al agregar firmante');
    }
};

const handleIniciarFirmado = async () => {
    const confirmacion = confirm(
        `¿Está seguro de enviar el documento para firma digital a ${firmantes.value.length} firmante(s)?`
    );
    
    if (!confirmacion) return;
    
    const resultado = await iniciarProcesoDeFirmado();
    
    if (resultado.success) {
        alert(resultado.message || 'Documento enviado para firma digital exitosamente');
        volverADetalle();
    } else {
        alert(resultado.message || 'Error al iniciar el proceso de firmado');
    }
};

definePageMeta({
    layout: 'dashboard',
    middleware: ['auth'],
});
</script>
