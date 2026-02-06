<template>
    <div class="flex flex-col max-h-[600px]">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Notificaciones</h3>
            <div class="flex items-center gap-2">
                <button
                    v-if="unreadCount > 0"
                    @click="$emit('mark-all-read')"
                    class="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                    Marcar todas como leídas
                </button>
                <button
                    @click="$emit('close')"
                    class="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                    <Icon name="lucide:x" class="h-5 w-5" />
                </button>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
            <Icon name="lucide:loader-2" class="h-8 w-8 animate-spin text-blue-600" />
        </div>

        <!-- Empty State -->
        <div v-else-if="notifications.length === 0" class="flex flex-col items-center justify-center py-12 px-4">
            <Icon name="lucide:inbox" class="h-16 w-16 text-gray-300 mb-3" />
            <p class="text-gray-500 text-center">No tienes notificaciones</p>
        </div>

        <!-- Lista de Notificaciones -->
        <div v-else class="overflow-y-auto">
            <NotificationItem
                v-for="notification in notifications"
                :key="notification.id"
                :notification="notification"
                @mark-as-read="$emit('mark-as-read', $event)"
                @delete="$emit('delete', $event)"
            />
        </div>

        <!-- Footer -->
        <div class="p-3 border-t border-gray-200 bg-gray-50">
            <button
                @click="$emit('view-all')"
                class="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2"
            >
                Ver todas las notificaciones
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Notification {
    id: string;
    type: string;
    data: {
        titulo: string;
        mensaje: string;
        [key: string]: any;
    };
    read_at: string | null;
    created_at: string;
}

interface Props {
    notifications: Notification[];
    loading: boolean;
    unreadCount: number;
}

defineProps<Props>();

defineEmits<{
    'mark-as-read': [notificationId: string];
    'mark-all-read': [];
    'delete': [notificationId: string];
    'view-all': [];
    'close': [];
}>();
</script>
