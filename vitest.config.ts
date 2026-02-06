import { defineVitestConfig } from '@nuxt/test-utils/config';
import { fileURLToPath } from 'node:url';

export default defineVitestConfig({
    test: {
        environment: 'happy-dom',
        globals: true,
        setupFiles: ['./tests/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'tests/',
                '*.config.ts',
                '**/*.d.ts',
                'app/plugins/',
                '.nuxt/'
            ]
        },
        include: ['tests/**/*.{test,spec}.{js,ts}']
    },
    resolve: {
        alias: {
            '~': fileURLToPath(new URL('./app', import.meta.url)),
            '@': fileURLToPath(new URL('./app', import.meta.url)),
            '#imports': fileURLToPath(new URL('./.nuxt/imports.d.ts', import.meta.url))
        }
    }
});
