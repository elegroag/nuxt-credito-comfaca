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
    User,
    Users,
    List
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
        { label: 'Simulador', to: '/simulador/lineas-credito', abbr: _abbr('Simulador'), icon: Calculator },
        { label: 'Solicitud', to: '/solicitud', abbr: _abbr('Solicitud'), icon: FilePlus },
        { label: 'Documentos', to: '/documentos', abbr: _abbr('Documentos'), icon: FileText },
        { label: 'Extraer XML', to: '/xml-extract', abbr: _abbr('Extraer XML'), icon: FileCode },
        { label: 'Firmas', to: '/firmas', abbr: _abbr('Firmas'), icon: PenTool },
        { label: 'Compartir firmas', to: '/firmas-compartir', abbr: _abbr('Compartir firmas'), icon: Share2 },
        { label: 'Entidad digital', to: '/entidad-digital', abbr: _abbr('Entidad digital'), icon: Key },
        { label: 'Solicitudes', to: '/admin/solicitudes', abbr: _abbr('Solicitudes'), icon: List, adminOnly: true, category: 'admin' },
        { label: 'Usuarios', to: '/admin/users', abbr: _abbr('Usuarios'), icon: Users, adminOnly: true, category: 'admin' },
        { label: 'Perfil', to: '/perfil', abbr: _abbr('Perfil'), icon: User }
    ]

    const isActive = (to: string) => {
        if (to === '/') return route.path === '/'
        return route.path.startsWith(to)
    }

    // Filtrar items de navegación según el rol del usuario
    const filteredNavItems = computed(() => {
        const userRoles = session.value?.user?.roles || []
        const isAdmin = userRoles.includes('admin') || userRoles.includes('administrator')

        return navItems.filter(item => {
            // Si el item es solo para admin y el usuario no es admin, ocultarlo
            if (item.adminOnly && !isAdmin) {
                return false
            }
            return true
        })
    })

    // Agrupar items por categoría para mostrar separadores
    const groupedNavItems = computed(() => {
        const items = filteredNavItems.value
        const grouped: { [key: string]: NavItem[] } = {
            user: [],
            admin: []
        }

        items.forEach(item => {
            const category = item.category || 'user'
            if (!grouped[category]) {
                grouped[category] = []
            }
            grouped[category].push(item)
        })

        return grouped
    })

    const sectionTitle = computed(() => {
        const hit = filteredNavItems.value.find((x) => isActive(x.to))
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
        navItems: filteredNavItems,
        groupedNavItems,
        sectionTitle,
        isActive,
        logout,
        _abbr
    }
}
