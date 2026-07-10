# 📦 Guía de Migración Optimizada: localStorage → SQLite + FileSystem

## ⚡ Ventajas de esta migración
- **Imágenes como archivos**: Se guardan en `backend/uploads/` en lugar de base64
- **Base de datos ligera**: Solo guarda rutas y metadata
- **Migración rápida**: Segundos en lugar de minutos
- **Sin límite de espacio**: No más "quota exceeded"

---

## 🚀 PASO 1: Exportar datos del navegador

1. **Abre tu aplicación en el navegador** (donde tienes los proyectos actuales)
2. **Abre la consola de desarrollo** (presiona `F12`)
3. **Ejecuta este comando** en la pestaña "Console":

```javascript
copy(localStorage.getItem("cotecmar_projects"))
```

4. Verás `undefined` en la consola - **esto es normal**, los datos ya están en tu portapapeles ✅

---

## 🔄 PASO 2: Ejecutar migración optimizada

1. **Abre una terminal** en la carpeta `backend`:
```bash
cd backend
```

2. **Ejecuta el script de migración**:
```bash
node migrate-optimized.js
```

3. El script te pedirá que **pegues el JSON**. Simplemente:
   - **Haz clic derecho** → **Pegar** (o `Ctrl+V`)
   - **Presiona Enter dos veces** para iniciar el proceso

4. Verás el progreso en tiempo real:
```
🔄 Iniciando migración optimizada de proyectos...

📋 Pega el contenido del localStorage (JSON array) y presiona Enter dos veces:

[1/1] ARC Independiente
  ✓ Imagen guardada: arc-independiente-001_thumbnail_0_1234567890.png (245.67 KB)
  ✓ Imagen guardada: arc-independiente-001_scene_bridge_0_1234567891.jpg (1834.12 KB)
  ✓ Imagen guardada: arc-independiente-001_scene_engine_1_1234567892.jpg (1923.45 KB)
  ...
  📊 Total de imágenes procesadas: 20
  ✅ Proyecto migrado exitosamente

============================================================
📊 RESUMEN DE MIGRACIÓN
============================================================
✅ Proyectos migrados exitosamente: 1
❌ Proyectos con errores: 0
📁 Base de datos: C:\...\backend\cotecmar.db
📸 Imágenes en: C:\...\backend\uploads
============================================================
```

---

## ✅ PASO 3: Verificar migración

1. **Verifica la base de datos**:
```bash
node -e "const db = require('better-sqlite3')('cotecmar.db'); console.log(db.prepare('SELECT id, name, vesselType FROM projects').all()); db.close();"
```

2. **Verifica las imágenes guardadas**:
```bash
dir uploads
```

3. Deberías ver:
   - Archivos `.png` y `.jpg` con nombres como `arc-independiente-001_thumbnail_...`
   - Archivos `.png` para cada escena 360°

---

## 🚀 PASO 4: Iniciar el backend

1. **Inicia el servidor**:
```bash
npm start
```

2. Verás:
```
✅ Servidor backend ejecutándose en http://localhost:5000
📁 Base de datos: C:\...\backend\cotecmar.db
📸 Directorio de imágenes: C:\...\backend\uploads
```

3. **Prueba la API**:
```bash
curl http://localhost:5000/api/projects
```

O abre en tu navegador:
```
http://localhost:5000/api/projects
```

---

## 🎯 PASO 5: Verificar en el frontend

1. Asegúrate que en `src/services/ProjectService.js` esté:
```javascript
const USE_BACKEND = true;
```

2. **Inicia tu aplicación React**:
```bash
npm start
```

3. **Verifica** que tus proyectos se cargan correctamente
4. Las imágenes ahora se cargarán como:
   - `http://localhost:5000/uploads/arc-independiente-001_thumbnail_....png`
   - En lugar de: `data:image/png;base64,iVBORw0KG...`

---

## 🔧 Solución de problemas

### ❌ Error: "Cannot find module 'better-sqlite3'"
```bash
cd backend
npm install
```

### ❌ Error: "Address already in use"
El puerto 5000 está ocupado. Detén el proceso anterior:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <número> /F

# Luego reinicia
npm start
```

### ❌ No se pega el JSON
Si el `Ctrl+V` no funciona en la terminal:
1. Guarda el JSON en un archivo: `proyectos.json`
2. Ejecuta:
```bash
type proyectos.json | node migrate-optimized.js
```

### ❌ Imágenes no se muestran
Verifica que el backend esté sirviendo archivos estáticos:
```
http://localhost:5000/uploads/
```

---

## 📊 Comparación: Antes vs Después

| Aspecto | localStorage (Antes) | SQLite + FileSystem (Después) |
|---------|---------------------|-------------------------------|
| **Límite de espacio** | ~5-10 MB | Sin límite |
| **Tamaño de 1 escena** | ~2 MB (base64) | ~1.5 MB (archivo) |
| **Proyectos máximos** | ~3-5 | Ilimitados |
| **Velocidad de carga** | Lenta (parsear base64) | Rápida (URLs directas) |
| **Portabilidad** | Solo navegador | Backend portable |

---

## 🎉 ¡Listo!

Tu sistema ahora usa:
- ✅ SQLite para metadata de proyectos
- ✅ FileSystem para imágenes
- ✅ Sin límites de almacenamiento
- ✅ Mejor rendimiento
