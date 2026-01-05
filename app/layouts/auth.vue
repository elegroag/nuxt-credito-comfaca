<template>
  <div class="min-h-dvh bg-background text-foreground flex items-center justify-center p-4">
    <div :class="['w-full max-w-md space-y-8', $route.path.includes('registro') ? 'max-w-4xl' : '']">
      <div class="text-center">
        <h2 class="text-3xl font-bold tracking-tight text-foreground">Comfaca Crédito</h2>
        <p class="mt-2 text-sm text-muted-foreground">Acceso y registro al sistema</p>
      </div>

      <div class="bg-card text-card-foreground rounded-xl border border-border shadow-sm p-6 sm:p-8">
        <slot />
      </div>
    </div>
  </div>
</template>
