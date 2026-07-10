# 📦 Migración de Proyectos: localStorage → SQLite

## ¿Por qué migrar?

Los proyectos actuales están en **localStorage del navegador** (límite ~5-10MB). Al migrar a **SQLite**, tendrás:
- ✅ Sin límite de almacenamiento para imágenes
- ✅ Datos persistentes en archivo físico
- ✅ Acceso desde cualquier navegador
- ✅ Backup fácil (solo copiar `cotecmar.db`)

---

## 🚀 Pasos para Migrar

### 1️⃣ Exportar desde localStorage

1. Abre tu aplicación en el navegador (http://localhost:3000)
2. Presiona **F12** para abrir las DevTools
3. Ve a la pestaña **Console**
4. Ejecuta este comando:

```javascript
copy(localStorage.getItem("cotecmar_projects"))
```

5. Verás el mensaje: "undefined" (esto es normal)
6. Los datos se han copiado al portapapeles ✓

---

### 2️⃣ Ejecutar Script de Migración

1. Abre una terminal en la carpeta `backend`:
```cmd
cd "c:\Users\btovar\Desktop\CODIGOS\ADOLFO REPO\main-project\backend"
```

2. Ejecuta el script de migración:
```cmd
node migrate.js
```

3. Cuando te pida "Pega aquí el contenido...", presiona **Ctrl+V** y luego **Enter**

4. Verás algo como:
```
✓ Migrado: ARC Independiente (arc-independiente-001)
✓ Migrado: Nuevo Proyecto (proj_123456789)

✓ Proyectos migrados exitosamente: 2
```

---

### 3️⃣ Iniciar Backend

```cmd
npm start
```

Deberías ver:
```
Server running on port 5000
Database initialized successfully
```

---

### 4️⃣ Verificar Migración

1. Abre http://localhost:5000/api/projects en el navegador
2. Deberías ver tus proyectos en formato JSON

---

## 🔧 Solución de Problemas

### "No se proporcionaron datos"
- Asegúrate de copiar el contenido con `copy(localStorage.getItem("cotecmar_projects"))`
- Verifica que estás en la misma aplicación donde creaste los proyectos

### "Error parsing JSON"
- El contenido copiado está incompleto o corrupto
- Intenta nuevamente desde el paso 1

### "better-sqlite3" error
- Ejecuta `npm install` en la carpeta backend primero

---

## 📊 Después de Migrar

- Los proyectos **siguen en localStorage** (copia de seguridad)
- El backend usará **SQLite** como fuente principal
- Puedes eliminar localStorage si quieres:
  ```javascript
  localStorage.removeItem("cotecmar_projects")
  ```

---

## 🔄 Volver a localStorage (si es necesario)

Edita `src/services/ProjectService.js` línea 6:
```javascript
const USE_BACKEND = false;  // Cambiar a false
```

---

## 💾 Backup de la Base de Datos

Simplemente copia el archivo:
```
backend/cotecmar.db
```

Para restaurar, reemplaza ese archivo con tu backup.
