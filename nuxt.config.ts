
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2026-01-05',
  // Deshabilitar SSR completamente
  ssr: false,

  // Configuración para modo SPA/móvil
  nitro: {
    prerender: {
      routes: ['/']
    },
    compatibilityDate: '2025-12-25'
  },

  // Configuración de alias
  alias: {
    '@': fileURLToPath(new URL('./app', import.meta.url)),
  },

  // Configuración de Vite para alias
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./app', import.meta.url)),
      }
    }
  },

  devtools: { enabled: true },
  css: ['@/assets/css/main.css'],
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {}
    }
  },
  runtimeConfig: {
    backendBaseUrl: process.env.NUXT_BACKEND_BASE_URL || 'http://127.0.0.1:5000',
    public: {
      backendBaseUrl: process.env.NUXT_BACKEND_BASE_URL || 'http://127.0.0.1:5000'
    }
  }
})