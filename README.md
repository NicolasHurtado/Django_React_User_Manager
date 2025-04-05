# Sistema de Gestión de Clientes y Proyectos

Sistema para gestionar clientes y sus respectivos proyectos desarrollado con Django y React.

## Características

- Autenticación de usuarios con JWT
- Gestión de clientes (CRUD)
- Gestión de proyectos (CRUD)
- Filtrado de proyectos por estado
- API RESTful con permisos por usuario
- Documentación interactiva de la API
- Pruebas automatizadas para todos los endpoints

## Estructura del Proyecto

```
user_manager/
├── backend/                  # Proyecto Django
│   ├── core/                 # App principal
│   │   ├── migrations/       # Migraciones de base de datos
│   │   ├── tests/            # Pruebas automatizadas
│   │   ├── admin.py          # Configuración del admin
│   │   ├── models.py         # Modelos de datos
│   │   ├── serializers.py    # Serializadores para la API
│   │   ├── views.py          # Vistas y lógica de negocio
│   │   └── urls.py           # URLs y rutas de la API
│   ├── user_manager/         # Configuración del proyecto
│   │   ├── settings.py       # Configuraciones generales
│   │   ├── urls.py           # URLs principales
│   │   └── wsgi.py           # Configuración WSGI
│   └── manage.py             # Script de administración
└── frontend/                 # Proyecto React
    ├── public/               # Archivos públicos
    └── src/                  # Código fuente
        ├── components/       # Componentes React
        ├── pages/            # Páginas de la aplicación
        └── services/         # Servicios para API
```

## Requisitos

- Python 3.11
- Django 4.2
- Django REST Framework
- PostgreSQL/SQLite
- Node.js y npm (para el frontend)

## Instalación y Ejecución

### Con Docker Compose (Recomendado)

La forma más fácil de ejecutar el proyecto es utilizando Docker Compose, que configurará automáticamente todos los servicios necesarios.

1. Asegúrate de tener Docker y Docker Compose instalados
2. Clona el repositorio
3. Ejecuta el siguiente comando en la raíz del proyecto:

```bash
docker-compose up --build
```

