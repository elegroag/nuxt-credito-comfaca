import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSession } from '~/composables/useSession'
import { usePermissions } from '~/composables/usePermissions'
import type { NavItem } from '~/shared/types/layout'
import {
    Home,
    Calculator,
    FilePlus,
    Share2,
    User,
    Users,
    List,
    Building,
    Bell
} from 'lucide-vue-next'

// Estado compartido (singleton)
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const userMenuOpen = ref(false)

export function useDashboardLayout() {
    const { session, clearSession } = useSession()
    const { hasPermission, isAdministrator, userRoles } = usePermissions()
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
        { label: 'Inicio', to: '/inicio', abbr: _abbr('Inicio'), icon: Home },
        { label: 'Simulador', to: '/simulador/lineas-credito', abbr: _abbr('Simulador'), icon: Calculator },
        { label: 'Solicitud', to: '/solicitud', abbr: _abbr('Solicitud'), icon: FilePlus, category: 'user' },
        { label: 'Notificaciones', to: '/notify', abbr: _abbr('Notificaciones'), icon: Bell },
        { label: 'Gestión firmas', to: '/admin/firmas', abbr: _abbr('Gestión firmas'), icon: Share2, requiredPermissions: ['firmas.view'], category: 'admin' },
        { label: 'Solicitudes', to: '/admin/solicitudes', abbr: _abbr('Solicitudes'), icon: List, requiredPermissions: ['solicitudes.view'], category: 'admin' },
        { label: 'Usuarios', to: '/admin/users', abbr: _abbr('Usuarios'), icon: Users, adminOnly: true, category: 'admin' },
        { label: 'Convenios', to: '/admin/convenios', abbr: _abbr('Convenios'), icon: Building, requiredPermissions: ['convenios.view'], excludedRoles: ['user_trabajador'], category: 'admin' },
        { label: 'Perfil', to: '/perfil', abbr: _abbr('Perfil'), icon: User }
    ]

    const isActive = (to: string) => {
        if (to === '/inicio') return route.path === '/inicio' || route.path === '/' || route.path === '/index' || route.name === 'index'
        return route.path.startsWith(to)
    }

    // Filtrar items de navegación según los permisos del usuario
    const filteredNavItems = computed(() => {
        return navItems.filter(item => {
            // Si el item es solo para administrator y el usuario no es administrator, ocultarlo
            if (item.adminOnly && !isAdministrator.value) {
                return false
            }

            // Si el item requiere permisos específicos, verificarlos
            if (item.requiredPermissions && item.requiredPermissions.length > 0) {
                const hasAllPermissions = item.requiredPermissions.every(permission =>
                    hasPermission(permission)
                )
                if (!hasAllPermissions) {
                    return false
                }
            }

            // Si el item tiene roles excluidos, verificar que el usuario no tenga esos roles
            if (item.excludedRoles && item.excludedRoles.length > 0) {
                const hasExcludedRole = item.excludedRoles.some(role =>
                    userRoles.value.includes(role)
                )
                if (hasExcludedRole) {
                    return false
                }
            }

            // Si no hay restricciones, mostrar el item
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
        return hit?.label || 'Inicio'
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
