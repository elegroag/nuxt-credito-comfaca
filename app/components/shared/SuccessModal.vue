<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-background/80 backdrop-blur-sm" @click="$emit('close')" />
      <Card class="relative w-full max-w-md shadow-2xl border-primary/20 animate-in zoom-in-95 duration-200" @click.stop>
        <CardHeader class="text-center pb-2">
          <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20 text-secondary">
            <CheckCircle2 class="h-6 w-6" />
          </div>
          <CardTitle class="text-xl font-bold text-foreground">Solicitud creada con éxito</CardTitle>
          <CardDescription>
            Tu solicitud fue enviada y quedó en estado
            <span class="font-bold text-secondary-foreground bg-secondary/30 px-1.5 py-0.5 rounded">Postulado</span>.
          </CardDescription>
        </CardHeader>
        
        <CardContent class="space-y-4">
          <div v-if="solicitudId" class="rounded-lg bg-muted p-3 space-y-1">
            <div class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">ID de Solicitud</div>
            <div class="font-mono text-sm break-all text-foreground">{{ solicitudId }}</div>
          </div>
          
          <div v-if="filename" class="rounded-lg bg-muted p-3 space-y-1">
            <div class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Archivo XML</div>
            <div class="text-sm text-foreground break-all">{{ filename }}</div>
          </div>

          <div class="grid grid-cols-1 gap-2 pt-2">
            <Button
              variant="secondary"
              class="w-full"
              @click="$emit('viewSolicitudes')"
            >
              <ClipboardList class="mr-2 h-4 w-4" />
              Ver mis solicitudes
            </Button>
            
            <Button
              v-if="filename"
              class="w-full bg-primary hover:bg-primary/90"
              @click="$emit('goToFirmas')"
            >
              <PenTool class="mr-2 h-4 w-4" />
              Firmar ahora
            </Button>
            
            <Button
              variant="ghost"
              class="w-full text-muted-foreground hover:text-foreground"
              @click="$emit('close')"
            >
              Cerrar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { CheckCircle2, ClipboardList, PenTool } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'

interface Props {
  isOpen: boolean
  solicitudId?: string
  filename?: string
}

defineProps<Props>()

defineEmits<{
  close: []
  viewSolicitudes: []
  goToFirmas: []
}>()
</script>
