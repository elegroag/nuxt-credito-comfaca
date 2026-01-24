<template>
    <Card class="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-800">
        <CardHeader class="pb-4">
            <CardTitle class="flex items-center gap-3 text-lg">
                <div :class="cn('p-2 rounded-lg', iconBgClass)">
                    <slot name="icon" />
                </div>
                <span class="font-semibold">{{ title }}</span>
            </CardTitle>
        </CardHeader>
        <CardContent class="pt-0">
            <slot />
        </CardContent>
    </Card>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card.vue';
import CardHeader from '@/components/ui/CardHeader.vue';
import CardTitle from '@/components/ui/CardTitle.vue';
import CardContent from '@/components/ui/CardContent.vue';

interface Props {
    title: string;
    iconBgClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
    iconBgClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
});
</script>
