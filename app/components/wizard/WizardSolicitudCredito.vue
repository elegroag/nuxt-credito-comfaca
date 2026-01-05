<template>
  <div class="rounded-xl border border-zinc-200 bg-white shadow-sm">
    <div class="border-b border-zinc-200 p-4 sm:p-6">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div class="text-sm text-zinc-600">Paso {{ step + 1 }} de {{ steps.length }}</div>
          <div class="text-lg font-semibold">{{ steps[step]?.title }}</div>
        </div>

        <div class="flex gap-2">
          <button
            class="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
            :disabled="step === 0"
            @click="prev"
            type="button"
          >
            Atrás
          </button>
          <button
            v-if="step < steps.length - 1"
            class="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            @click="next"
            type="button"
          >
            Siguiente
          </button>
          <template v-else>
            <button
              class="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
              :disabled="loadingXml"
              @click="generarXml(false)"
              type="button"
            >
              Generar XML
            </button>
            <button
              class="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
              :disabled="loadingXml"
              @click="generarXml(true)"
              type="button"
            >
              Enviar
            </button>
          </template>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <button
          v-for="(s, i) in steps"
          :key="s.key"
          class="rounded-full px-3 py-1 text-xs font-medium"
          :class="i === step ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'"
          @click="step = i"
          type="button"
        >
          {{ s.short }}
        </button>
      </div>
    </div>

    <div class="p-4 sm:p-6">
      <form class="grid gap-4" @submit.prevent>
        <template v-if="steps[step]?.key === 'encabezado'">
            <FormField label="Fecha radicado">
            <input v-model="form.encabezado.fecha_radicado" type="date" class="input" />
          </FormField>
        </template>

        <template v-else-if="steps[step]?.key === 'solicitud'">
          <div class="grid gap-4 sm:grid-cols-2">
            <FormField label="Número solicitud">
              <input v-model="form.solicitud.numero_solicitud" class="input" />
            </FormField>
            <FormField label="Número comprobante">
              <input v-model="form.solicitud.numero_comprobante" class="input" />
            </FormField>
            <FormField label="Valor solicitud">
              <input v-model.number="form.solicitud.valor_solicitud" type="number" min="0" class="input" />
            </FormField>
            <FormField label="Categoría">
              <input v-model="form.solicitud.categoria" class="input" />
            </FormField>
            <FormField label="Rol en solicitud">
              <select v-model="form.solicitud.rol_en_solicitud" class="input">
                <option value="solicitante">solicitante</option>
                <option value="codeudor">codeudor</option>
              </select>
            </FormField>
            <FormField label="Valor solicitado">
              <input v-model.number="form.solicitud.valor_solicitado" type="number" min="0" class="input" />
            </FormField>
            <FormField label="Plazo (meses)">
              <input v-model.number="form.solicitud.plazo_meses" type="number" min="1" class="input" />
            </FormField>
            <FormField label="URL Foto documento (opcional)">
              <input v-model="form.solicitud.foto_documento!.url" class="input" placeholder="https://..." />
            </FormField>
          </div>
        </template>

        <template v-else-if="steps[step]?.key === 'producto'">
          <div class="grid gap-4 sm:grid-cols-2">
            <FormField label="Producto">
              <select v-model="form.producto_solicitado.tipo" class="input">
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

            <label class="flex items-center gap-2 text-sm">
              <input v-model="form.producto_solicitado.ha_tenido_credito_comfaca" type="checkbox" class="h-4 w-4" />
              Ha tenido crédito con Comfaca
            </label>
          </div>
        </template>

        <template v-else-if="steps[step]?.key === 'solicitante'">
          <div class="grid gap-4 sm:grid-cols-2">
            <FormField label="Fecha vinculación">
              <input v-model="form.solicitante.fecha_vinculacion" type="date" class="input" />
            </FormField>
            <FormField label="Tipo identificación">
              <select v-model="form.solicitante.tipo_identificacion" class="input">
                <option value="CC">CC</option>
                <option value="CE">CE</option>
              </select>
            </FormField>
            <FormField label="Número identificación">
              <input v-model="form.solicitante.numero_identificacion" class="input" />
            </FormField>
            <FormField label="Fecha nacimiento">
              <input v-model="form.solicitante.fecha_nacimiento" type="date" class="input" />
            </FormField>
            <FormField label="País nacimiento">
              <input v-model="form.solicitante.pais_nacimiento" class="input" />
            </FormField>
            <FormField label="Nombres y apellidos">
              <input v-model="form.solicitante.nombres_apellidos" class="input" />
            </FormField>
            <FormField label="Fecha expedición documento">
              <input v-model="form.solicitante.fecha_expedicion_documento" type="date" class="input" />
            </FormField>
            <FormField label="Profesión/Ocupación">
              <input v-model="form.solicitante.profesion_ocupacion" class="input" />
            </FormField>
            <FormField label="Sexo">
              <select v-model="form.solicitante.sexo" class="input">
                <option value="M">M</option>
                <option value="F">F</option>
              </select>
            </FormField>
            <FormField label="Nivel educativo">
              <select v-model="form.solicitante.nivel_educativo" class="input">
                <option value="primaria">primaria</option>
                <option value="bachillerato">bachillerato</option>
                <option value="tecnico">tecnico</option>
                <option value="universitario">universitario</option>
                <option value="posgrado">posgrado</option>
                <option value="ninguno">ninguno</option>
              </select>
            </FormField>

            <FormField label="Barrio residencia">
              <input v-model="form.solicitante.barrio_residencia" class="input" />
            </FormField>
            <FormField label="Ciudad residencia">
              <input v-model="form.solicitante.ciudad_residencia" class="input" />
            </FormField>
            <FormField label="País residencia">
              <input v-model="form.solicitante.pais_residencia" class="input" />
            </FormField>
            <FormField label="Teléfono fijo (opcional)">
              <input v-model="form.solicitante.telefono_fijo" class="input" />
            </FormField>
            <FormField label="Teléfono móvil">
              <input v-model="form.solicitante.telefono_movil" class="input" />
            </FormField>
            <FormField label="Email">
              <input v-model="form.solicitante.email" type="email" class="input" />
            </FormField>

            <FormField label="Tipo vivienda">
              <select v-model="form.solicitante.tipo_vivienda" class="input">
                <option value="propia">propia</option>
                <option value="familiar">familiar</option>
                <option value="arrendada">arrendada</option>
              </select>
            </FormField>

            <label class="flex items-center gap-2 text-sm">
              <input v-model="form.solicitante.vive_con_nucleo_familiar" type="checkbox" class="h-4 w-4" />
              Vive con núcleo familiar
            </label>

            <FormField label="Personas a cargo">
              <input v-model.number="form.solicitante.personas_a_cargo" type="number" min="0" class="input" />
            </FormField>
          </div>
        </template>

        <template v-else-if="steps[step]?.key === 'conyuge'">
          <div class="grid gap-4">
            <label class="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                class="h-4 w-4"
                :checked="!!form.conyuge"
                @change="(ev) => toggleConyuge((ev.target as HTMLInputElement).checked)"
              />
              Incluir datos del cónyuge
            </label>

            <div v-if="form.conyuge" class="grid gap-4 sm:grid-cols-2">
              <FormField label="Identificación">
                <input v-model="form.conyuge.identificacion" class="input" />
              </FormField>
              <FormField label="Nombres y apellidos">
                <input v-model="form.conyuge.nombres_apellidos" class="input" />
              </FormField>
              <FormField label="Ingresos laborales">
                <input v-model.number="form.conyuge.ingresos_laborales" type="number" min="0" class="input" />
              </FormField>
              <label class="flex items-center gap-2 text-sm">
                <input v-model="form.conyuge.trabaja" type="checkbox" class="h-4 w-4" />
                Trabaja
              </label>
              <FormField label="Teléfono móvil">
                <input v-model="form.conyuge.telefono_movil" class="input" />
              </FormField>

              <div class="sm:col-span-2 mt-2 text-sm font-semibold text-zinc-700">Empresa (opcional)</div>
              <label class="sm:col-span-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  class="h-4 w-4"
                  :checked="!!form.conyuge.empresa"
                  @change="(ev) => toggleEmpresaConyuge((ev.target as HTMLInputElement).checked)"
                />
                Incluir empresa
              </label>

              <template v-if="form.conyuge.empresa">
                <FormField label="Nombre" class="sm:col-span-2">
                  <input v-model="form.conyuge.empresa.nombre" class="input" />
                </FormField>
                <FormField label="Dirección" class="sm:col-span-2">
                  <input v-model="form.conyuge.empresa.direccion" class="input" />
                </FormField>
                <FormField label="Teléfono">
                  <input v-model="form.conyuge.empresa.telefono" class="input" />
                </FormField>
                <FormField label="Email">
                  <input v-model="form.conyuge.empresa.email" type="email" class="input" />
                </FormField>
              </template>
            </div>
          </div>
        </template>

        <template v-else-if="steps[step]?.key === 'laboral'">
          <div class="grid gap-4 sm:grid-cols-2">
            <FormField label="Razón social">
              <input v-model="form.informacion_laboral.empresa_razon_social" class="input" />
            </FormField>
            <FormField label="NIT">
              <input v-model="form.informacion_laboral.empresa_nit" class="input" />
            </FormField>
            <FormField label="Teléfono">
              <input v-model="form.informacion_laboral.empresa_telefono" class="input" />
            </FormField>
            <FormField label="Dirección">
              <input v-model="form.informacion_laboral.empresa_direccion" class="input" />
            </FormField>
            <FormField label="Ciudad">
              <input v-model="form.informacion_laboral.empresa_ciudad" class="input" />
            </FormField>
            <FormField label="Cargo">
              <input v-model="form.informacion_laboral.cargo" class="input" />
            </FormField>
            <FormField label="Fecha ingreso">
              <input v-model="form.informacion_laboral.fecha_ingreso" type="date" class="input" />
            </FormField>
            <FormField label="Tipo contrato">
              <input v-model="form.informacion_laboral.tipo_contrato" class="input" />
            </FormField>
            <FormField label="Nombramiento / Pagador">
              <input v-model="form.informacion_laboral.nombramiento_o_pagador" class="input" />
            </FormField>
            <FormField label="Tiempo servicio">
              <input v-model.number="form.informacion_laboral.tiempo_servicio" type="number" min="0" class="input" />
            </FormField>
            <FormField label="Unidad">
              <select v-model="form.informacion_laboral.tiempo_servicio_unidad" class="input">
                <option value="meses">meses</option>
                <option value="anios">anios</option>
              </select>
            </FormField>
          </div>
        </template>

        <template v-else-if="steps[step]?.key === 'ingresos'">
          <div class="grid gap-4 sm:grid-cols-2">
            <FormField label="Salario básico mensual">
              <input v-model.number="form.ingresos_descuentos.salario_basico_mensual" type="number" min="0" class="input" />
            </FormField>
            <FormField label="Subsidio transporte">
              <input v-model.number="form.ingresos_descuentos.subsidio_transporte" type="number" min="0" class="input" />
            </FormField>
            <FormField label="Horas extras">
              <input v-model.number="form.ingresos_descuentos.horas_extras" type="number" min="0" class="input" />
            </FormField>
            <FormField label="Comisiones">
              <input v-model.number="form.ingresos_descuentos.comisiones" type="number" min="0" class="input" />
            </FormField>
            <FormField label="Otros ingresos">
              <input v-model.number="form.ingresos_descuentos.otros_ingresos" type="number" min="0" class="input" />
            </FormField>
            <FormField label="Total ingresos">
              <input v-model.number="form.ingresos_descuentos.total_ingresos" type="number" min="0" class="input" />
            </FormField>

            <div class="col-span-full mt-2 text-sm font-semibold text-zinc-700">Descuentos</div>

            <FormField label="Salud y pensión">
              <input v-model.number="form.ingresos_descuentos.salud_pension" type="number" min="0" class="input" />
            </FormField>
            <FormField label="Libranzas Comfaca">
              <input v-model.number="form.ingresos_descuentos.libranzas_comfaca" type="number" min="0" class="input" />
            </FormField>
            <FormField label="Otras libranzas">
              <input v-model.number="form.ingresos_descuentos.otras_libranzas" type="number" min="0" class="input" />
            </FormField>
            <FormField label="Judiciales">
              <input v-model.number="form.ingresos_descuentos.judiciales" type="number" min="0" class="input" />
            </FormField>
            <FormField label="Otras deducciones">
              <input v-model.number="form.ingresos_descuentos.otras_deducciones" type="number" min="0" class="input" />
            </FormField>
            <FormField label="Total descuentos">
              <input v-model.number="form.ingresos_descuentos.total_descuentos" type="number" min="0" class="input" />
            </FormField>

            <FormField label="Total neto recibido">
              <input v-model.number="form.ingresos_descuentos.total_neto_recibido" type="number" min="0" class="input" />
            </FormField>

            <div class="col-span-full">
              <button
                class="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50"
                type="button"
                @click="autocalcularIngresos"
              >
                Autocalcular totales
              </button>
            </div>
          </div>
        </template>

        <template v-else-if="steps[step]?.key === 'economica'">
          <div class="grid gap-4 sm:grid-cols-2">
            <FormField label="Arrendamientos">
              <input v-model.number="form.informacion_economica.arrendamientos" type="number" min="0" class="input" />
            </FormField>
            <FormField label="Otros ingresos">
              <input v-model.number="form.informacion_economica.otros" type="number" min="0" class="input" />
            </FormField>
            <FormField label="Descripción otros ingresos" class="sm:col-span-2">
              <textarea v-model="form.informacion_economica.descripcion" class="input min-h-24"></textarea>
            </FormField>

            <FormField label="Total gastos">
              <input v-model.number="form.informacion_economica.total_gastos" type="number" min="0" class="input" />
            </FormField>
            <FormField label="Descripción gastos" class="sm:col-span-2">
              <textarea v-model="form.informacion_economica.gastos_descripcion" class="input min-h-24"></textarea>
            </FormField>

            <FormField label="Total activos">
              <input v-model.number="form.informacion_economica.total_activos" type="number" min="0" class="input" />
            </FormField>
            <FormField label="Total pasivos">
              <input v-model.number="form.informacion_economica.total_pasivos" type="number" min="0" class="input" />
            </FormField>
          </div>
        </template>

        <template v-else-if="steps[step]?.key === 'propiedades'">
          <div class="flex items-center justify-between">
            <div class="text-sm font-semibold text-zinc-700">Propiedades</div>
            <button
              class="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50"
              type="button"
              @click="addPropiedad"
            >
              Agregar
            </button>
          </div>

          <div v-if="form.propiedades.length === 0" class="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-600">
            Sin propiedades.
          </div>

          <div v-for="(p, idx) in form.propiedades" :key="idx" class="rounded-xl border border-zinc-200 p-4">
            <div class="mb-3 flex items-center justify-between">
              <div class="text-sm font-semibold">Propiedad #{{ idx + 1 }}</div>
              <button class="text-sm text-red-600 hover:underline" type="button" @click="removePropiedad(idx)">
                Eliminar
              </button>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <FormField label="Tipo bien">
                <select v-model="p.tipo_bien" class="input">
                  <option value="vivienda">vivienda</option>
                  <option value="vehiculo">vehiculo</option>
                </select>
              </FormField>
              <FormField label="Ciudad">
                <input v-model="p.ciudad" class="input" />
              </FormField>
              <FormField label="Descripción" class="sm:col-span-2">
                <input v-model="p.descripcion" class="input" />
              </FormField>

              <FormField v-if="p.tipo_bien === 'vivienda'" label="Matrícula inmobiliaria">
                <input v-model="p.matricula_inmobiliaria" class="input" />
              </FormField>
              <FormField v-else label="Modelo o matrícula">
                <input v-model="p.modelo_o_matricula" class="input" />
              </FormField>

              <FormField label="Valor comercial">
                <input v-model.number="p.valor_comercial" type="number" min="0" class="input" />
              </FormField>
            </div>
          </div>
        </template>

        <template v-else-if="steps[step]?.key === 'deudas'">
          <div class="flex items-center justify-between">
            <div class="text-sm font-semibold text-zinc-700">Deudas</div>
            <button
              class="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50"
              type="button"
              @click="addDeuda"
            >
              Agregar
            </button>
          </div>

          <div v-if="form.deudas.length === 0" class="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-600">
            Sin deudas.
          </div>

          <div v-for="(d, idx) in form.deudas" :key="idx" class="rounded-xl border border-zinc-200 p-4">
            <div class="mb-3 flex items-center justify-between">
              <div class="text-sm font-semibold">Deuda #{{ idx + 1 }}</div>
              <button class="text-sm text-red-600 hover:underline" type="button" @click="removeDeuda(idx)">
                Eliminar
              </button>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <FormField label="Acreedor">
                <input v-model="d.acreedor_nombre" class="input" />
              </FormField>
              <FormField label="Concepto">
                <input v-model="d.concepto" class="input" />
              </FormField>
              <FormField label="Valor cuota">
                <input v-model.number="d.valor_cuota" type="number" min="0" class="input" />
              </FormField>
              <FormField label="Saldo obligación">
                <input v-model.number="d.saldo_obligacion" type="number" min="0" class="input" />
              </FormField>
            </div>
          </div>
        </template>

        <template v-else-if="steps[step]?.key === 'referencias'">
          <div class="grid gap-6">
            <div>
              <div class="mb-3 flex items-center justify-between">
                <div class="text-sm font-semibold text-zinc-700">Referencias familiares</div>
                <button
                  class="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50"
                  type="button"
                  @click="addReferencia('familiares')"
                >
                  Agregar
                </button>
              </div>

              <div v-if="form.referencias.familiares.length === 0" class="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-600">
                Sin referencias familiares.
              </div>

              <div
                v-for="(r, idx) in form.referencias.familiares"
                :key="`f-${idx}`"
                class="mb-3 rounded-xl border border-zinc-200 p-4"
              >
                <div class="mb-3 flex items-center justify-between">
                  <div class="text-sm font-semibold">Familiar #{{ idx + 1 }}</div>
                  <button class="text-sm text-red-600 hover:underline" type="button" @click="removeReferencia('familiares', idx)">
                    Eliminar
                  </button>
                </div>
                <div class="grid gap-4 sm:grid-cols-2">
                  <FormField label="Nombre y apellidos">
                    <input v-model="r.nombre_apellidos" class="input" />
                  </FormField>
                  <FormField label="Celular">
                    <input v-model="r.celular" class="input" />
                  </FormField>
                </div>
              </div>
            </div>

            <div>
              <div class="mb-3 flex items-center justify-between">
                <div class="text-sm font-semibold text-zinc-700">Referencias personales</div>
                <button
                  class="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50"
                  type="button"
                  @click="addReferencia('personales')"
                >
                  Agregar
                </button>
              </div>

              <div v-if="form.referencias.personales.length === 0" class="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-600">
                Sin referencias personales.
              </div>

              <div
                v-for="(r, idx) in form.referencias.personales"
                :key="`p-${idx}`"
                class="mb-3 rounded-xl border border-zinc-200 p-4"
              >
                <div class="mb-3 flex items-center justify-between">
                  <div class="text-sm font-semibold">Personal #{{ idx + 1 }}</div>
                  <button class="text-sm text-red-600 hover:underline" type="button" @click="removeReferencia('personales', idx)">
                    Eliminar
                  </button>
                </div>
                <div class="grid gap-4 sm:grid-cols-2">
                  <FormField label="Nombre y apellidos">
                    <input v-model="r.nombre_apellidos" class="input" />
                  </FormField>
                  <FormField label="Celular">
                    <input v-model="r.celular" class="input" />
                  </FormField>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="steps[step]?.key === 'revision'">
          <div class="grid gap-4">
            <div class="rounded-lg bg-zinc-50 p-4">
              <div class="mb-2 text-sm font-semibold text-zinc-700">Payload (JSON)</div>
              <pre class="overflow-auto text-xs text-zinc-800">{{ prettyPayload }}</pre>
            </div>

            <div v-if="xmlText" class="rounded-lg bg-zinc-50 p-4">
              <div class="mb-2 flex items-center justify-between">
                <div class="text-sm font-semibold text-zinc-700">XML generado</div>
                <button
                  class="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50"
                  type="button"
                  @click="() => downloadXml()"
                >
                  Descargar
                </button>
              </div>
              <div v-if="savedFilename" class="mb-2 text-xs text-emerald-700">
                Guardado en: {{ savedFilename }}
              </div>
              <pre class="overflow-auto text-xs text-zinc-800">{{ xmlText }}</pre>
            </div>

            <div v-if="errorMsg" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {{ errorMsg }}
            </div>
          </div>
        </template>
      </form>
    </div>

    <Teleport to="body">
      <div v-if="successModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button class="absolute inset-0 bg-black/40" type="button" @click="closeSuccessModal" />
        <div class="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl" @click.stop>
          <div class="text-lg font-semibold text-zinc-900">Solicitud creada con éxito</div>
          <div class="mt-2 text-sm text-zinc-600">
            Tu solicitud fue enviada y quedó en estado
            <span class="font-medium text-zinc-900">Postulado</span>.
          </div>
          <div v-if="createdSolicitudId" class="mt-3 text-sm text-zinc-700">
            <span class="font-medium">ID:</span>
            <span class="ml-1 font-mono text-xs">{{ createdSolicitudId }}</span>
          </div>
          <div v-if="savedFilename" class="mt-2 text-sm text-zinc-700">
            <span class="font-medium">XML:</span>
            <span class="ml-1">{{ savedFilename }}</span>
          </div>
          <div class="mt-6 flex items-center justify-end gap-2">
            <button
              class="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
              type="button"
              @click="goToHome"
            >
              Ver mis solicitudes
            </button>
            <button
              v-if="savedFilename"
              class="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
              type="button"
              @click="goToFirmas"
            >
              Firmar ahora
            </button>
            <button
              class="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              type="button"
              @click="closeSuccessModal"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import FormField from '~/components/shared/FormField.vue'
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
