# Líneas de Crédito - Estructura de Datos

## Campos del Sistema

| Campo   | Descripción                        |
| ------- | ---------------------------------- |
| tipcre  | Tipo de crédito                    |
| codcre  | Código de crédito                  |
| detalle | Detalle del crédito                |
| modxml4 | Modalidad Circular 0007 de 2019    |
| tipfin  | Tipo de financiamiento             |
| pagseg  | Requiere de pago de seguro         |
| codcap  | Código de distribución capital     |
| codint  | Código de distribución interés     |
| codmor  | Código de distribución mora        |
| repdcr  | Reporta a data-crédito             |
| codcon  | Concepto Pignoración Subsidio      |
| codser  | Concepto en Servicios              |
| numcuo  | Número de cuotas                   |
| estcre  | Valor estudio crédito              |
| auxest  | Código auxiliar de estudio crédito |
| estado  | Estado                             |
| codcen  | Centro de costos                   |

### Datos de entrada

```json
{
  "status": true,
  "message": "Tipos de creditos obtenidos exitosamente",
  "data": [
    {
      "tipcre": "01",
      "codcre": "01",
      "detalle": "CREDITO LIBRE INVERSION",
      "modxml4": 1,
      "tipfin": "F",
      "pagseg": "S",
      "codcap": "001",
      "codint": "002",
      "codmor": "003",
      "repdcr": "S",
      "codcon": "06",
      "codser": "2",
      "numcuo": 60,
      "estcre": 42705,
      "auxest": "13171040",
      "estado": "I",
      "codcen": "1750501"
    },
    {
      "tipcre": "014",
      "codcre": "01",
      "detalle": "CREDITO SALUD",
      "modxml4": 4,
      "tipfin": "F",
      "pagseg": "S",
      "codcap": "079",
      "codint": "080",
      "codmor": "081",
      "repdcr": "S",
      "codcon": "06",
      "codser": "2",
      "numcuo": 36,
      "estcre": 42705,
      "auxest": "131010100403",
      "estado": "A",
      "codcen": "1750501"
    },
    {
      "tipcre": "02",
      "codcre": "01",
      "detalle": "EDUCACION SUPERIOR",
      "modxml4": 3,
      "tipfin": "F",
      "pagseg": "S",
      "codcap": "007",
      "codint": "008",
      "codmor": "009",
      "repdcr": "S",
      "codcon": "06",
      "codser": "2",
      "numcuo": 60,
      "estcre": 42705,
      "auxest": "131010100403",
      "estado": "A",
      "codcen": "1750501"
    },
    {
      "tipcre": "03",
      "codcre": "01",
      "detalle": "EDUCACION NO FORMAL",
      "modxml4": 3,
      "tipfin": "F",
      "pagseg": "S",
      "codcap": "013",
      "codint": "014",
      "codmor": "014",
      "repdcr": "S",
      "codcon": "06",
      "codser": "2",
      "numcuo": 24,
      "estcre": 42705,
      "auxest": "131010100403",
      "estado": "A",
      "codcen": "1750501"
    },
    {
      "tipcre": "04",
      "codcre": "01",
      "detalle": "CREDITO VEHICULO",
      "modxml4": 7,
      "tipfin": "F",
      "pagseg": "S",
      "codcap": "019",
      "codint": "020",
      "codmor": "021",
      "repdcr": "S",
      "codcon": "06",
      "codser": "2",
      "numcuo": 60,
      "estcre": 42705,
      "auxest": "131010100403",
      "estado": "I",
      "codcen": "1750501"
    },
    {
      "tipcre": "05",
      "codcre": "01",
      "detalle": "TURISMO",
      "modxml4": 9,
      "tipfin": "F",
      "pagseg": "S",
      "codcap": "025",
      "codint": "026",
      "codmor": "027",
      "repdcr": "S",
      "codcon": "06",
      "codser": "2",
      "numcuo": 60,
      "estcre": 42705,
      "auxest": "131010100403",
      "estado": "A",
      "codcen": "1750501"
    },
    {
      "tipcre": "06",
      "codcre": "01",
      "detalle": "VIVIENDA COMPRA",
      "modxml4": 5,
      "tipfin": "F",
      "pagseg": "S",
      "codcap": "031",
      "codint": "032",
      "codmor": "033",
      "repdcr": "S",
      "codcon": "06",
      "codser": "2",
      "numcuo": 144,
      "estcre": 42705,
      "auxest": "131010100403",
      "estado": "A",
      "codcen": "1750501"
    },
    {
      "tipcre": "07",
      "codcre": "01",
      "detalle": "VIVIENDA CONSTRUCCIÓN EN SITIO PROPIO",
      "modxml4": 5,
      "tipfin": "F",
      "pagseg": "S",
      "codcap": "037",
      "codint": "038",
      "codmor": "039",
      "repdcr": "S",
      "codcon": "06",
      "codser": "2",
      "numcuo": 120,
      "estcre": 42705,
      "auxest": "131010100403",
      "estado": "A",
      "codcen": "1750501"
    },
    {
      "tipcre": "08",
      "codcre": "01",
      "detalle": "VIVIENDA REMODELACIÓN",
      "modxml4": 5,
      "tipfin": "F",
      "pagseg": "S",
      "codcap": "043",
      "codint": "044",
      "codmor": "045",
      "repdcr": "S",
      "codcon": "06",
      "codser": "2",
      "numcuo": 84,
      "estcre": 42705,
      "auxest": "131010100403",
      "estado": "A",
      "codcen": "1750501"
    },
    {
      "tipcre": "09",
      "codcre": "01",
      "detalle": "CREDIMPUESTO VEHICULO Y VIVIENDA",
      "modxml4": 7,
      "tipfin": "F",
      "pagseg": "S",
      "codcap": "049",
      "codint": "050",
      "codmor": "051",
      "repdcr": "S",
      "codcon": "06",
      "codser": "2",
      "numcuo": 8,
      "estcre": 42705,
      "auxest": "131010100403",
      "estado": "A",
      "codcen": "1750501"
    },
    {
      "tipcre": "10",
      "codcre": "01",
      "detalle": "CREDITO ELECTRODOMESTICO",
      "modxml4": 2,
      "tipfin": "F",
      "pagseg": "S",
      "codcap": "55",
      "codint": "056",
      "codmor": "057",
      "repdcr": "S",
      "codcon": "06",
      "codser": "2",
      "numcuo": 60,
      "estcre": 42705,
      "auxest": "131010100403",
      "estado": "A",
      "codcen": "1750501"
    },
    {
      "tipcre": "11",
      "codcre": "01",
      "detalle": "CREDITO PRODUCTOS DEL HOGAR",
      "modxml4": 2,
      "tipfin": "F",
      "pagseg": "S",
      "codcap": "061",
      "codint": "062",
      "codmor": "063",
      "repdcr": "S",
      "codcon": "06",
      "codser": "2",
      "numcuo": 72,
      "estcre": 42705,
      "auxest": "131010100403",
      "estado": "A",
      "codcen": "1750501"
    },
    {
      "tipcre": "12",
      "codcre": "01",
      "detalle": "CREDITO VESTUARIO",
      "modxml4": 2,
      "tipfin": "F",
      "pagseg": "S",
      "codcap": "067",
      "codint": "068",
      "codmor": "069",
      "repdcr": "S",
      "codcon": "06",
      "codser": "2",
      "numcuo": 36,
      "estcre": 42705,
      "auxest": "131010100403",
      "estado": "A",
      "codcen": "1750501"
    },
    {
      "tipcre": "13",
      "codcre": "01",
      "detalle": "CREDITO RECREACION",
      "modxml4": 2,
      "tipfin": "F",
      "pagseg": "S",
      "codcap": "073",
      "codint": "074",
      "codmor": "075",
      "repdcr": "S",
      "codcon": "06",
      "codser": "2",
      "numcuo": 48,
      "estcre": 42705,
      "auxest": "131010100403",
      "estado": "A",
      "codcen": "1750501"
    }
  ]
}
```

