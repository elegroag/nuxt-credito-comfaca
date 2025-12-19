<template>
  <div class="min-h-dvh bg-zinc-50 text-zinc-900">
    <div class="mx-auto flex min-h-dvh max-w-md items-center px-4 py-10">
      <div class="w-full">
        <div class="mb-6 text-center">
          <div class="text-xl font-semibold">Comfaca Crédito</div>
          <div class="mt-1 text-sm text-zinc-600">Acceso y registro</div>
        </div>

        <div class="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <slot />
        </div>

        <div class="mt-4 text-center text-xs text-zinc-500">
          <NuxtLink to="/" class="underline">Ir al inicio</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
