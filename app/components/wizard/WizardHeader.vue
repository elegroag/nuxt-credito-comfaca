<template>
  <CardHeader class="border-b border-border p-4 sm:p-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="space-y-1">
        <div class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Paso {{ currentStep + 1 }} de {{ totalSteps }}
        </div>
        <CardTitle class="text-xl font-bold text-foreground">
          {{ title }}
        </CardTitle>
      </div>

      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="currentStep === 0"
          @click="$emit('prev')"
          type="button"
        >
          <ChevronLeft class="mr-2 h-4 w-4" />
          {{ prevText }}
        </Button>
        
        <Button
          v-if="currentStep < totalSteps - 1"
          size="sm"
          @click="$emit('next')"
          type="button"
        >
          {{ nextText }}
          <ChevronRight class="ml-2 h-4 w-4" />
        </Button>
        
        <template v-else>
          <Button
            size="sm"
            :disabled="primaryButtonDisabled"
            @click="$emit('primary-action')"
            type="button"
          >
            <Send class="mr-2 h-4 w-4" />
            {{ primaryButtonText }}
          </Button>
        </template>
      </div>
    </div>

    <div class="mt-6 flex flex-wrap gap-2">
      <button
        v-for="(step, index) in steps"
        :key="step.key"
        class="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all"
        :class="index === currentStep 
          ? 'bg-primary text-primary-foreground shadow-sm' 
          : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'"
        @click="$emit('step-change', index)"
        type="button"
      >
        {{ step.short }}
      </button>
    </div>
  </CardHeader>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight, FileCode, Send } from 'lucide-vue-next'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import Button from '@/components/ui/Button.vue'

// Definición de interfaces
interface Step {
  key: string
  title: string
  short: string
}

interface Props {
  currentStep: number
  totalSteps: number
  title: string
  steps: Step[]
  prevText?: string
  nextText?: string
  primaryButtonText?: string
  primaryButtonDisabled?: boolean
}

// Props con valores por defecto
const props = withDefaults(defineProps<Props>(), {
  prevText: 'Atrás',
  nextText: 'Siguiente',
  primaryButtonText: 'Enviar',
  primaryButtonDisabled: false,
})

// Emits
interface Emits {
  (e: 'prev'): void
  (e: 'next'): void
  (e: 'step-change', index: number): void
  (e: 'primary-action'): void
}

defineEmits<Emits>()
</script>
