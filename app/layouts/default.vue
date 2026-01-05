<template>
  <div class="min-h-dvh bg-background text-foreground flex items-center justify-center p-4">
    <div class="w-full max-w-md space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold tracking-tight text-foreground">Comfaca Crédito</h2>
      </div>

      <div class="bg-card text-card-foreground rounded-xl border border-border shadow-sm p-6 sm:p-8">
        <slot />
      </div>

      <div class="text-center text-sm text-muted-foreground">
        <NuxtLink to="/" class="underline hover:text-primary transition-colors">Ir al inicio</NuxtLink>
      </div>
    </div>
  </div>
</template>
