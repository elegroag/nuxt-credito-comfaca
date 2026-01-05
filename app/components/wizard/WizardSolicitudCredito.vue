<template>
  <Card class="border-border shadow-sm">
    <CardHeader class="border-b border-border p-4 sm:p-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Paso {{ step + 1 }} de {{ steps.length }}
          </div>
          <CardTitle class="text-xl font-bold text-foreground">
            {{ steps[step]?.title }}
          </CardTitle>
        </div>

        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="step === 0"
            @click="prev"
            type="button"
          >
            <ChevronLeft class="mr-2 h-4 w-4" />
            Atrás
          </Button>
          
          <Button
            v-if="step < steps.length - 1"
            size="sm"
            @click="next"
            type="button"
          >
            Siguiente
            <ChevronRight class="ml-2 h-4 w-4" />
          </Button>
          
          <template v-else>
            <Button
              variant="secondary"
              size="sm"
              :disabled="loadingXml"
              @click="generarXml(false)"
              type="button"
            >
              <FileCode class="mr-2 h-4 w-4" />
              Generar XML
            </Button>
            <Button
              size="sm"
              :disabled="loadingXml"
              @click="generarXml(true)"
              type="button"
            >
              <Send class="mr-2 h-4 w-4" />
              Enviar
            </Button>
          </template>
        </div>
      </div>

      <div class="mt-6 flex flex-wrap gap-2">
        <button
          v-for="(s, i) in steps"
          :key="s.key"
          class="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all"
          :class="i === step 
            ? 'bg-primary text-primary-foreground shadow-sm' 
            : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'"
          @click="step = i"
          type="button"
        >
          {{ s.short }}
        </button>
      </div>
    </CardHeader>

    <CardContent class="p-4 sm:p-6">
      <form class="grid gap-4" @submit.prevent>
        <template v-if="steps[step]?.key === 'encabezado'">
          <FormField label="Fecha radicado">
            <Input v-model="form.encabezado.fecha_radicado" type="date" />
          </FormField>
        </template>

        <template v-else-if="steps[step]?.key === 'solicitud'">
          <div class="grid gap-4 sm:grid-cols-2">
            <FormField label="Número solicitud">
              <Input v-model="form.solicitud.numero_solicitud" />
            </FormField>
            <FormField label="Número comprobante">
              <Input v-model="form.solicitud.numero_comprobante" />
            </FormField>
            <FormField label="Valor solicitud">
              <Input v-model.number="form.solicitud.valor_solicitud" type="number" min="0" />
            </FormField>
            <FormField label="Categoría">
              <Input v-model="form.solicitud.categoria" />
            </FormField>
            <FormField label="Rol en solicitud">
              <select v-model="form.solicitud.rol_en_solicitud" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="solicitante">solicitante</option>
                <option value="codeudor">codeudor</option>
              </select>
            </FormField>
            <FormField label="Valor solicitado">
              <Input v-model.number="form.solicitud.valor_solicitado" type="number" min="0" />
            </FormField>
            <FormField label="Plazo (meses)">
              <Input v-model.number="form.solicitud.plazo_meses" type="number" min="1" />
            </FormField>
            <FormField label="URL Foto documento (opcional)">
              <Input v-model="form.solicitud.foto_documento!.url" placeholder="https://..." />
            </FormField>
          </div>
        </template>

        <template v-else-if="steps[step]?.key === 'producto'">
          <div class="grid gap-4 sm:grid-cols-2">
            <FormField label="Producto">
              <select v-model="form.producto_solicitado.tipo" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="educacion">educacion</option>
                <option value="salud">salud</option>
                <option value="vivienda">vivienda</option>
                <option value="electrodomesticos">electrodomesticos</option>
                <option value="productos_hogar">productos_hogar</option>
                <option value="vestuario">vestuario</option>
                <option value="recreacion">recreacion</option>
                <option value="turismo">turismo</option>
              </select>
            </FormField>

            <label class="flex items-center gap-2 text-sm text-foreground">
              <input v-model="form.producto_solicitado.ha_tenido_credito_comfaca" type="checkbox" class="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
              Ha tenido crédito con Comfaca
            </label>
          </div>
        </template>

        <template v-else-if="steps[step]?.key === 'solicitante'">
          <div class="grid gap-4 sm:grid-cols-2">
            <FormField label="Fecha vinculación">
              <Input v-model="form.solicitante.fecha_vinculacion" type="date" />
            </FormField>
            <FormField label="Tipo identificación">
              <select v-model="form.solicitante.tipo_identificacion" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="CC">CC</option>
                <option value="CE">CE</option>
              </select>
            </FormField>
            <FormField label="Número identificación">
              <Input v-model="form.solicitante.numero_identificacion" />
            </FormField>
            <FormField label="Fecha nacimiento">
              <Input v-model="form.solicitante.fecha_nacimiento" type="date" />
            </FormField>
            <FormField label="País nacimiento">
              <Input v-model="form.solicitante.pais_nacimiento" />
            </FormField>
            <FormField label="Nombres y apellidos">
              <Input v-model="form.solicitante.nombres_apellidos" />
            </FormField>
            <FormField label="Fecha expedición documento">
              <Input v-model="form.solicitante.fecha_expedicion_documento" type="date" />
            </FormField>
            <FormField label="Profesión/Ocupación">
              <Input v-model="form.solicitante.profesion_ocupacion" />
            </FormField>
            <FormField label="Sexo">
              <select v-model="form.solicitante.sexo" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="M">M</option>
                <option value="F">F</option>
              </select>
            </FormField>
            <FormField label="Nivel educativo">
              <select v-model="form.solicitante.nivel_educativo" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="primaria">primaria</option>
                <option value="bachillerato">bachillerato</option>
                <option value="tecnico">tecnico</option>
                <option value="universitario">universitario</option>
                <option value="posgrado">posgrado</option>
                <option value="ninguno">ninguno</option>
              </select>
            </FormField>

            <FormField label="Barrio residencia">
              <Input v-model="form.solicitante.barrio_residencia" />
            </FormField>
            <FormField label="Ciudad residencia">
              <Input v-model="form.solicitante.ciudad_residencia" />
            </FormField>
            <FormField label="País residencia">
              <Input v-model="form.solicitante.pais_residencia" />
            </FormField>
            <FormField label="Teléfono fijo (opcional)">
              <Input v-model="form.solicitante.telefono_fijo" />
            </FormField>
            <FormField label="Teléfono móvil">
              <Input v-model="form.solicitante.telefono_movil" />
            </FormField>
            <FormField label="Email">
              <Input v-model="form.solicitante.email" type="email" />
            </FormField>

            <FormField label="Tipo vivienda">
              <select v-model="form.solicitante.tipo_vivienda" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="propia">propia</option>
                <option value="familiar">familiar</option>
                <option value="arrendada">arrendada</option>
              </select>
            </FormField>

            <label class="flex items-center gap-2 text-sm text-foreground">
              <input v-model="form.solicitante.vive_con_nucleo_familiar" type="checkbox" class="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
              Vive con núcleo familiar
            </label>

            <FormField label="Personas a cargo">
              <Input v-model.number="form.solicitante.personas_a_cargo" type="number" min="0" />
            </FormField>
          </div>
        </template>

        <template v-else-if="steps[step]?.key === 'conyuge'">
          <div class="grid gap-4">
            <label class="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                :checked="!!form.conyuge"
                @change="(ev) => toggleConyuge((ev.target as HTMLInputElement).checked)"
              />
              Incluir datos del cónyuge
            </label>

            <div v-if="form.conyuge" class="grid gap-4 sm:grid-cols-2">
              <FormField label="Identificación">
                <Input v-model="form.conyuge.identificacion" />
              </FormField>
              <FormField label="Nombres y apellidos">
                <Input v-model="form.conyuge.nombres_apellidos" />
              </FormField>
              <FormField label="Ingresos laborales">
                <Input v-model.number="form.conyuge.ingresos_laborales" type="number" min="0" />
              </FormField>
              <label class="flex items-center gap-2 text-sm text-foreground">
                <input v-model="form.conyuge.trabaja" type="checkbox" class="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
                Trabaja
              </label>
              <FormField label="Teléfono móvil">
                <Input v-model="form.conyuge.telefono_movil" />
              </FormField>

              <div class="sm:col-span-2 mt-2 text-sm font-semibold text-foreground">Empresa (opcional)</div>
              <label class="sm:col-span-2 flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  :checked="!!form.conyuge.empresa"
                  @change="(ev) => toggleEmpresaConyuge((ev.target as HTMLInputElement).checked)"
                />
                Incluir empresa
              </label>

              <template v-if="form.conyuge.empresa">
                <FormField label="Nombre" class="sm:col-span-2">
                  <Input v-model="form.conyuge.empresa.nombre" />
                </FormField>
                <FormField label="Dirección" class="sm:col-span-2">
                  <Input v-model="form.conyuge.empresa.direccion" />
                </FormField>
                <FormField label="Teléfono">
                  <Input v-model="form.conyuge.empresa.telefono" />
                </FormField>
                <FormField label="Email">
                  <Input v-model="form.conyuge.empresa.email" type="email" />
                </FormField>
              </template>
            </div>
          </div>
        </template>

        <template v-else-if="steps[step]?.key === 'laboral'">
          <div class="grid gap-4 sm:grid-cols-2">
            <FormField label="Razón social">
              <Input v-model="form.informacion_laboral.empresa_razon_social" />
            </FormField>
            <FormField label="NIT">
              <Input v-model="form.informacion_laboral.empresa_nit" />
            </FormField>
            <FormField label="Teléfono">
              <Input v-model="form.informacion_laboral.empresa_telefono" />
            </FormField>
            <FormField label="Dirección">
              <Input v-model="form.informacion_laboral.empresa_direccion" />
            </FormField>
            <FormField label="Ciudad">
              <Input v-model="form.informacion_laboral.empresa_ciudad" />
            </FormField>
            <FormField label="Cargo">
              <Input v-model="form.informacion_laboral.cargo" />
            </FormField>
            <FormField label="Fecha ingreso">
              <Input v-model="form.informacion_laboral.fecha_ingreso" type="date" />
            </FormField>
            <FormField label="Tipo contrato">
              <Input v-model="form.informacion_laboral.tipo_contrato" />
            </FormField>
            <FormField label="Nombramiento / Pagador">
              <Input v-model="form.informacion_laboral.nombramiento_o_pagador" />
            </FormField>
            <FormField label="Tiempo servicio">
              <Input v-model.number="form.informacion_laboral.tiempo_servicio" type="number" min="0" />
            </FormField>
            <FormField label="Unidad">
              <select v-model="form.informacion_laboral.tiempo_servicio_unidad" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="meses">meses</option>
                <option value="anios">anios</option>
              </select>
            </FormField>
          </div>
        </template>

        <template v-else-if="steps[step]?.key === 'ingresos'">
          <div class="grid gap-4 sm:grid-cols-2">
            <FormField label="Salario básico mensual">
              <Input v-model.number="form.ingresos_descuentos.salario_basico_mensual" type="number" min="0" />
            </FormField>
            <FormField label="Subsidio transporte">
              <Input v-model.number="form.ingresos_descuentos.subsidio_transporte" type="number" min="0" />
            </FormField>
            <FormField label="Horas extras">
              <Input v-model.number="form.ingresos_descuentos.horas_extras" type="number" min="0" />
            </FormField>
            <FormField label="Comisiones">
              <Input v-model.number="form.ingresos_descuentos.comisiones" type="number" min="0" />
            </FormField>
            <FormField label="Otros ingresos">
              <Input v-model.number="form.ingresos_descuentos.otros_ingresos" type="number" min="0" />
            </FormField>
            <FormField label="Total ingresos">
              <Input v-model.number="form.ingresos_descuentos.total_ingresos" type="number" min="0" disabled />
            </FormField>

            <div class="col-span-full mt-4 flex items-center gap-2">
               <div class="h-px flex-1 bg-border"></div>
               <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descuentos</span>
               <div class="h-px flex-1 bg-border"></div>
            </div>

            <FormField label="Salud y pensión">
              <Input v-model.number="form.ingresos_descuentos.salud_pension" type="number" min="0" />
            </FormField>
            <FormField label="Libranzas Comfaca">
              <Input v-model.number="form.ingresos_descuentos.libranzas_comfaca" type="number" min="0" />
            </FormField>
            <FormField label="Otras libranzas">
              <Input v-model.number="form.ingresos_descuentos.otras_libranzas" type="number" min="0" />
            </FormField>
            <FormField label="Judiciales">
              <Input v-model.number="form.ingresos_descuentos.judiciales" type="number" min="0" />
            </FormField>
            <FormField label="Otras deducciones">
              <Input v-model.number="form.ingresos_descuentos.otras_deducciones" type="number" min="0" />
            </FormField>
            <FormField label="Total descuentos">
              <Input v-model.number="form.ingresos_descuentos.total_descuentos" type="number" min="0" disabled />
            </FormField>

            <FormField label="Total neto recibido">
              <Input v-model.number="form.ingresos_descuentos.total_neto_recibido" type="number" min="0" disabled />
            </FormField>

            <div class="col-span-full">
              <Button
                variant="outline"
                size="sm"
                type="button"
                class="w-full"
                @click="autocalcularIngresos"
              >
                <RefreshCw class="mr-2 h-4 w-4" />
                Autocalcular totales
              </Button>
            </div>
          </div>
        </template>

        <template v-else-if="steps[step]?.key === 'economica'">
          <div class="grid gap-4 sm:grid-cols-2">
            <FormField label="Arrendamientos">
              <Input v-model.number="form.informacion_economica.arrendamientos" type="number" min="0" />
            </FormField>
            <FormField label="Otros ingresos">
              <Input v-model.number="form.informacion_economica.otros" type="number" min="0" />
            </FormField>
            <FormField label="Descripción otros ingresos" class="sm:col-span-2">
              <textarea v-model="form.informacion_economica.descripcion" class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"></textarea>
            </FormField>

            <FormField label="Total gastos">
              <Input v-model.number="form.informacion_economica.total_gastos" type="number" min="0" />
            </FormField>
            <FormField label="Descripción gastos" class="sm:col-span-2">
              <textarea v-model="form.informacion_economica.gastos_descripcion" class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"></textarea>
            </FormField>

            <FormField label="Total activos">
              <Input v-model.number="form.informacion_economica.total_activos" type="number" min="0" />
            </FormField>
            <FormField label="Total pasivos">
              <Input v-model.number="form.informacion_economica.total_pasivos" type="number" min="0" />
            </FormField>
          </div>
        </template>

        <template v-else-if="steps[step]?.key === 'propiedades'">
          <div class="flex items-center justify-between mb-4">
            <div class="text-sm font-bold uppercase tracking-wider text-muted-foreground">Propiedades</div>
            <Button
              variant="outline"
              size="sm"
              type="button"
              @click="addPropiedad"
            >
              <Plus class="mr-2 h-4 w-4" />
              Agregar
            </Button>
          </div>

          <div v-if="form.propiedades.length === 0" class="rounded-lg bg-muted/50 p-8 text-center border-2 border-dashed border-border">
            <p class="text-sm text-muted-foreground italic">No se han registrado propiedades.</p>
          </div>

          <div class="grid gap-4">
            <Card v-for="(p, idx) in form.propiedades" :key="idx" class="border-border/50 bg-muted/20">
              <CardHeader class="flex flex-row items-center justify-between py-3">
                <CardTitle class="text-sm font-semibold">Propiedad #{{ idx + 1 }}</CardTitle>
                <Button variant="ghost" size="sm" class="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2" @click="removePropiedad(idx)">
                  <Trash2 class="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent class="grid gap-4 sm:grid-cols-2 pb-4">
                <FormField label="Tipo bien">
                  <select v-model="p.tipo_bien" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="vivienda">vivienda</option>
                    <option value="vehiculo">vehiculo</option>
                  </select>
                </FormField>
                <FormField label="Ciudad">
                  <Input v-model="p.ciudad" />
                </FormField>
                <FormField label="Descripción" class="sm:col-span-2">
                  <Input v-model="p.descripcion" />
                </FormField>

                <FormField v-if="p.tipo_bien === 'vivienda'" label="Matrícula inmobiliaria">
                  <Input v-model="p.matricula_inmobiliaria" />
                </FormField>
                <FormField v-else label="Modelo o matrícula">
                  <Input v-model="p.modelo_o_matricula" />
                </FormField>

                <FormField label="Valor comercial">
                  <Input v-model.number="p.valor_comercial" type="number" min="0" />
                </FormField>
              </CardContent>
            </Card>
          </div>
        </template>

        <template v-else-if="steps[step]?.key === 'deudas'">
          <div class="flex items-center justify-between mb-4">
            <div class="text-sm font-bold uppercase tracking-wider text-muted-foreground">Deudas</div>
            <Button
              variant="outline"
              size="sm"
              type="button"
              @click="addDeuda"
            >
              <Plus class="mr-2 h-4 w-4" />
              Agregar
            </Button>
          </div>

          <div v-if="form.deudas.length === 0" class="rounded-lg bg-muted/50 p-8 text-center border-2 border-dashed border-border">
            <p class="text-sm text-muted-foreground italic">No se han registrado deudas.</p>
          </div>

          <div class="grid gap-4">
            <Card v-for="(d, idx) in form.deudas" :key="idx" class="border-border/50 bg-muted/20">
              <CardHeader class="flex flex-row items-center justify-between py-3">
                <CardTitle class="text-sm font-semibold">Deuda #{{ idx + 1 }}</CardTitle>
                <Button variant="ghost" size="sm" class="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2" @click="removeDeuda(idx)">
                  <Trash2 class="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent class="grid gap-4 sm:grid-cols-2 pb-4">
                <FormField label="Acreedor">
                  <Input v-model="d.acreedor_nombre" />
                </FormField>
                <FormField label="Concepto">
                  <Input v-model="d.concepto" />
                </FormField>
                <FormField label="Valor cuota">
                  <Input v-model.number="d.valor_cuota" type="number" min="0" />
                </FormField>
                <FormField label="Saldo obligación">
                  <Input v-model.number="d.saldo_obligacion" type="number" min="0" />
                </FormField>
              </CardContent>
            </Card>
          </div>
        </template>

        <template v-else-if="steps[step]?.key === 'referencias'">
          <div class="grid gap-8">
            <!-- Referencias Familiares -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="h-8 w-1 bg-primary rounded-full"></div>
                  <h3 class="text-sm font-bold uppercase tracking-wider text-muted-foreground">Referencias familiares</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  @click="addReferencia('familiares')"
                >
                  <Plus class="mr-2 h-4 w-4" />
                  Agregar
                </Button>
              </div>

              <div v-if="form.referencias.familiares.length === 0" class="rounded-lg bg-muted/50 p-6 text-center border-2 border-dashed border-border">
                <p class="text-sm text-muted-foreground italic">No se han registrado referencias familiares.</p>
              </div>

              <div class="grid gap-4">
                <Card v-for="(r, idx) in form.referencias.familiares" :key="`f-${idx}`" class="border-border/50 bg-muted/20 shadow-none">
                  <CardHeader class="flex flex-row items-center justify-between py-3">
                    <CardTitle class="text-sm font-semibold">Familiar #{{ idx + 1 }}</CardTitle>
                    <Button variant="ghost" size="sm" class="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2" @click="removeReferencia('familiares', idx)">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent class="grid gap-4 sm:grid-cols-2 pb-4">
                    <FormField label="Nombre y apellidos">
                      <Input v-model="r.nombre_apellidos" placeholder="Nombre completo" />
                    </FormField>
                    <FormField label="Celular">
                      <Input v-model="r.celular" placeholder="Número de celular" />
                    </FormField>
                  </CardContent>
                </Card>
              </div>
            </div>

            <!-- Referencias Personales -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="h-8 w-1 bg-secondary rounded-full"></div>
                  <h3 class="text-sm font-bold uppercase tracking-wider text-muted-foreground">Referencias personales</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  @click="addReferencia('personales')"
                >
                  <Plus class="mr-2 h-4 w-4" />
                  Agregar
                </Button>
              </div>

              <div v-if="form.referencias.personales.length === 0" class="rounded-lg bg-muted/50 p-6 text-center border-2 border-dashed border-border">
                <p class="text-sm text-muted-foreground italic">No se han registrado referencias personales.</p>
              </div>

              <div class="grid gap-4">
                <Card v-for="(r, idx) in form.referencias.personales" :key="`p-${idx}`" class="border-border/50 bg-muted/20 shadow-none">
                  <CardHeader class="flex flex-row items-center justify-between py-3">
                    <CardTitle class="text-sm font-semibold">Personal #{{ idx + 1 }}</CardTitle>
                    <Button variant="ghost" size="sm" class="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2" @click="removeReferencia('personales', idx)">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent class="grid gap-4 sm:grid-cols-2 pb-4">
                    <FormField label="Nombre y apellidos">
                      <Input v-model="r.nombre_apellidos" placeholder="Nombre completo" />
                    </FormField>
                    <FormField label="Celular">
                      <Input v-model="r.celular" placeholder="Número de celular" />
                    </FormField>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="steps[step]?.key === 'revision'">
          <div class="grid gap-6">
            <Card class="border-border/50 bg-muted/10 shadow-none">
              <CardHeader class="py-3">
                <CardTitle class="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <FileCode class="h-4 w-4" />
                  Payload (JSON)
                </CardTitle>
              </CardHeader>
              <CardContent class="pb-4">
                <div class="rounded-lg bg-background p-4 border border-border">
                  <pre class="overflow-auto text-[10px] text-foreground font-mono leading-relaxed">{{ prettyPayload }}</pre>
                </div>
              </CardContent>
            </Card>

            <Card v-if="xmlText" class="border-primary/20 bg-primary/5 shadow-none animate-in fade-in slide-in-from-bottom-2">
              <CardHeader class="flex flex-row items-center justify-between py-3">
                <CardTitle class="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <FileCode class="h-4 w-4" />
                  XML generado
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  class="h-8 gap-2 bg-background"
                  @click="() => downloadXml()"
                >
                  <Download class="h-3.5 w-3.5" />
                  Descargar
                </Button>
              </CardHeader>
              <CardContent class="pb-4 space-y-3">
                <div v-if="savedFilename" class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-secondary/20 text-secondary-foreground text-[10px] font-bold uppercase tracking-wider">
                  <CheckCircle2 class="h-3 w-3" />
                  Guardado en: {{ savedFilename }}
                </div>
                <div class="rounded-lg bg-background p-4 border border-border">
                  <pre class="overflow-auto text-[10px] text-foreground font-mono leading-relaxed">{{ xmlText }}</pre>
                </div>
              </CardContent>
            </Card>

            <div v-if="errorMsg" class="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-3">
              <AlertCircle class="h-5 w-5 shrink-0" />
              <span class="font-medium">{{ errorMsg }}</span>
            </div>
          </div>
        </template>
      </form>
    </CardContent>
  </Card>

  <Teleport to="body">
    <div v-if="successModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-background/80 backdrop-blur-sm" @click="closeSuccessModal" />
      <Card class="relative w-full max-w-md shadow-2xl border-primary/20 animate-in zoom-in-95 duration-200" @click.stop>
        <CardHeader class="text-center pb-2">
          <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20 text-secondary">
            <CheckCircle2 class="h-6 w-6" />
          </div>
          <CardTitle class="text-xl font-bold text-foreground">Solicitud creada con éxito</CardTitle>
          <CardDescription>
            Tu solicitud fue enviada y quedó en estado
            <span class="font-bold text-secondary-foreground bg-secondary/30 px-1.5 py-0.5 rounded">Postulado</span>.
          </CardDescription>
        </CardHeader>
        
        <CardContent class="space-y-4">
          <div v-if="createdSolicitudId" class="rounded-lg bg-muted p-3 space-y-1">
            <div class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">ID de Solicitud</div>
            <div class="font-mono text-sm break-all text-foreground">{{ createdSolicitudId }}</div>
          </div>
          
          <div v-if="savedFilename" class="rounded-lg bg-muted p-3 space-y-1">
            <div class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Archivo XML</div>
            <div class="text-sm text-foreground break-all">{{ savedFilename }}</div>
          </div>

          <div class="grid grid-cols-1 gap-2 pt-2">
            <Button
              variant="secondary"
              class="w-full"
              @click="goToHome"
            >
              <ClipboardList class="mr-2 h-4 w-4" />
              Ver mis solicitudes
            </Button>
            
            <Button
              v-if="savedFilename"
              class="w-full bg-primary hover:bg-primary/90"
              @click="goToFirmas"
            >
              <PenTool class="mr-2 h-4 w-4" />
              Firmar ahora
            </Button>
            
            <Button
              variant="ghost"
              class="w-full text-muted-foreground hover:text-foreground"
              @click="closeSuccessModal"
            >
              Cerrar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { 
  ChevronLeft, 
  ChevronRight, 
  FileCode, 
  Send, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Download,
  X,
  RefreshCw,
  ClipboardList,
  PenTool
} from 'lucide-vue-next'
import FormField from '~/components/shared/FormField.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'
import { useWizardSolicitud } from '~/composables/solicitud/useWizardSolicitud'

const {
  form,
  step,
  loadingXml,
  xmlText,
  savedFilename,
  createdSolicitudId,
  errorMsg,
  successModalOpen,
  steps,
  prettyPayload,
  next,
  prev,
  toggleConyuge,
  toggleEmpresaConyuge,
  autocalcularIngresos,
  addPropiedad,
  removePropiedad,
  addDeuda,
  removeDeuda,
  addReferencia,
  removeReferencia,
  closeSuccessModal,
  goToHome,
  goToFirmas,
  generarXml,
  downloadXml
} = useWizardSolicitud()
</script>
