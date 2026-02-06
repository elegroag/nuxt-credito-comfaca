import { vi } from 'vitest';

// Mock de useRouter de Vue Router
vi.mock('vue-router', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        go: vi.fn(),
        back: vi.fn(),
        forward: vi.fn()
    }),
    useRoute: () => ({
        params: {},
        query: {},
        path: '/'
    })
}));

// Mock de composables de Nuxt
vi.mock('#imports', () => ({
    useRuntimeConfig: () => ({
        public: {
            backendBaseUrl: 'http://localhost:8000'
        }
    }),
    useState: (key: string, init?: () => any) => {
        const state = init ? init() : null;
        return {
            value: state
        };
    },
    navigateTo: vi.fn()
}));

// Mock global de fetch
global.fetch = vi.fn();
