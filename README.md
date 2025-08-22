# Portal Alimentos y Bebidas (AyB)

## Descripción del Proyecto

Este frontend forma parte de un proyecto completo de Alimentos y Bebidas que utiliza un backend en Python y una base de datos PostgreSQL. En el frontend, aprovechamos las nuevas características de Angular 20 junto con Angular Material para crear una interfaz de usuario.

## Estructura del Proyecto

```
AMX-CXL-APP-CL-AYB-WEB/
├── .angular/                    # Cache de Angular CLI
├── .github/                     # Workflows de GitHub Actions
│   └── workflows/
│       └── veracode-scan-javascript.yml
├── public/                      # Archivos públicos estáticos
│   └── favicon.ico
├── src/                         # Código fuente de la aplicación
│   ├── app/                     # Módulos y componentes principales
│   │   ├── data/                # Modelos y tipos de datos
│   │   ├── modules/             # Módulos de funcionalidad
│   │   ├── security/            # Módulos de seguridad
│   │   ├── services/            # Servicios de la aplicación
│   │   ├── app-module.ts        # Módulo principal
│   │   ├── app.config.ts        # Configuración de la app
│   │   ├── app.html             # Template principal
│   │   ├── app.routes.ts        # Configuración de rutas
│   │   ├── app.scss             # Estilos principales
│   │   ├── app.spec.ts          # Tests del componente principal
│   │   └── app.ts               # Componente principal
│   ├── assets/                  # Recursos estáticos
│   │   ├── fonts/               # Fuentes tipográficas
│   │   └── images/              # Imágenes
│   ├── environments/            # Configuraciones por ambiente
│   │   ├── environment.ts       # Ambiente local
│   │   ├── environment.dev.ts   # Ambiente desarrollo
│   │   ├── environment.qa.ts    # Ambiente QA
│   │   └── environment.prod.ts  # Ambiente producción
│   ├── index.html               # Página principal HTML
│   ├── main.ts                  # Punto de entrada de la aplicación
│   └── styles.scss              # Estilos globales
├── angular.json                 # Configuración de Angular CLI
├── package.json                 # Dependencias y scripts
├── tsconfig.json                # Configuración TypeScript
├── tsconfig.app.json            # Configuración TS para la app
└── tsconfig.spec.json           # Configuración TS para tests
```

## Comandos para Ejecutar el Proyecto

### Ambiente Local
```bash
ng serve
# o
ng serve --configuration=development
```
URL: `http://localhost:4200`

### Ambiente Desarrollo (DEV)
```bash
ng serve --configuration=dev
```

### Ambiente QA
```bash
ng serve --configuration=qa
```

### Ambiente Producción (PROD)
```bash
ng serve --configuration=production
```

## Comandos para Compilar el Proyecto

### Ambiente Local/Desarrollo
```bash
ng build
# o
ng build --configuration=development
```

### Ambiente Desarrollo (DEV)
```bash
ng build --configuration=dev
```

### Ambiente QA
```bash
ng build --configuration=qa
```

### Ambiente Producción (PROD)
```bash
ng build --configuration=production
```

## Información Adicional

- **Versión Angular**: 20.1.6
- **Versión Angular Material**: 20.1.5
- **Framework UI**: Angular Material
- **Lenguaje**: TypeScript
- **Preprocesador CSS**: SCSS
- **Directorio de Build**: `dist/`
- **Versión NodeJS**: 20.19.2

## Scripts Disponibles

Revisa el archivo `package.json` para ver todos los scripts disponibles:
```bash
npm run <script-name>
```

## Instalación de Dependencias

```bash
npm install
```

## Tests

### Tests Unitarios
```bash
ng test
```

### Tests E2E
```bash
ng e2e
```