Esto iniciará:
- Base de datos PostgreSQL
- Backend Django con Python 3.11 (accesible en http://localhost:8000)
- Frontend React (accesible en http://localhost:3000)

Para crear un superusuario, ejecuta:

```bash
docker-compose exec backend python manage.py createsuperuser
```

Si has actualizado la versión de Python o realizado cambios en los Dockerfiles, asegúrate de reconstruir las imágenes:

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Instalación Manual

#### Backend

1. Clonar el repositorio
2. Crear un entorno virtual: `python -m venv venv`
3. Activar el entorno virtual:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. Instalar dependencias: `pip install -r backend/requirements.txt`
5. Ejecutar migraciones: `python backend/manage.py migrate`
6. Crear superusuario: `python backend/manage.py createsuperuser`
7. Iniciar servidor: `python backend/manage.py runserver`

#### Frontend

1. Navegar al directorio frontend: `cd frontend`
2. Instalar dependencias: `npm install`
3. Iniciar el servidor de desarrollo: `npm start`

## Ejecutando las Pruebas

El proyecto incluye un conjunto completo de pruebas automatizadas para el backend. Para ejecutarlas:

### Con Docker:

```bash
docker-compose exec backend pytest
```

### Localmente:

```bash
cd backend
pytest
```

### Detalles de las pruebas:

- **Cobertura**: Puedes generar un informe de cobertura con `pytest --cov=. --cov-report=html`
- **Tipos de pruebas**:
  - Pruebas de autenticación (registro, login, token)
  - Pruebas CRUD para clientes
  - Pruebas CRUD para proyectos
  - Pruebas de filtrado de proyectos por estado
  - Pruebas de seguridad (acceso entre usuarios)

## API Endpoints

La API está completamente documentada y puedes explorar todos los endpoints a través de las interfaces interactivas:

### Documentación de la API

- **Swagger UI**: `/api/docs/` - Interfaz interactiva que permite probar los endpoints
- **ReDoc**: `/api/redoc/` - Documentación detallada en formato legible
- **Schema**: `/api/schema/` - Esquema OpenAPI en formato JSON

#### Usando Swagger UI

La documentación interactiva de Swagger te permite:

1. **Explorar todos los endpoints** disponibles organizados por categorías.
2. **Probar los endpoints** directamente desde el navegador.
3. **Ver los esquemas de datos** para las solicitudes y respuestas.
4. **Autenticarte** usando tu token JWT para probar endpoints protegidos.

Para acceder a Swagger UI, navega a:
```
http://localhost:8000/api/docs/
```

Una vez en Swagger UI:
1. Haz clic en el botón "Authorize" en la parte superior derecha.
2. Ingresa tu JWT token con el formato: `Bearer <tu_token_de_acceso>`.
3. Ahora puedes probar cualquier endpoint con tu sesión autenticada.

#### Usando ReDoc

ReDoc ofrece una documentación más limpia y fácil de leer. Es ideal para:
- Entender la estructura general de la API
- Leer documentación detallada de cada endpoint
- Revisar los esquemas de datos y requisitos

Para acceder a ReDoc, navega a:
```
http://localhost:8000/api/redoc/
```

### Endpoints Principales

- `/api/token/` - Obtener token JWT
- `/api/token/refresh/` - Refrescar token JWT
- `/api/users/` - Gestión de usuarios
- `/api/clients/` - Gestión de clientes
- `/api/projects/` - Gestión de proyectos
- `/api/projects/by_status/?status=pendiente` - Filtrar proyectos por estado

### Modelos de Datos

La documentación completa de los modelos está disponible en Swagger, pero aquí hay un resumen:

#### Usuario (User)
```json
{
  "id": 1,
  "username": "usuario1",
  "email": "usuario@ejemplo.com"
}
```

#### Cliente (Client)
```json
{
  "id": 1,
  "name": "Cliente Ejemplo",
  "email": "cliente@ejemplo.com",
  "phone": "+34123456789",
  "user": 1,
  "created_at": "2023-04-15T10:30:00Z",
  "updated_at": "2023-04-15T10:30:00Z"
}
```

#### Proyecto (Project)
```json
{
  "id": 1,
  "name": "Proyecto Ejemplo",
  "description": "Descripción del proyecto",
  "status": "en_progreso",
  "client": 1,
  "client_name": "Cliente Ejemplo",
  "start_date": "2023-04-15",
  "end_date": "2023-05-15",
  "created_at": "2023-04-15T10:30:00Z",
  "updated_at": "2023-04-15T10:30:00Z"
}
```

## Autenticación

La API utiliza JSON Web Tokens (JWT) para la autenticación. Para acceder a los endpoints protegidos:

1. Obtén un token haciendo una solicitud POST a `/api/token/` con tus credenciales:
   ```json
   {
     "username": "tu_usuario",
     "password": "tu_contraseña"
   }
   ```

2. Incluye el token de acceso en el encabezado de tus solicitudes:
   ```
   Authorization: Bearer <tu_token_de_acceso>
   ```

3. Cuando el token expire, usa el token de refresco para obtener uno nuevo haciendo una solicitud POST a `/api/token/refresh/`:
   ```json
   {
     "refresh": "<tu_token_de_refresco>"
   }
   ```

## Ejemplos de Uso

### Crear un nuevo cliente

```bash
curl -X POST \
  http://localhost:8000/api/clients/ \
  -H 'Authorization: Bearer <tu_token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Nombre del Cliente",
    "email": "cliente@ejemplo.com",
    "phone": "+34123456789"
}'
```

### Obtener proyectos por estado

```bash
curl -X GET \
  'http://localhost:8000/api/projects/by_status/?status=pendiente' \
  -H 'Authorization: Bearer <tu_token>'
``` 