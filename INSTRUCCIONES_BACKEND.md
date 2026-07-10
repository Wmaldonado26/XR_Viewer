# Instrucciones para Iniciar el Backend

## Problema Resuelto
El error "exceeded the quota" de localStorage se ha resuelto migrando a una base de datos SQLite con backend Express.

## Pasos para Iniciar

### 1. Abrir Terminal en Backend
```bash
cd "c:\Users\btovar\Desktop\CODIGOS\ADOLFO REPO\main-project\backend"
```

### 2. Iniciar el Servidor
```bash
npm start
```

Deberías ver:
```
Server running on port 5000
Database initialized successfully
```

### 3. Iniciar el Frontend (en otra terminal)
```bash
cd "c:\Users\btovar\Desktop\CODIGOS\ADOLFO REPO\main-project"
npm start
```

## Verificación

1. **Backend funcionando**: Abre http://localhost:5000/api/projects en el navegador
   - Debe devolver un JSON con la lista de proyectos

2. **Frontend conectado**: Al crear una escena con imagen grande, ya no debe aparecer el error de quota

## Cambios Realizados

### ✅ Backend
- Servidor Express en puerto 5000
- Base de datos SQLite (`cotecmar.db`)
- Endpoints REST:
  - `GET /api/projects` - Listar todos
  - `GET /api/projects/:id` - Obtener uno
  - `POST /api/projects` - Crear nuevo
  - `PUT /api/projects/:id` - Actualizar
  - `DELETE /api/projects/:id` - Eliminar

### ✅ Frontend
- ProjectService actualizado para usar fetch() al backend
- Fallback automático a localStorage si backend no disponible
- Todas las operaciones CRUD ahora son async/await
- ProjectEditor y ProjectManager actualizados con async

### ✅ Eliminación de Proyectos
- Al eliminar un proyecto desde ProjectEditor, se cierra el editor y refresca la galería
- Al eliminar desde ProjectManager, se actualiza la lista automáticamente
- Confirmación estricta con texto "ELIMINAR"

## Solución de Problemas

### Backend no inicia
1. Verificar que todas las dependencias están instaladas: `npm install`
2. Verificar que no hay otro proceso en puerto 5000

### Error de conexión en Frontend
- El sistema automáticamente usa localStorage como fallback
- Para forzar localStorage: edita `src/services/ProjectService.js` y cambia `USE_BACKEND = false`

## Cambio entre Backend y LocalStorage

En `src/services/ProjectService.js` línea 6:
```javascript
const USE_BACKEND = true;  // true = backend, false = localStorage
```

## Base de Datos

- Ubicación: `backend/cotecmar.db`
- Imágenes: Almacenadas en la base de datos como BLOB
- Backup automático: Se recomienda copiar `cotecmar.db` periódicamente
