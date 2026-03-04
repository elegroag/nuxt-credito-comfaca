<template>
  <div class="min-h-[calc(100vh-4rem)]">
    <div class="mx-auto max-w-7xl p-4 sm:p-8">
      <!-- Vista para Administradores -->
      <div v-if="isAdministrator || isAdviser">
        <!-- Header -->
        <div class="mb-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0">
              <h1 class="text-2xl font-semibold tracking-tight text-foreground">Dashboard Administrativo</h1>
              <p class="mt-1 text-sm text-muted-foreground">
                Bienvenido, {{ session.user?.username || 'Administrador' }}
              </p>
              <p class="mt-3 text-sm text-muted-foreground">
                {{ tiempoSinActualizar || 'Cargando...' }}
              </p>
            </div>

            <div class="flex shrink-0 flex-wrap items-center gap-2">
              <Button @click="refrescarEstadisticas" :disabled="loading" variant="outline"
                class="border-sky-200 bg-white/80 text-slate-700 shadow-sm hover:bg-sky-50 hover:border-sky-300">
                <ArrowPathIcon :class="['h-5 w-5 mr-2', loading && 'animate-spin']" />
                Actualizar
              </Button>
              <Button @click="router.push('/admin/solicitudes')"
                class="bg-linear-to-r from-violet-500 to-sky-500 text-white shadow-sm hover:from-violet-600 hover:to-sky-600">
                <Cog6ToothIcon class="h-5 w-5 mr-2" />
                Administración
              </Button>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 p-4 mb-6">
          <div class="flex items-center gap-2 text-red-800">
            <ExclamationTriangleIcon class="h-5 w-5" />
            <p class="font-medium">{{ error }}</p>
            <Button variant="outline" size="sm" @click="refrescarEstadisticas"
              class="ml-auto border-red-200 bg-white/80 text-red-800 shadow-sm hover:bg-red-50 hover:border-red-300">
              Reintentar
            </Button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading && !tieneDatos" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="i in 6" :key="i" class="rounded-lg border border-border bg-card p-6">
              <div class="space-y-3">
                <div class="h-4 bg-muted rounded animate-pulse" />
                <div class="h-8 bg-muted rounded animate-pulse" />
                <div class="h-3 bg-muted rounded w-3/4 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <!-- Dashboard Content -->
        <div v-else class="space-y-6">
          <AdminStatsGrid :stats="stats" />

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2">
              <AdminRecentActivity :activities="stats.actividadReciente" :loading="loading"
                @refresh="refrescarEstadisticas" />
            </div>

            <!-- Usuarios por Rol -->
            <Card class="border-0 shadow-sm bg-white backdrop-blur">
              <CardContent class="p-6">
                <div class="flex items-center gap-2 mb-4">
                  <UsersIcon class="h-5 w-5 text-muted-foreground" />
                  <h3 class="text-lg font-semibold">Usuarios por Rol</h3>
                </div>

                <div v-if="stats.usuariosPorRol.length > 0" class="space-y-3">
                  <div v-for="rol in stats.usuariosPorRol" :key="rol.rol" class="flex items-center justify-between">
                    <span class="text-sm font-medium capitalize">{{ rol.rol }}</span>
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-semibold">{{ rol.count }}</span>
                      <div class="w-16 bg-secondary rounded-full h-2">
                        <div class="h-2 rounded-full bg-primary"
                          :style="{ width: `${(rol.count / totalUsuarios) * 100}%` }" />
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center py-8 text-muted-foreground">
                  <Users class="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p class="text-sm">No hay datos de usuarios</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <!-- Vista para Usuarios No Administradores (vista original) -->
      <div v-else>
        <!-- Header Card -->
        <Card class="mb-6 border-0 shadow-sm bg-white backdrop-blur">
          <CardContent class="p-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0">
                <h1 class="text-2xl font-semibold tracking-tight text-foreground">Bienvenido</h1>
                <p class="mt-1 text-sm text-muted-foreground">
                  {{ nombreBienvenida || 'Usuario' }}
                </p>
              </div>

              <div class="flex shrink-0 flex-wrap items-center gap-2">
                <NuxtLink to="/simulador/lineas-credito">
                  <Button
                    class="bg-linear-to-r from-emerald-500 to-sky-500 text-white shadow-sm hover:from-emerald-600 hover:to-sky-600">
                    <DocumentPlusIcon class="h-5 w-5 mr-2" />
                    Nueva solicitud
                  </Button>
                </NuxtLink>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Solicitudes Card -->
        <Card class="mb-6 border-0 shadow-sm bg-white backdrop-blur">
          <CardContent class="p-6">
            <div class="flex items-center justify-between gap-3 mb-6">
              <div class="flex items-start gap-3 flex-1">
                <div
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-gradient-to-br from-blue-500 to-blue-600 p-2 shadow-lg shadow-blue-500/20">
                  <ClipboardDocumentListIcon class="h-full w-full text-white" />
                </div>
                <div class="flex-1">
                  <div class="text-base font-bold text-foreground">Mis solicitudes</div>
                  <div class="mt-1 text-sm text-muted-foreground">
                    Listado de tus solicitudes y estado actual.
                  </div>
                </div>
              </div>

              <Button @click="cargarSolicitudes" :disabled="loadingSolicitudes"
                class="shrink-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg shadow-blue-500/20 hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-600/30">
                <ArrowPathIcon :class="['h-5 w-5 mr-2', loadingSolicitudes ? 'animate-spin' : '']" />
                Actualizar
              </Button>
            </div>

            <div class="mt-4">
              <div v-if="loadingSolicitudes" class="flex items-center justify-center py-8">
                <div class="flex items-center gap-2 text-blue-600">
                  <ArrowPathIcon class="h-5 w-5 animate-spin" />
                  <span class="text-sm font-medium">Cargando solicitudes...</span>
                </div>
              </div>
              <div v-else-if="solicitudesError"
                class="rounded-xl border border-red-200/50 bg-gradient-to-br from-red-50 to-red-100 p-4 text-sm text-red-700">
                <div class="flex items-center gap-2">
                  <ExclamationTriangleIcon class="h-5 w-5 text-red-500" />
                  {{ solicitudesError }}
                </div>
              </div>
              <div v-else-if="solicitudes.length === 0"
                class="rounded-xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100 p-8 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200/50">
                    <DocumentIcon class="h-8 w-8 text-gray-400" />
                  </div>
                  <div class="text-sm font-medium text-gray-600">Aún no tienes solicitudes registradas.</div>
                  <div class="text-xs text-gray-500">Cuando crees una solicitud, aparecerá aquí.</div>
                </div>
              </div>
              <div v-else
                class="overflow-hidden rounded-xl border border-blue-200/50 bg-gradient-to-br from-white via-blue-50/20 to-white shadow-lg">
                <table class="w-full text-left text-sm">
                  <thead
                    class="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-xs font-bold uppercase tracking-wider text-white">
                    <tr>
                      <th class="px-4 py-4 text-center">Modalidad</th>
                      <th class="px-4 py-4 text-center">Monto</th>
                      <th class="px-4 py-4 text-center">Estado</th>
                      <th class="px-4 py-4 text-center">Creación</th>
                      <th class="px-4 py-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(s, index) in solicitudes" :key="s.numero_solicitud" :class="[
                      'border-t border-blue-100/50 transition-all duration-200',
                      index % 2 === 0 ? 'bg-white/50' : 'bg-blue-50/30',
                      'hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 hover:shadow-md'
                    ]">
                      <td class="px-4 py-4 text-center">
                        <div class="font-medium text-foreground">{{ s?.detalle_modalidad || '-' }}</div>
                      </td>
                      <td class="px-4 py-4 text-center">
                        <div class="font-bold text-green-600 text-lg">{{ fmtMoney(s?.valor_solicitud || 0) }}</div>
                      </td>
                      <td class="px-4 py-4 text-center">
                        <div class="flex flex-col items-center gap-2">
                          <Badge :class="`w-fit ${estadoBadgeClass(String(s.estado || ''))}`">
                            {{ getEstadoData(String(s.estado || ''))?.nombre || s.estado || '-' }}
                          </Badge>
                          <Progress :model-value="estadoProgressPercent(String(s.estado || ''))" class="w-32 h-2" />
                        </div>
                      </td>
                      <td class="px-4 py-4 text-center">
                        <div class="text-foreground">{{ fmtDate(s.created_at) }}</div>
                      </td>
                      <td class="px-4 py-4 text-center">
                        <NuxtLink :to="`/solicitudes/${s.numero_solicitud}`">
                          <Button size="sm"
                            class="gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-md hover:from-purple-600 hover:to-purple-700 hover:shadow-purple-600/30">
                            <EyeIcon class="h-4 w-4" />
                            Ver
                          </Button>
                        </NuxtLink>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Vista específica para Trabajadores -->
        <div v-if="isTrabajador" class="mb-6 space-y-6">
          <!-- Convenio activo -->
          <Card class="border-0 shadow-sm bg-white backdrop-blur">
            <CardContent class="p-6">
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <h2 class="text-lg font-semibold text-foreground">Convenio activo</h2>
                  <p class="mt-1 text-sm text-muted-foreground">
                    Información del convenio de tu empresa.
                  </p>
                </div>
                <Button variant="outline" size="sm" @click="cargarConvenioActivo" :disabled="loadingConvenio"
                  class="border-sky-100 bg-white/80 text-slate-700 shadow-sm hover:bg-sky-50 hover:border-sky-300">
                  <ArrowPathIcon :class="['h-4 w-4 mr-2', loadingConvenio ? 'animate-spin' : '']" />
                  Actualizar
                </Button>
              </div>

              <div v-if="errorConvenio" class="mt-4 text-sm text-destructive">
                {{ errorConvenio }}
              </div>

              <div v-else class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  class="rounded-xl border border-blue-200/50 bg-linear-to-br from-blue-500 via-blue-400 to-cyan-300 p-4 shadow-lg shadow-blue-500/20">
                  <div class="text-xs font-semibold uppercase tracking-wide text-white/90">Empresa</div>
                  <div class="mt-1 text-sm font-medium text-white">
                    {{ convenioActivo?.razon_social || empresaTrabajador?.razon_social || '-' }}
                  </div>
                  <div class="mt-2 text-xs text-white/80">NIT: {{ String(convenioActivo?.nit ||
                    empresaTrabajador?.nit || '-') }}</div>
                </div>
                <div
                  class="rounded-xl border border-purple-200/50 bg-linear-to-br from-purple-500 via-purple-400 to-pink-300 p-4 shadow-lg shadow-purple-500/20">
                  <div class="text-xs font-semibold uppercase tracking-wide text-white/90">Vigencia</div>
                  <div class="mt-1 text-sm font-medium text-white">
                    Estado: {{ convenioActivo?.estado || '-' }}
                  </div>
                  <div class="mt-2 text-xs text-white/80">
                    Vence: {{ convenioActivo?.fecha_vencimiento ? fmtDate(convenioActivo.fecha_vencimiento) : '-' }}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Parámetros relevantes -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Motivos de rechazo -->
            <Card class="border-0 shadow-lg bg-gradient-to-br from-white via-rose-50/20 to-white backdrop-blur">
              <CardContent class="p-6">
                <div class="flex items-center gap-3 mb-4">
                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-gradient-to-br from-rose-500 to-rose-600 p-2 shadow-lg shadow-rose-500/20">
                    <ExclamationTriangleIcon class="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-foreground">Motivos de rechazo</h3>
                    <p class="text-sm text-muted-foreground">Parámetros generales del crédito.</p>
                  </div>
                </div>

                <div v-if="loadingParametros" class="flex items-center justify-center py-8">
                  <div class="flex items-center gap-2 text-rose-600">
                    <ArrowPathIcon class="h-5 w-5 animate-spin" />
                    <span class="text-sm font-medium">Cargando...</span>
                  </div>
                </div>
                <div v-else-if="errorParametros"
                  class="rounded-xl border border-red-200/50 bg-gradient-to-br from-red-50 to-red-100 p-4 text-sm text-red-700">
                  <div class="flex items-center gap-2">
                    <ExclamationTriangleIcon class="h-5 w-5 text-red-500" />
                    {{ errorParametros }}
                  </div>
                </div>
                <div v-else class="mt-4 space-y-3 max-h-80 overflow-auto pr-2">
                  <div v-for="(m, index) in motivosRechazo" :key="m.modrec"
                    class="group rounded-xl border border-rose-200/50 bg-gradient-to-br from-rose-50 via-pink-50 to-white p-4 shadow-md hover:shadow-lg hover:from-rose-100 hover:via-pink-100 hover:to-white transition-all duration-200">
                    <div class="flex items-start gap-3">
                      <div
                        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white text-sm font-bold shadow-md">
                        {{ index + 1 }}
                      </div>
                      <div class="flex-1">
                        <div class="text-sm font-medium text-gray-800 group-hover:text-gray-900">
                          {{ m.detalle }}
                        </div>
                        <div class="mt-1 text-xs text-gray-500">
                          Código: {{ m.modrec }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Oficinas de crédito -->
            <Card
              class="border-0 shadow-lg bg-gradient-to-br from-white via-violet-50/20 to-white backdrop-blur lg:col-span-2">
              <CardContent class="p-6">
                <div class="flex items-center gap-3 mb-4">
                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-200 bg-gradient-to-br from-violet-500 to-violet-600 p-2 shadow-lg shadow-violet-500/20">
                    <BuildingOfficeIcon class="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-foreground">Oficinas de crédito</h3>
                    <p class="text-sm text-muted-foreground">Canales disponibles para atención.</p>
                  </div>
                </div>

                <div v-if="loadingParametros" class="flex items-center justify-center py-8">
                  <div class="flex items-center gap-2 text-violet-600">
                    <ArrowPathIcon class="h-5 w-5 animate-spin" />
                    <span class="text-sm font-medium">Cargando...</span>
                  </div>
                </div>
                <div v-else-if="errorParametros"
                  class="rounded-xl border border-red-200/50 bg-gradient-to-br from-red-50 to-red-100 p-4 text-sm text-red-700">
                  <div class="flex items-center gap-2">
                    <ExclamationTriangleIcon class="h-5 w-5 text-red-500" />
                    {{ errorParametros }}
                  </div>
                </div>
                <div v-else
                  class="mt-4 overflow-hidden rounded-xl border border-violet-200/50 bg-gradient-to-br from-white via-violet-50/20 to-white shadow-lg">
                  <table class="w-full text-left text-sm">
                    <thead
                      class="bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 text-xs font-bold uppercase tracking-wider text-white">
                      <tr>
                        <th class="px-4 py-4 text-center">Oficina</th>
                        <th class="px-4 py-4 text-center">Dirección</th>
                        <th class="px-4 py-4 text-center">Contacto</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(o, index) in oficinasCredito" :key="o.ofiafi" :class="[
                        'border-t border-violet-100/50 transition-all duration-200',
                        index % 2 === 0 ? 'bg-white/50' : 'bg-violet-50/30',
                        'hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-blue-50/50 hover:shadow-md'
                      ]">
                        <td class="px-4 py-4 text-center">
                          <div class="font-medium text-foreground">{{ o.detalle }}</div>
                          <div class="text-xs text-muted-foreground">Código: {{ o.ofiafi }}</div>
                        </td>
                        <td class="px-4 py-4 text-center">
                          <div class="text-foreground">{{ o.direccion || '-' }}</div>
                        </td>
                        <td class="px-4 py-4 text-center">
                          <div class="space-y-1">
                            <div class="flex items-center justify-center gap-1">
                              <PhoneIcon class="h-3 w-3 text-violet-500" />
                              <span class="text-xs text-muted-foreground">{{ o.telefono || '-' }}</span>
                            </div>
                            <div class="flex items-center justify-center gap-1">
                              <EnvelopeIcon class="h-3 w-3 text-blue-500" />
                              <span class="text-xs text-muted-foreground">{{ o.email || '-' }}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Datos generales del crédito -->
          <Card class="border-0 shadow-lg bg-gradient-to-br from-white via-amber-50/20 to-white backdrop-blur">
            <CardContent class="p-6">
              <div class="flex items-center gap-3 mb-6">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200 bg-gradient-to-br from-amber-500 to-amber-600 p-2 shadow-lg shadow-amber-500/20">
                  <ChartBarIcon class="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 class="text-base font-bold text-foreground">Datos generales de la oficina de créditos</h3>
                  <p class="text-sm text-muted-foreground">Información administrativa.</p>
                </div>
              </div>

              <div v-if="loadingParametros" class="flex items-center justify-center py-8">
                <div class="flex items-center gap-2 text-amber-600">
                  <ArrowPathIcon class="h-5 w-5 animate-spin" />
                  <span class="text-sm font-medium">Cargando...</span>
                </div>
              </div>
              <div v-else-if="errorParametros"
                class="rounded-xl border border-red-200/50 bg-gradient-to-br from-red-50 to-red-100 p-4 text-sm text-red-700">
                <div class="flex items-center gap-2">
                  <ExclamationTriangleIcon class="h-5 w-5 text-red-500" />
                  {{ errorParametros }}
                </div>
              </div>
              <div v-else class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div
                    class="group rounded-xl border border-amber-200/50 bg-gradient-to-br from-amber-50 via-orange-50 to-white p-4 shadow-md hover:shadow-lg hover:from-amber-100 hover:via-orange-100 hover:to-white transition-all duration-200">
                    <div class="flex items-center gap-2 mb-2">
                      <UserIcon class="h-4 w-4 text-amber-600" />
                      <div class="text-xs font-bold uppercase tracking-wide text-amber-700">Jefe crédito</div>
                    </div>
                    <div class="mt-1 text-sm font-medium text-gray-800 group-hover:text-gray-900">
                      {{ datosGeneralesCredito?.jefcre || '-' }}
                    </div>
                  </div>
                  <div
                    class="group rounded-xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50 via-green-50 to-white p-4 shadow-md hover:shadow-lg hover:from-emerald-100 hover:via-green-100 hover:to-white transition-all duration-200">
                    <div class="flex items-center gap-2 mb-2">
                      <BriefcaseIcon class="h-4 w-4 text-emerald-600" />
                      <div class="text-xs font-bold uppercase tracking-wide text-emerald-700">Cargo</div>
                    </div>
                    <div class="mt-1 text-sm font-medium text-gray-800 group-hover:text-gray-900">
                      {{ datosGeneralesCredito?.carjefcre || '-' }}
                    </div>
                  </div>
                  <div
                    class="group rounded-xl border border-sky-200/50 bg-gradient-to-br from-sky-50 via-blue-50 to-white p-4 shadow-md hover:shadow-lg hover:from-sky-100 hover:via-blue-100 hover:to-white transition-all duration-200">
                    <div class="flex items-center gap-2 mb-2">
                      <CurrencyDollarIcon class="h-4 w-4 text-sky-600" />
                      <div class="text-xs font-bold uppercase tracking-wide text-sky-700">Valor máximo</div>
                    </div>
                    <div class="mt-1 text-2xl font-bold text-green-600 group-hover:text-green-700">
                      {{ fmtMoney(Number(datosGeneralesCredito?.valmax || 7000000)) }}
                    </div>
                  </div>
                  <div
                    class="group rounded-xl border border-violet-200/50 bg-gradient-to-br from-violet-50 via-purple-50 to-white p-4 shadow-md hover:shadow-lg hover:from-violet-100 hover:via-purple-100 hover:to-white transition-all duration-200">
                    <div class="flex items-center gap-2 mb-2">
                      <CalendarIcon class="h-4 w-4 text-violet-600" />
                      <div class="text-xs font-bold uppercase tracking-wide text-violet-700">Máximo de cuotas</div>
                    </div>
                    <div class="mt-1 text-2xl font-bold text-violet-600 group-hover:text-violet-700">
                      {{ String(datosGeneralesCredito?.cuomax || 36) }}
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    class="group rounded-xl border border-rose-200/50 bg-gradient-to-br from-rose-50 via-pink-50 to-white p-4 shadow-md hover:shadow-lg hover:from-rose-100 hover:via-pink-100 hover:to-white transition-all duration-200">
                    <div class="flex items-center gap-2 mb-2">
                      <AcademicCapIcon class="h-4 w-4 text-rose-600" />
                      <div class="text-xs font-bold uppercase tracking-wide text-rose-700">Director</div>
                    </div>
                    <div class="mt-1 text-sm font-medium text-gray-800 group-hover:text-gray-900">
                      {{ datosGeneralesCredito?.diradm || '-' }}
                    </div>
                  </div>
                  <div
                    class="group rounded-xl border border-amber-200/50 bg-gradient-to-br from-amber-50 via-orange-50 to-white p-4 shadow-md hover:shadow-lg hover:from-amber-100 hover:via-orange-100 hover:to-white transition-all duration-200">
                    <div class="flex items-center gap-2 mb-2">
                      <UserGroupIcon class="h-4 w-4 text-amber-600" />
                      <div class="text-xs font-bold uppercase tracking-wide text-amber-700">Cargo director</div>
                    </div>
                    <div class="mt-1 text-sm font-medium text-gray-800 group-hover:text-gray-900">
                      {{ datosGeneralesCredito?.cardiradm || '-' }}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSession } from '~/composables/useSession'
