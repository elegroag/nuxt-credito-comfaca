<template>
    <div class="relative">
        <button
            @click="toggleDropdown"
            class="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            :aria-label="`Notificaciones${hasUnread ? ` (${unreadCount} no leídas)` : ''}`"
        >
            <Icon name="lucide:bell" class="h-6 w-6" />
            
            <!-- Badge de contador -->
            <span
                v-if="hasUnread"
                class="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse"
            >
                {{ unreadCount > 99 ? '99+' : unreadCount }}
            </span>
        </button>

        <!-- Dropdown de notificaciones -->
        <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
        >
            <div
                v-if="isOpen"
                class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                @click.stop
            >
                <NotificationDropdown
                    :notifications="notifications"
                    :loading="loading"
                    :unread-count="unreadCount"
                    @mark-as-read="handleMarkAsRead"
                    @mark-all-read="handleMarkAllRead"
                    @delete="handleDelete"
                    @view-all="handleViewAll"
                    @close="closeDropdown"
                />
            </div>
        </Transition>

        <!-- Overlay para cerrar al hacer click fuera -->
        <div
            v-if="isOpen"
            class="fixed inset-0 z-40"
            @click="closeDropdown"
        ></div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotifications } from '~/composables/useNotifications';
import NotificationDropdown from './NotificationDropdown.vue';

const router = useRouter();
const isOpen = ref(false);

const {
    notifications,
    unreadCount,
    loading,
    hasUnread,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    startPolling,
    stopPolling,
    updateUnreadCount
} = useNotifications();

const toggleDropdown = async () => {
    isOpen.value = !isOpen.value;
    
    if (isOpen.value) {
        await loadNotifications(false, 10);
    }
};

const closeDropdown = () => {
    isOpen.value = false;
};

const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
};

const handleMarkAllRead = async () => {
    await markAllAsRead();
    await loadNotifications(false, 10);
};

const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId);
};

const handleViewAll = () => {
    closeDropdown();
    router.push('/notifications');
};

onMounted(() => {
    updateUnreadCount();
    startPolling();
});

onUnmounted(() => {
    stopPolling();
});
</script>
