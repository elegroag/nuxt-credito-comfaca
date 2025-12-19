import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {}
    }
  },
  runtimeConfig: {
    backendBaseUrl: process.env.NUXT_BACKEND_BASE_URL || 'http://127.0.0.1:5000'
  }
})