## Tipos De Creditos (Por modalidad XML4 Circular 0007 de 2019)

| Valor | Modalidad                           |
| ----- | ----------------------------------- |
| 1     | CREDITO LIBRE INVERSION             |
| 2     | CONSUMO DE BIENES Y SERVICIOS       |
| 3     | CREDITOS EDUCATIVOS                 |
| 4     | CREDITOS DE SALUD                   |
| 5     | CREDITOS DE VIVIENDA                |
| 6     | FOMENTO, EMPRENDIMIENTO EMPRESARIAL |
| 7     | OTROS CREDITOS                      |
| 8     | CREDITO DE MERCADEO                 |
| 9     | RECREACION Y TURISMO                |

## Tipos de Inversiones

```json
{
  "status": true,
  "message": "Tipos de inversiones obtenidos exitosamente",
  "data": [
    {
      "tipinv": "01",
      "detalle": "CONSUMO DE BIENES Y SERVICIOS"
    },
    {
      "tipinv": "02",
      "detalle": "VIVIENDA"
    },
    {
      "tipinv": "03",
      "detalle": "RECREACION Y TURISMO"
    },
    {
      "tipinv": "04",
      "detalle": "CREDITOS EDUCATIVOS"
    },
    {
      "tipinv": "05",
      "detalle": "CREDITOS DE SALUD"
    },
    {
      "tipinv": "06",
      "detalle": "OTROS"
    }
  ]
}
```

