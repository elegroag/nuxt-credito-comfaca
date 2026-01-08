## Datos de usaurio y trabajador en sesión.

- Al momento de hacer login tenemos la data del usuario y del trabajador, es necesario almacenar en sotage local la informacion del trabajador para poder acceder a ella en cualquier momento.

## Reponse de login

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjb21mYWNhLWNyZWRpdG8iLCJzdWIiOiJlbGVncm8iLCJyb2xlcyI6WyJ1c2VyIl0sImlhdCI6MTc2NzgwNTYzMCwiZXhwIjoxNzY3ODkyMDMwfQ.0lR--YNplQWZkpOt9IhJvJTRo6SgnMhLgYNqX5aEeeU",
  "token_type": "bearer",
  "user": {
    "apellidos": "legro agudelo",
    "email": "maxedwwin@gmail.com",
    "nombres": "edwin andres",
    "numero_documento": "1110491951",
    "roles": ["user"],
    "telefono": null,
    "tipo_documento": "CC",
    "trabajador": {
      "cargo": "2519",
      "cedula": "1110491951",
      "ciudad_codigo": "18001",
      "ciudad_nacimiento": "73001",
      "direccion": "CR 2 13 49 BRR ABBAS TURBAY",
      "email": "maxedwwin@gmail.com",
      "empresa": {
        "ciudad_codigo": "18001",
        "direccion": "CR 11 10 34 BRR LA COOPERATIVA",
        "nit": "891190047",
        "razon_social": "CAJA DE COMPENSACION FAMILIAR DEL CAQUETA",
        "telefono": "6084366300"
      },
      "estado": "A",
      "estado_civil": "4",
      "fecha_afiliacion": "2025-01-07",
      "fecha_nacimiento": "1989-12-19",
      "fecha_salario": "2025-02-01",
      "nivel_educativo": "10",
      "primer_apellido": "LEGRO",
      "primer_nombre": "EDWIN",
      "salario": 3847500,
      "segundo_apellido": "AGUDELO",
      "segundo_nombre": "ANDRES",
      "sexo": "M",
      "telefono": "3157145942",
      "tipo_documento": "1"
    },
    "username": "elegro"
  }
}
```