import { useInicio } from '~/composables/inicio/useInicio'
import { useInicioTrabajador } from '~/composables/inicio/useInicioTrabajador'
import { useAdminDashboard } from '~/composables/admin/useAdminDashboard'
import { usePermissions } from '~/composables/usePermissions'
import {
  ArrowPathIcon,
  CalculatorIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  DocumentPlusIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  UsersIcon
} from '@heroicons/vue/24/outline'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Badge from '@/components/ui/Badge.vue'
import Progress from '@/components/ui/Progress.vue'
import AdminStatsGrid from '@/components/admin/AdminStatsGrid.vue'
import AdminRecentActivity from '@/components/admin/AdminRecentActivity.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { session } = useSession()
const { isAdministrator, isAdviser, isTrabajador } = usePermissions()
const router = useRouter()

const nombreBienvenida = computed(() => {
  const user = session.value.user
  if (!user) return ''

  if (isTrabajador.value && user.trabajador) {
    const t = user.trabajador
    const nombres = [t.primer_nombre, t.segundo_nombre].filter(Boolean).join(' ').trim()
    const apellidos = [t.primer_apellido, t.segundo_apellido].filter(Boolean).join(' ').trim()
    return `${nombres} ${apellidos}`.trim()
  }

  const full = `${user.nombres || ''} ${user.apellidos || ''}`.trim()
  if (full) return full

  return user.username
})

// Composable para usuarios no administradores (vista original)
const {
  solicitudes,
  loadingSolicitudes,
  solicitudesError,
  fmtMoney,
  fmtDate,
  estadoProgressPercent,
  estadoBadgeClass,
  getEstadoData,
  cargarSolicitudes
} = useInicio()

const {
  loadingParametros,
  errorParametros,
  loadingConvenio,
  errorConvenio,
  convenioActivo,
  empresaTrabajador,
  motivosRechazo,
  oficinasCredito,
  datosGeneralesCredito,
  cargarConvenioActivo
} = useInicioTrabajador()

// Composable para administradores (dashboard de estadísticas)
const {
  loading,
  error,
  stats,
  tieneDatos,
  tiempoSinActualizar,
  refrescarEstadisticas
} = useAdminDashboard()

// Total de usuarios para la gráfica
const totalUsuarios = computed(() => {
  return stats.value.usuariosPorRol.reduce((sum, rol) => sum + rol.count, 0)
})
</script>
