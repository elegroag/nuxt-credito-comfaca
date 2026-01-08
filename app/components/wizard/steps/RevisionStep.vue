<template>
  <div class="grid gap-6">
    <Card class="border-border/50 bg-muted/10 shadow-none">
      <CardHeader class="py-3">
        <CardTitle class="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <FileCode class="h-4 w-4" />
          Payload (JSON)
        </CardTitle>
      </CardHeader>
      <CardContent class="pb-4">
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
import { FileCode, Download, CheckCircle2, AlertCircle } from 'lucide-vue-next'
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

defineProps<Props>()
</script>
