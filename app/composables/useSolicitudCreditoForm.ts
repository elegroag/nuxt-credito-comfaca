import type {
    SolicitudCreditoPayload,
    RolEnSolicitud,
    TipoIdentificacion,
    ProductoTipo,
    NivelEducativo,
    TipoVivienda,
    TiempoServicioUnidad,
    TipoBien
} from '~/shared/types/solicitud-credito'

export const useSolicitudCreditoForm = () => {
    const form = useState<SolicitudCreditoPayload>('solicitudCreditoForm', () => ({
        version: '1.0',
        encabezado: {
            fecha_radicado: ''
        },
        solicitud: {
            numero_solicitud: '',
            numero_comprobante: '',
            valor_solicitud: 0,
            categoria: '',
            rol_en_solicitud: 'solicitante',
            valor_solicitado: 0,
            plazo_meses: 0,
            moneda: 'COP',
            tipcre: '',
            modxml4: 0,
            detalle_modalidad: '',
            foto_documento: { url: '' }
        },
        producto_solicitado: {
            tipo: 'vivienda',
            ha_tenido_credito_comfaca: false
        },
        solicitante: {
            fecha_vinculacion: '',
            tipo_identificacion: 'CC',
            numero_identificacion: '',
            fecha_nacimiento: '',
            pais_nacimiento: '',
            nombres_apellidos: '',
            fecha_expedicion_documento: '',
            profesion_ocupacion: '',
            sexo: 'M',
            nivel_educativo: 'universitario',
            barrio_residencia: '',
            ciudad_residencia: '',
            pais_residencia: '',
            telefono_fijo: '',
            telefono_movil: '',
            email: '',
            tipo_vivienda: 'propia',
            vive_con_nucleo_familiar: true,
            personas_a_cargo: 0
        },
        conyuge: undefined,
        informacion_laboral: {
            empresa_razon_social: '',
            empresa_nit: '',
            empresa_telefono: '',
            empresa_direccion: '',
            empresa_ciudad: '',
            cargo: '',
            fecha_ingreso: '',
            tipo_contrato: '',
            nombramiento_o_pagador: '',
            tiempo_servicio: 0,
            tiempo_servicio_unidad: 'meses'
        },
        ingresos_descuentos: {
            moneda: 'COP',
            salario_basico_mensual: 0,
            subsidio_transporte: 0,
            horas_extras: 0,
            comisiones: 0,
            otros_ingresos: 0,
            total_ingresos: 0,
            salud_pension: 0,
            libranzas_comfaca: 0,
            otras_libranzas: 0,
            judiciales: 0,
            otras_deducciones: 0,
            total_descuentos: 0,
            total_neto_recibido: 0
        },
        informacion_economica: {
            moneda: 'COP',
            arrendamientos: 0,
            otros: 0,
            descripcion: '',
            total_gastos: 0,
            gastos_descripcion: '',
            total_activos: 0,
            total_pasivos: 0
        },
        propiedades: [],
        deudas: [],
        referencias: {
            familiares: [],
            personales: []
        }
    }))

    const toggleConyuge = (checked: boolean) => {
        if (!checked) {
            form.value.conyuge = undefined
            return
        }
        form.value.conyuge = {
            identificacion: '',
            nombres_apellidos: '',
            ingresos_laborales: 0,
            trabaja: false,
            telefono_movil: ''
        }
    }

    const toggleEmpresaConyuge = (checked: boolean) => {
        if (!form.value.conyuge) return
        if (!checked) {
            form.value.conyuge.empresa = undefined
            return
        }
        form.value.conyuge.empresa = {
            nombre: '',
            direccion: '',
            telefono: '',
            email: ''
        }
    }

    const autocalcularIngresos = () => {
        const ing = form.value.ingresos_descuentos
        ing.total_ingresos =
            Number(ing.salario_basico_mensual || 0) +
            Number(ing.subsidio_transporte || 0) +
            Number(ing.horas_extras || 0) +
            Number(ing.comisiones || 0) +
            Number(ing.otros_ingresos || 0)

        ing.total_descuentos =
            Number(ing.salud_pension || 0) +
            Number(ing.libranzas_comfaca || 0) +
            Number(ing.otras_libranzas || 0) +
            Number(ing.judiciales || 0) +
            Number(ing.otras_deducciones || 0)

        ing.total_neto_recibido = Math.max(ing.total_ingresos - ing.total_descuentos, 0)
    }

    const addPropiedad = () => {
        form.value.propiedades.push({
            tipo_bien: 'vivienda',
            descripcion: '',
            ciudad: '',
            matricula_inmobiliaria: '',
            valor_comercial: 0
        })
    }

    const removePropiedad = (idx: number) => {
        form.value.propiedades.splice(idx, 1)
    }

    const addDeuda = () => {
        form.value.deudas.push({
            acreedor_nombre: '',
            concepto: '',
            valor_cuota: 0,
            saldo_obligacion: 0
        })
    }

    const removeDeuda = (idx: number) => {
        form.value.deudas.splice(idx, 1)
    }

    const addReferencia = (kind: 'familiares' | 'personales') => {
        form.value.referencias[kind].push({ nombre_apellidos: '', celular: '' })
    }

    const removeReferencia = (kind: 'familiares' | 'personales', idx: number) => {
        form.value.referencias[kind].splice(idx, 1)
    }

    const reset = () => {
        form.value = {
            version: '1.0',
            encabezado: {
                fecha_radicado: ''
            },
            solicitud: {
                numero_solicitud: '',
                numero_comprobante: '',
                valor_solicitud: 0,
                categoria: '',
                rol_en_solicitud: 'solicitante',
                valor_solicitado: 0,
                plazo_meses: 0,
                moneda: 'COP',
                foto_documento: { url: '' }
            },
            producto_solicitado: {
                tipo: 'vivienda',
                ha_tenido_credito_comfaca: false
            },
            solicitante: {
                fecha_vinculacion: '',
                tipo_identificacion: 'CC',
                numero_identificacion: '',
                fecha_nacimiento: '',
                pais_nacimiento: '',
                nombres_apellidos: '',
                fecha_expedicion_documento: '',
                profesion_ocupacion: '',
                sexo: 'M',
                nivel_educativo: 'universitario',
                barrio_residencia: '',
                ciudad_residencia: '',
                pais_residencia: '',
                telefono_fijo: '',
                telefono_movil: '',
                email: '',
                tipo_vivienda: 'propia',
                vive_con_nucleo_familiar: true,
                personas_a_cargo: 0
            },
            conyuge: undefined,
            informacion_laboral: {
                empresa_razon_social: '',
                empresa_nit: '',
                empresa_telefono: '',
                empresa_direccion: '',
                empresa_ciudad: '',
                cargo: '',
                fecha_ingreso: '',
                tipo_contrato: '',
                nombramiento_o_pagador: '',
                tiempo_servicio: 0,
                tiempo_servicio_unidad: 'meses'
            },
            ingresos_descuentos: {
                moneda: 'COP',
                salario_basico_mensual: 0,
                subsidio_transporte: 0,
                horas_extras: 0,
                comisiones: 0,
                otros_ingresos: 0,
                total_ingresos: 0,
                salud_pension: 0,
                libranzas_comfaca: 0,
                otras_libranzas: 0,
                judiciales: 0,
                otras_deducciones: 0,
                total_descuentos: 0,
                total_neto_recibido: 0
            },
            informacion_economica: {
                moneda: 'COP',
                arrendamientos: 0,
                otros: 0,
                descripcion: '',
                total_gastos: 0,
                gastos_descripcion: '',
                total_activos: 0,
                total_pasivos: 0
            },
            propiedades: [],
            deudas: [],
            referencias: {
                familiares: [],
                personales: []
            }
        }
    }

    return {
        form,
        toggleConyuge,
        toggleEmpresaConyuge,
        autocalcularIngresos,
        addPropiedad,
        removePropiedad,
        addDeuda,
        removeDeuda,
        addReferencia,
        removeReferencia,
        reset
    }
}

