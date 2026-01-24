<template>
    <div class="bg-gradient-to-r from-sky-400 to-blue-500 dark:from-sky-600 dark:to-blue-700 rounded-2xl shadow-lg p-6 mb-6">
        <div class="flex items-center gap-4 mb-4">
            <Button 
                variant="outline" 
                @click="router.back()" 
                class="shrink-0 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
                <ChevronLeft class="h-4 w-4 mr-2" />
                Volver
            </Button>
        </div>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 class="text-3xl font-bold text-white mb-2">
                    {{ numeroSolicitud }}
                </h1>
                <p class="text-blue-100">
                    Información completa de la solicitud de crédito
                </p>
            </div>
            <div class="flex items-center gap-3">
                <Badge :class="badgeClass" class="text-sm px-4 py-2">
                    {{ estadoNombre }}
                </Badge>
                <Progress
                    :model-value="progress"
                    class="w-32 h-2 bg-white/20"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ChevronLeft } from 'lucide-vue-next';
import Button from '@/components/ui/Button.vue';
import Badge from '@/components/ui/Badge.vue';
import Progress from '@/components/ui/Progress.vue';

interface Props {
    numeroSolicitud: string;
    estadoNombre: string;
    badgeClass: string;
    progress: number;
}

const props = defineProps<Props>();
const router = useRouter();
</script>