## Lineas de credito y especificaciones

```json
[
  {
    "id": 1,
    "linea_credito": "EDUCACION SUPERIOR (20 SMLMV)",
    "monto_maximo_pesos": 23200000,
    "plazo_maximo": "60 meses",
    "tasas_interes_anual": {
      "categoria_a": "10%",
      "categoria_b": "11%",
      "categoria_c": "14%"
    },
    "requisitos": [
      "Formulario de solicitud de crédito",
      "Fotocopia de cédula de ciudadanía al 150% del solicitante",
      "Desprendible de nómina de los dos últimos meses",
      "Certificado laboral (no mayor a 30 días)",
      "Comprobante para pago de matrícula",
      "Copia de un recibo de servicio público"
    ]
  },
  {
    "id": 2,
    "linea_credito": "LIBRE INVERSION (25 SMLMV)",
    "monto_maximo_pesos": 29000000,
    "plazo_maximo": "60 meses",
    "tasas_interes_anual": {
      "categoria_a": "12%",
      "categoria_b": "13%",
      "categoria_c": "15%"
    },
    "requisitos": [
      "Formulario de solicitud de crédito",
      "Fotocopia de cédula de ciudadanía al 150% del solicitante",
      "Desprendible de nómina de los dos últimos meses",
      "Certificado laboral (no mayor a 30 días)",
      "Copia de un recibo de servicio público"
    ]
  },
  {
    "id": 3,
    "linea_credito": "VIVIENDA REMODELACIÓN (30 SMLMV)",
    "monto_maximo_pesos": 34800000,
    "plazo_maximo": "84 meses",
    "tasas_interes_anual": {
      "categoria_a": "9%",
      "categoria_b": "10%",
      "categoria_c": "11%"
    },
    "requisitos": [
      "Formulario de solicitud de crédito",
      "Fotocopia de cédula de ciudadanía al 150% del solicitante",
      "Desprendible de nómina de los dos últimos meses",
      "Certificado laboral (no mayor a 30 días)",
      "Presupuesto de inversión en obra civil",
      "Certificado de libertad y tradición",
      "Certificado de riesgo no mitigable",
      "Copia de un recibo de servicio público"
    ]
  },
  {
    "id": 4,
    "linea_credito": "SALUD (15 SMLMV)",
    "monto_maximo_pesos": 17400000,
    "plazo_maximo": "48 meses",
    "tasas_interes_anual": {
      "categoria_a": "8%",
      "categoria_b": "9%",
      "categoria_c": "11%"
    },
    "requisitos": [
      "Formulario de solicitud de crédito",
      "Fotocopia de cédula de ciudadanía al 150% del solicitante",
      "Desprendible de nómina de los dos últimos meses",
      "Certificado laboral (no mayor a 30 días)",
      "Cotización del servicio médico o procedimiento",
      "Copia de un recibo de servicio público"
    ]
  },
  {
    "id": 5,
    "linea_credito": "TURISMO (10 SMLMV)",
    "monto_maximo_pesos": 11600000,
    "plazo_maximo": "36 meses",
    "tasas_interes_anual": {
      "categoria_a": "11%",
      "categoria_b": "12%",
      "categoria_c": "14%"
    },
    "requisitos": [
      "Formulario de solicitud de crédito",
      "Fotocopia de cédula de ciudadanía al 150% del solicitante",
      "Desprendible de nómina de los dos últimos meses",
      "Certificado laboral (no mayor a 30 días)",
      "Cotización del plan turístico o tiquetes",
      "Copia de un recibo de servicio público"
    ]
  }
]
```
