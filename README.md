# Task Manager App

Aplicación CRUD de tareas desarrollada con Node.js, Express, MySQL y JavaScript (Fetch API).

Permite crear, editar, eliminar y visualizar tareas con prioridad y estado de completado.

---

## Tecnologías utilizadas

Frontend:

* HTML5
* Bootstrap 5
* JavaScript (Vanilla)

Backend:

* Node.js
* Express

Base de datos:

* MySQL

---

## Estructura del proyecto

```
project/
│
├── index.html        Interfaz principal
├── app.js            Lógica del frontend
├── server.js         Servidor Express
├── db.js             Conexión a MySQL
└── README.md
```

---

## Instalación

1. Clonar el repositorio:

```
git clone <tu-repositorio>
cd project
```

2. Instalar dependencias:

```
npm install
```

3. Configurar la base de datos en db.js

4. Ejecutar el servidor:

```
node server.js
```

5. Abrir el frontend en el navegador:

```
http://localhost:8000
```

---

## API Endpoints

Obtener todas las tareas:

```
GET /api/tasks
```

Obtener una tarea por ID:

```
GET /api/tasks/:id
```

Crear una tarea:

```
POST /api/tasks
```

Ejemplo de body:

```
{
  "title": "Task name",
  "priority": "High"
}
```

Actualizar una tarea:

```
PUT /api/tasks/:id
```

Ejemplo de body:

```
{
  "title": "Updated task",
  "priority": "Medium",
  "isCompleted": true
}
```

Eliminar una tarea:

```
DELETE /api/tasks/:id
```

---

## Funcionalidades

* Crear tareas
* Editar tareas
* Eliminar tareas
* Marcar tareas como completadas
* Visualizar tareas en una tabla
* Mostrar prioridad con colores

---

## Problemas comunes

Error: bootstrap is not defined

Causa:
El archivo de Bootstrap no se carga correctamente debido a un atributo integrity incorrecto.

Solución:
Usar un CDN válido y eliminar atributos innecesarios:

```
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
```

---

## Mejoras futuras

* Autenticación de usuarios
* Filtros por prioridad
* Búsqueda de tareas
* Mejorar la interfaz de usuario

---

## Autor

Jathsiry Lizeth Sanchez Manrique

---

## Licencia

Proyecto de uso educativo.
