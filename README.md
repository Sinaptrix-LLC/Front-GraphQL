# ToDo App con Arquitectura Agnóstica

## Descripción

Esta aplicación es un gestor de tareas (ToDo) que demuestra cómo construir un sistema que puede consumir datos de diferentes fuentes (GraphQL o datos simulados) utilizando una arquitectura hexagonal (también conocida como arquitectura de puertos y adaptadores).

La aplicación permite a los usuarios:
- Crear, leer, actualizar y eliminar tareas y usuarios
- Asignar tareas a usuarios específicos
- Marcar tareas como completadas
- Filtrar y ordenar tareas por diferentes criterios
- Cambiar entre diferentes fuentes de datos en tiempo real

## Arquitectura

El proyecto sigue una arquitectura hexagonal que separa claramente las preocupaciones en diferentes capas:

### 1. Capa de Dominio

Representa el núcleo de la aplicación y contiene:

- **Modelos**: Definen las entidades de negocio (como `User` y `Todo`) y sus propiedades.
- **Repositorios**: Interfaces que definen las operaciones posibles sobre los modelos, sin especificar cómo se implementan.

### 2. Capa de Aplicación

Contiene la lógica de aplicación que orquesta el flujo de datos:

- **Store**: Implementado con Zustand, maneja el estado global y las acciones que pueden realizar los usuarios, con stores separados para tareas y usuarios.

### 3. Capa de Infraestructura

Implementa los adaptadores que conectan la aplicación con el mundo exterior:

- **Adaptadores GraphQL**: Utiliza Apollo Client para comunicarse con un servidor GraphQL.
- **Adaptadores Mock**: Simula un repositorio en memoria con persistencia en localStorage.

### 4. Capa de UI

La interfaz de usuario implementada con React y TypeScript:

- **Componentes**: Como TodoList, UserList y DataSourceSelector, que permiten a los usuarios interactuar con la aplicación.
- **Routing**: Implementado con React Router para la navegación entre diferentes secciones de la aplicación.

## Relación entre Usuarios y Tareas

La aplicación implementa una relación de uno a muchos entre usuarios y tareas. Esta relación se establece y gestiona en varios niveles:

### Nivel de Modelo de Dominio

- El modelo `Todo` incluye un campo `userId` opcional que actúa como clave foránea referenciando al `id` del usuario propietario de la tarea.
- Los DTOs (Data Transfer Objects) como `CreateTodoInput` y `UpdateTodoInput` permiten asignar o cambiar el usuario asociado a una tarea.

### Nivel de Repositorio

- Las implementaciones de `TodoRepository` (como `MockTodoRepository`) utilizan el campo `userId` para vincular tareas con usuarios.
- Al crear tareas de ejemplo (seed data), se asignan diferentes `userId` para demostrar la relación.

### Nivel de Estado de Aplicación

- El `userStore` mantiene un `selectedUser` que puede afectar a la creación de nuevas tareas.
- Al eliminar un usuario, no se implementa automáticamente la eliminación en cascada de sus tareas, por lo que las tareas quedarían huérfanas (sin usuario asignado).

### Nivel de Interfaz de Usuario

- En el componente `TodoList`, se muestra el nombre del usuario asignado a cada tarea.
- Al crear o editar una tarea, se puede seleccionar el usuario al que se asignará mediante un selector desplegable.
- Las tareas pueden filtrarse y ordenarse por el usuario asignado.

## Beneficios de esta Arquitectura

- **Independencia de tecnologías**: La capa de dominio no depende de tecnologías específicas, lo que facilita la sustitución de componentes.
- **Testabilidad**: Es fácil probar cada capa de forma aislada.
- **Flexibilidad**: Puedes cambiar entre diferentes fuentes de datos (GraphQL, Mock) sin modificar la lógica de negocio.
- **Mantenibilidad**: El código está organizado en capas con responsabilidades claras.

## Tecnologías Utilizadas

- **Frontend**: React 18, TypeScript, Vite 6
- **UI Framework**: Bootstrap 5 (con react-bootstrap)
- **Gestión de Estado**: Zustand 4
- **Routing**: React Router 7
- **Comunicación HTTP**: Axios
- **Cliente GraphQL**: Apollo Client 3
- **Data Fetching Alternativo**: SWR
- **Persistencia Local**: localStorage (para los adaptadores Mock)
- **Validación y Testing**: Vitest, Testing Library

## Estructura del Proyecto

```
src/
  ├── domain/            # Capa de dominio
  │   ├── models/        # Definición de entidades (User, Todo)
  │   └── repositories/  # Interfaces de repositorios
  ├── application/       # Capa de aplicación
  │   └── store/         # Estado global con Zustand (todoStore, userStore)
  ├── infrastructure/    # Capa de infraestructura
  │   └── adapters/      # Implementaciones de repositorios
  │       ├── graphql/   # Adaptador para GraphQL
  │       └── mock/      # Adaptador para datos simulados
  ├── components/        # Componentes de UI
  │   ├── shared/        # Componentes reutilizables
  │   ├── TodoList.tsx   # Gestión de tareas
  │   ├── UserList.tsx   # Gestión de usuarios
  │   ├── Routes.tsx     # Configuración de rutas
  │   └── ...            # Otros componentes
  └── assets/            # Recursos estáticos
```

## Cómo Usar la Aplicación

La aplicación permite cambiar entre diferentes fuentes de datos:

1. **GraphQL**: Conecta con un servidor GraphQL (por defecto en `http://localhost:4000/graphql`)
2. **Mock**: Utiliza datos simulados almacenados en localStorage

Puedes cambiar la fuente de datos en cualquier momento usando el selector en la sección de fuentes de datos y configurar las URLs de conexión según sea necesario.

### Gestión de Usuarios y Tareas

1. Crea usuarios en la sección de Usuarios
2. Selecciona un usuario para ver o filtrar sus tareas
3. Crea tareas y asígnalas a usuarios específicos mediante el selector desplegable
4. Edita tareas para cambiar su título, estado o usuario asignado
5. Utiliza las opciones de filtrado y ordenación para organizar la visualización de tareas

## Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar la versión de producción
npm run preview
```

## Notas para Desarrolladores

### Agregar una Nueva Fuente de Datos

Para agregar una nueva fuente de datos:

1. Crea nuevos adaptadores en `/src/infrastructure/adapters/` que implementen las interfaces `TodoRepository` y `UserRepository`
2. Registra los nuevos adaptadores en `/src/application/store/todoStore.ts` y `/src/application/store/userStore.ts`
3. Agrega la opción en el componente `DataSourceSelector`

### Extender el Modelo de Datos

Para añadir nuevos campos a los modelos o nuevas relaciones:

1. Modifica las interfaces en `/src/domain/models/`
2. Actualiza todos los adaptadores para que manejen los nuevos campos
3. Actualiza la UI para mostrar y permitir editar los nuevos campos

## Licencia

MIT
