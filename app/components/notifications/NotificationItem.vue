<template>
    <div
        :class="[
            'flex items-start gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer',
            !notification.read_at ? 'bg-blue-50' : ''
        ]"
        @click="handleClick"
    >
        <!-- Icono -->
        <div :class="['shrink-0 p-2 rounded-full', getBackgroundColor()]">
            <Icon
                :name="getNotificationIcon(notification.type)"
                :class="['h-5 w-5', getNotificationColor(notification.type)]"
            />
        </div>

        <!-- Contenido -->
        <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
                <div class="flex-1">
                    <h4 class="text-sm font-semibold text-gray-900 mb-1">
                        {{ notification.data.titulo }}
                    </h4>
                    <p class="text-sm text-gray-600 line-clamp-2">
                        {{ notification.data.mensaje }}
                    </p>
                </div>
                
                <!-- Indicador de no leída -->
                <div v-if="!notification.read_at" class="shrink-0">
                    <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
            </div>

            <!-- Metadata -->
            <div class="flex items-center justify-between mt-2">
                <span class="text-xs text-gray-500">
                    {{ formatRelativeTime(notification.created_at) }}
                </span>

                <!-- Acciones -->
                <div class="flex items-center gap-1">
                    <button
                        v-if="!notification.read_at"
                        @click.stop="$emit('mark-as-read', notification.id)"
                        class="p-1 text-gray-400 hover:text-blue-600 rounded"
                        title="Marcar como leída"
                    >
                        <Icon name="lucide:check" class="h-4 w-4" />
                    </button>
                    <button
                        @click.stop="handleDelete"
                        class="p-1 text-gray-400 hover:text-red-600 rounded"
                        title="Eliminar"
                    >
                        <Icon name="lucide:trash-2" class="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useNotifications } from '~/composables/useNotifications';

interface Notification {
    id: string;
    type: string;
    data: {
        titulo: string;
        mensaje: string;
        url?: string;
        [key: string]: any;
    };
    read_at: string | null;
    created_at: string;
}

interface Props {
    notification: Notification;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'mark-as-read': [notificationId: string];
    'delete': [notificationId: string];
}>();

const router = useRouter();
const { formatRelativeTime, getNotificationIcon, getNotificationColor } = useNotifications();

const handleClick = () => {
    // Marcar como leída si no lo está
    if (!props.notification.read_at) {
        emit('mark-as-read', props.notification.id);
    }

    // Navegar a la URL si existe
    if (props.notification.data.url) {
        router.push(props.notification.data.url);
    }
};

const handleDelete = () => {
    if (confirm('¿Estás seguro de que deseas eliminar esta notificación?')) {
        emit('delete', props.notification.id);
    }
};

const getBackgroundColor = (): string => {
    if (!props.notification.read_at) {
        return 'bg-blue-100';
    }
    return 'bg-gray-100';
};
</script>
