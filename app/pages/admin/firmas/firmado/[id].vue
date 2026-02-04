<template>
    <div class="container mx-auto py-8 px-4 max-w-4xl">
        <!-- Header -->
        <div class="mb-6">
            <div class="flex items-center gap-4 mb-4">
                <Button variant="outline" @click="volver" class="shrink-0">
                    <ChevronLeft class="h-4 w-4 mr-2" />
                    Volver
                </Button>
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">
                        Firma Digital de Solicitud
                    </h1>
                    <p class="text-sm text-gray-500">
                        Gestión de firmantes para la solicitud {{ solicitud?.numero_solicitud }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div
            v-if="loading"
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

        <!-- Contenido Principal -->
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
                                Solicitante
                            </label>
                            <p class="text-lg">
                                {{ solicitud.solicitante?.nombres_apellidos || '-' }}
                            </p>
                        </div>
                        <div>
                            <label class="text-sm font-medium text-gray-500">
                                Estado
                            </label>
                            <p class="text-lg">
                                {{ solicitud.estado }}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <!-- Gestión de Firmantes -->
            <Card class="border-0 shadow-md bg-white">
                <CardContent class="p-6">
                    <GestionFirmantes
                        :solicitudId="solicitud.numero_solicitud"
                        :firmantes="firmantes"
                    />
                </CardContent>
            </Card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from '#imports';
import { useRoute, useRouter } from 'vue-router';
import { ChevronLeft, FileText } from 'lucide-vue-next';
import Button from '@/components/ui/Button.vue';
import Card from '@/components/ui/Card.vue';
import CardContent from '@/components/ui/CardContent.vue';
import GestionFirmantes from '@/components/admin/GestionFirmantes.vue';
import { useApi } from '~/composables/useApi';
import { useSession } from '~/composables/useSession';
import type { SolicitudCredito, Firmante } from '~/shared/types/solicitud-credito';

const route = useRoute();
const router = useRouter();
const { getJson } = useApi();
const { ready } = useSession();

// Estado
const solicitud = ref<SolicitudCredito | null>(null);
const firmantes = ref<Firmante[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Obtener ID de la solicitud desde los parámetros
const solicitudId = computed(() => route.params.id as string);

// Cargar datos de la solicitud
const cargarSolicitud = async () => {
    loading.value = true;
    error.value = null;
    
    try {
        await ready;
        const response = await getJson<{
            success: boolean;
            data: SolicitudCredito;
        }>(`/api/solicitudes-credito/${solicitudId.value}`, { auth: true });

        if (response.success) {
            solicitud.value = response.data;
            
            // Inicializar firmantes
            if (response.data.firmantes && Array.isArray(response.data.firmantes)) {
                firmantes.value = [...response.data.firmantes];
            } else {
                firmantes.value = [];
            }
        } else {
            throw new Error('No se pudo cargar la solicitud');
        }
    } catch (e: any) {
        console.error('Error al cargar solicitud:', e);
        error.value = e.message || 'No se pudo cargar la información de la solicitud.';
    } finally {
        loading.value = false;
    }
};

// Volver a la página anterior
const volver = () => {
    router.go(-1);
};

// Cargar datos al montar el componente
onMounted(() => {
    cargarSolicitud();
});

definePageMeta({
    layout: 'dashboard',
    middleware: ['auth']
});
</script>

<style scoped></style>