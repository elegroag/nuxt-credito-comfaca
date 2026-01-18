# Agent Guidelines

## Development Commands

```bash
pnpm dev           # Start development server
pnpm build         # Build for production
pnpm preview       # Preview production build
pnpm dev:tools     # Run development tools

# Note: No test framework configured yet - add tests when implementing features
```

## Code Style

### Imports
- Use `#imports` for Nuxt auto-imports (composables, utilities)
- Use `~/` for app directory imports (e.g., `~/composables/useApi`)
- Use `@/` for app directory (same as `~/`, both work)
- Separate third-party imports from local imports

```ts
// ✅ Good
import { ref, computed } from '#imports'
import { useApi } from '~/composables/useApi'
import type { SessionData } from '~/shared/types/session'

// ❌ Bad
import {ref} from '#imports';
import {useApi} from '~/composables/useApi';
```

### Formatting
- 4-space indentation
- Use semicolons
- Space after braces in functions/blocks
- Use single quotes for strings, double quotes allowed in HTML attributes

### TypeScript
- Strict typing required
- Use `interface` for object shapes
- Use `type` for unions, primitives, or computed types
- Use generics for API responses: `postJson<T>(path, body)`
- Explicit type checking: `typeof x === 'string'`, `Array.isArray(x)`

### Naming Conventions
- **Components**: PascalCase (`Button.vue`, `FormField.vue`)
- **Composables**: camelCase with `use` prefix (`useLogin`, `useApi`)
- **Pages**: kebab-case for routes, PascalCase for dynamic segments `[id].vue`
- **Types**: PascalCase interfaces (`LoginData`, `SessionUser`)
- **Constants**: UPPER_SNAKE_CASE (`STORAGE_KEY_V1`, `VALIDATION_TTL`)
- **Utilities**: camelCase (`formatCurrency`, `cn`)
- **Vue props**: camelCase in script, kebab-case in template

### Vue Components
- Always use `<script setup lang="ts">`
- Define props with TypeScript:
  ```ts
  interface Props { variant?: string; size?: string }
  const props = withDefaults(defineProps<Props>(), { variant: 'default' })
  ```
- Use slots for flexible content
- Use `$attrs` for attribute forwarding
- Leverage `definePageMeta()` for page configuration

### Composables Pattern
- Return reactive refs and functions
- Use Nuxt's `useState` for shared state across SSR/client
- Use `ref` for local component state
- Initialize with computed where appropriate
- Export named functions: `export function useLogin()`

### API Calls
- Use `useApi` composable for all backend communication
- Methods: `getJson`, `postJson`, `putJson`, `deleteJson`
- Pass `{ auth: true }` for authenticated requests
- Use generics: `await postJson<UserResponse>(path, body)`
- Handle errors with try-catch, provide user-friendly messages

### Error Handling
- Always validate external data: `typeof data?.field === 'string' ? data.field : ''`
- Use try-catch with meaningful error messages
- Provide fallback values for optional fields
- Type-check API responses before assignment

### Styling
- Use TailwindCSS utility classes
- Use DaisyUI components where appropriate
- Use `cn()` utility for merging class names
- CSS variables for theme colors in main.css
- Support both light and dark themes

### Directory Structure
```
app/
├── components/       # Vue components (organized by feature)
│   ├── ui/           # Base UI components (Button, Input, etc.)
│   ├── dashboard/    # Dashboard-specific components
│   └── shared/       # Shared/reusable components
├── composables/      # Vue composables (organized by feature)
├── layouts/          # Nuxt layouts
├── pages/            # File-based routing
├── plugins/          # Nuxt plugins
├── lib/              # Utility functions
├── shared/           # Shared resources
│   ├── types/        # TypeScript definitions
│   └── formatters/   # Data formatting functions
└── config/           # Configuration files
```

### Environment Configuration
- Backend URL via `NUXT_BACKEND_BASE_URL` env variable
- Access via `useRuntimeConfig().public.backendBaseUrl`
- No SSR mode: `ssr: false` in nuxt.config.ts

### File Organization
- Keep composables focused and single-purpose
- Group related files in feature directories
- Use `index.ts` for barrel exports
- Types in `shared/types/` organized by domain

### State Management
- Use `useState` for shared state that needs SSR/hydration
- Use `ref` for local component state
- Use `computed` for derived values
- Session managed via `useSession` composable

### Best Practices
- Validate all API responses before use
- Use TypeScript's type system to catch errors at compile time
- Prefer composables over mixins or provide/inject
- Keep components small and focused (<150 lines)
- Extract reusable logic into composables
- Use environment variables for configuration
- Handle loading states explicitly with `ref(false)`
