import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSession } from '~/composables/useSession'
import type { NavItem } from '~/shared/types/layout'
import {
    Home,
    Calculator,
    FilePlus,
    FileText,
    FileCode,
    PenTool,
    Share2,
    Key,
    User
} from 'lucide-vue-next'

// Estado compartido (singleton)
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const userMenuOpen = ref(false)

export function useDashboardLayout() {
    const { session, clearSession } = useSession()
    const route = useRoute()
    const router = useRouter()

    const _abbr = (label: string): string => {
        const parts = label
            .split(' ')
            .map((s) => s.trim())
            .filter(Boolean)

        const abbr = parts
            .slice(0, 2)
            .map((p) => p[0] || '')
            .join('')
            .toUpperCase()

        return abbr || (label.trim()[0] || '').toUpperCase() || '·'
    }

    const navItems: NavItem[] = [
        { label: 'Inicio', to: '/', abbr: _abbr('Inicio'), icon: Home },
        { label: 'Simulador', to: '/simulador', abbr: _abbr('Simulador'), icon: Calculator },
        { label: 'Solicitud', to: '/solicitud', abbr: _abbr('Solicitud'), icon: FilePlus },
        { label: 'Documentos', to: '/documentos', abbr: _abbr('Documentos'), icon: FileText },
        { label: 'Extraer XML', to: '/xml-extract', abbr: _abbr('Extraer XML'), icon: FileCode },
        { label: 'Firmas', to: '/firmas', abbr: _abbr('Firmas'), icon: PenTool },
        { label: 'Compartir firmas', to: '/firmas-compartir', abbr: _abbr('Compartir firmas'), icon: Share2 },
        { label: 'Entidad digital', to: '/entidad-digital', abbr: _abbr('Entidad digital'), icon: Key },
        { label: 'Perfil', to: '/perfil', abbr: _abbr('Perfil'), icon: User }
    ]

    const isActive = (to: string) => {
        if (to === '/') return route.path === '/'
        return route.path.startsWith(to)
    }

    const sectionTitle = computed(() => {
        const hit = navItems.find((x) => isActive(x.to))
        return hit?.label || 'Dashboard'
    })

    const logout = async () => {
        userMenuOpen.value = false
        clearSession()
        await router.push('/login')
    }

    return {
        session,
        sidebarOpen,
        sidebarCollapsed,
        userMenuOpen,
        navItems,
        sectionTitle,
        isActive,
        logout,
        _abbr
    }
}
