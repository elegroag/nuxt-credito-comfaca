## Completar el proceso de solicitud de crédito

### Pasar a cargar la documentacion necesaria

- [] Es necesario cargar la documentación necesaria para completar el proceso de solicitud de crédito.
- [] Los documentos requeridos estan asociados coon la modalidad del credito, que está en el localStorage, key: simulador_data, valor: lineaCredito.documentos lo cual representa una lista de documentos requeridos.
- [] Es necesario antes de retornar al inicio del sistema, al dar enviar el XML y confirmar por medio de un modal @SuccessModal, se debe pasar a la page de /documentos, donde se enviar de forma dinamica id collection de la solicitud de credito.
- [] Una vez cargue la page de /documentos, se debe consultar a la API, usando el composable de useApi, los datos de modalidad de credito y la data asociada a la solicitud de credito, para obtener los documentos requeridos.
- [] Con los datos consultados la modalidad de credito, se debe mostrar campos de cargue de documentos, los cuales estan asociados a la modalidad de credito.

### Proceso de firmado de documento de solicitud de crédito.

- [] Es necesario una vez se cargue los documentos pasar a aplicar la firma digital del documento electronico XML.
- [] Es necesario pasar a la page de /firmado, donde se enviar de forma dinamica id collection de la solicitud de credito.
- [] Una vez cargue la page de /firmado, se debe consultar a la API, usando el composable de useApi, los datos de modalidad de credito y la data asociada a la solicitud de credito, para obtener los documentos requeridos.
- [] Al finalizar el firmado del documento, se debe hacer envio de solicitud de credito a la API, usando el composable de useApi, para finalizar el proceso de solicitud de crédito.
