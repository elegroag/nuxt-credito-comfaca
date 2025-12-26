# Comfaca Crédito - Frontend

Aplicación móvil para el sistema de postulación a créditos de Comfaca, desarrollada con Nuxt 4 y Capacitor.

## Características

- Aplicación móvil híbrida con Nuxt 4 + Capacitor
- Autenticación de usuarios y gestión de sesiones
- Captura de documentos con cámara
- Almacenamiento local con SQLite
- Generación y compartición de códigos QR
- Simulador de créditos
- Gestión de firmas digitales

## Tecnologías

- **Framework**: Nuxt 4
- **Runtime**: Nitro
- **Gestor de paquetes**: pnpm
- **Estilos**: TailwindCSS + DaisyUI
- **Iconos**: Heroicons
- **Base de datos local**: Capacitor Data Storage SQLite
- **Móvil**: Capacitor (iOS/Android)

## Requisitos Previos

- Node.js 18+
- pnpm
- Android Studio (para desarrollo Android)
- Xcode (para desarrollo iOS)

## Instalación

```bash
# Clonar el repositorio
git clone <repositorio>
cd comfaca-credito/frontend

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env-example .env
# Editar .env con la URL del backend
```

## Desarrollo

```bash
# Iniciar servidor de desarrollo
pnpm dev

# Ejecutar en dispositivo Android (USB)
pnpm cap:android:usb

# Ejecutar en emulador Android
pnpm cap:android:emulator

# Ejecutar en dispositivo iOS
pnpm cap:run:ios
```

## Scripts Disponibles

- `pnpm dev` - Servidor de desarrollo
- `pnpm build` - Construcción para producción
- `pnpm preview` - Vista previa de producción
- `pnpm cap:sync` - Sincronizar con Capacitor
- `pnpm cap:run:android` - Ejecutar en Android
- `pnpm cap:run:ios` - Ejecutar en iOS

## Estructura del Proyecto

````
frontend/

# Comfaca Crédito - Frontend

Aplicación móvil para el sistema de postulación a créditos de Comfaca.

## Características

- Aplicación móvil híbrida con Nuxt 4 + Capacitor
- Autenticación de usuarios y gestión de sesiones
- Captura de documentos con cámara
- Almacenamiento local con SQLite
- Generación y compartición de códigos QR
- Simulador de créditos
- Gestión de firmas digitales

## Tecnologías

- **Framework**: Nuxt 4
- **Runtime**: Nitro
- **Gestor de paquetes**: pnpm
- **Estilos**: TailwindCSS + DaisyUI
- **Iconos**: Heroicons
- **Base de datos local**: Capacitor Data Storage SQLite
- **Móvil**: Capacitor (iOS/Android)

## Requisitos Previos

- Node.js 18+
- pnpm
- Android Studio (para desarrollo Android)
- Xcode (para desarrollo iOS)

## Instalación

```bash
# Clonar el repositorio
git clone <repositorio>
cd comfaca-credito/frontend

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env-example .env
# Editar .env con la URL del backend
````

## Desarrollo

```bash
# Iniciar servidor de desarrollo
pnpm dev

# Ejecutar en dispositivo Android (USB)
pnpm cap:android:usb

# Ejecutar en emulador Android
pnpm cap:android:emulator

# Ejecutar en dispositivo iOS
pnpm cap:run:ios
```

## Scripts Disponibles

- `pnpm dev` - Servidor de desarrollo
- `pnpm build` - Construcción para producción
- `pnpm preview` - Vista previa de producción
- `pnpm cap:sync` - Sincronizar con Capacitor
- `pnpm cap:run:android` - Ejecutar en Android
- `pnpm cap:run:ios` - Ejecutar en iOS

## Configuración

Variables de entorno en [.env](cci:7://file:///home/elegro/proyectos/python/comfaca-credito/frontend/.env:0:0-0:0):

```
NUXT_BACKEND_BASE_URL=http://0.0.0.0:5000
```

## Licencia

© 2025 Comfaca - Todos los derechos reservados
