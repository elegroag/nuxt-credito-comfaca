<template>

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
</template>

<script setup lang="ts">
import { ref, watch } from '#imports';
import type { Firmante } from '~/shared/types/solicitud-credito';
import { useApi } from '~/composables/useApi';
import { useSession } from '~/composables/useSession';
import Button from '../ui/Button.vue';

interface Props {
    solicitudId: string;
    firmantes: Firmante[];
}

interface Emits {
    (e: 'agregar-firmante'): void;
    (e: 'eliminar-firmante', index: number): void;
    (e: 'iniciar-firmado'): void;
}

const props = defineProps<Props>();
const solicitudId = props.solicitudId;

const { postJson } = useApi();
const { ready } = useSession();

// Convertir props.firmantes a una referencia reactiva local
const firmantes = ref<Firmante[]>([...props.firmantes]);

// Watch para sincronizar cambios con el padre
watch(() => props.firmantes, (newFirmantes) => {
    firmantes.value = [...newFirmantes];
}, { deep: true });

// Gestión de firmantes
const loadingFirmado = ref(false);
const nuevoFirmante = ref<Firmante>({
    nombre_completo: '',
    email: '',
    numero_documento: '',
    tipo_documento: 'CC',
    rol: 'Firmante',
    telefono: ''
});


const handleAgregarFirmante = () => {
    const resultado = agregarFirmante();
    if (resultado.success) {
        alert(resultado.message || 'Firmante agregado exitosamente');
    } else {
        alert(resultado.message || 'Error al agregar firmante');
    }
};

const eliminarFirmante = (index: number) => {
    firmantes.value.splice(index, 1);
};


    // Gestión de firmantes
const agregarFirmante = () => {
    if (!nuevoFirmante.value.nombre_completo ||
        !nuevoFirmante.value.email ||
        !nuevoFirmante.value.numero_documento) {
        return {
            success: false,
            message: 'Debe completar todos los campos requeridos del firmante'
        };
    }

    firmantes.value.push({ ...nuevoFirmante.value });

    // Resetear formulario
    nuevoFirmante.value = {
        nombre_completo: '',
        email: '',
        numero_documento: '',
        tipo_documento: 'CC',
        rol: 'Firmante',
        telefono: ''
    };

    return { success: true, message: 'Firmante agregado exitosamente' };
};

// Iniciar proceso de firmado
const iniciarProcesoDeFirmado = async () => {
    if (firmantes.value.length === 0) {
        return {
            success: false,
            message: 'Debe tener al menos un firmante para iniciar el proceso'
        };
    }

    loadingFirmado.value = true;
    try {
        await ready;

        const response = await postJson<{
            success: boolean;
            message: string;
            data?: any;
        }>(`/api/solicitudes/${solicitudId}/iniciar-firmado`, {}, { auth: true });

        if (response.success) {
           
            return {
                success: true,
                message: response.message || 'Documento enviado para firma digital exitosamente'
            };
        } else {
            throw new Error(response.message || 'Error al iniciar proceso de firmado');
        }
    } catch (e: any) {
        console.error('Error al iniciar proceso de firmado:', e);
        return {
            success: false,
            message: e.message || 'Error al iniciar el proceso de firmado'
        };
    } finally {
        loadingFirmado.value = false;
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
    } else {
        alert(resultado.message || 'Error al iniciar el proceso de firmado');
    }
};
</script>
