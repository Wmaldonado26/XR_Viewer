# 🚀 Instrucciones de Desarrollo

## Inicio Rápido

### **Ejecutar TODO el proyecto con un solo comando:**

```bash
npm run dev
```

Este comando iniciará automáticamente:
- ✅ **Backend** (Express + SQLite) en `http://localhost:5000`
- ✅ **Frontend** (React) en `http://localhost:3000`

---

## Comandos Disponibles

### **Desarrollo (Recomendado)**

```bash
npm run dev
```
Ejecuta frontend y backend simultáneamente con `concurrently`.

### **Solo Frontend**

```bash
npm run start:frontend
# o simplemente
npm start
```
Inicia solo React en `http://localhost:3000`

### **Solo Backend**

```bash
npm run start:backend
```
Inicia solo Express en `http://localhost:5000`

### **Producción**

```bash
npm run build
```
Genera build de producción del frontend en `/build`

---

## Estructura del Proyecto

```
main-project/
├── backend/                 # Servidor Express + SQLite
│   ├── server.js           # API REST
│   ├── cotecmar.db         # Base de datos SQLite
│   ├── uploads/            # Imágenes subidas
│   └── package.json        # Dependencias del backend
│
├── src/                    # Aplicación React
│   ├── components/         # Componentes de UI
│   ├── services/           # Servicios (API calls)
│   └── App.js              # Rutas principales
│
└── package.json            # Dependencias del frontend + scripts
```

---

## Primer Inicio

1. **Instalar dependencias del frontend:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Instalar dependencias del backend:**
   ```bash
   cd backend
   npm install
   cd ..
   ```

3. **Iniciar todo:**
   ```bash
   npm run dev
   ```

4. **Acceder:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api/projects

---

## Arquitectura

### Backend (localhost:5000)
- **Framework:** Express 4.18.2
- **Base de Datos:** SQLite (better-sqlite3)
- **Almacenamiento:** Filesystem (`backend/uploads/`)
- **Endpoints:**
  - `GET /api/projects` - Listar proyectos
  - `GET /api/projects/:id` - Obtener proyecto
  - `POST /api/projects` - Crear proyecto
  - `PUT /api/projects/:id` - Actualizar proyecto
  - `DELETE /api/projects/:id` - Eliminar proyecto
  - `POST /api/upload` - Subir imágenes

### Frontend (localhost:3000)
- **Framework:** React 19.1.0
- **Routing:** react-router-dom 7.10.1
- **Viewer 360°:** Pannellum
- **Estado:** useState + useEffect hooks

### Rutas Disponibles
- `/` - Galería pública de proyectos
- `/admin/login` - Login administrativo
- `/admin` - Gestor de proyectos
- `/admin/edit/:projectId` - Editor de proyecto
- `/admin/edit/:projectId/scene/:sceneKey` - Editor visual de hotspots

---

## Notas Importantes

⚠️ **NO usar base64 para imágenes** - Las imágenes se almacenan en el filesystem, la DB solo guarda URLs.

✅ **Imágenes grandes permitidas** - Límite: 500MB (configurado en backend/server.js)

🔄 **Recarga de página** - Las rutas persisten (F5 mantiene el contexto actual)

🎨 **Hotspots visuales** - Usar el Editor Visual para colocar hotspots haciendo clic en las imágenes 360°

---

## Solución de Problemas

### Backend no inicia
```bash
cd backend
npm install
node server.js
```

### Error de CORS
Verificar que el backend esté corriendo en puerto 5000.

### Imágenes no se muestran
1. Verificar que el backend esté corriendo
2. Comprobar que las URLs en la DB sean correctas: `http://localhost:5000/uploads/...`
3. Revisar que existan los archivos en `backend/uploads/`

---

## Comandos Útiles

```bash
# Ver logs del backend
cd backend && npm start

# Limpiar cache de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Ver base de datos
cd backend
sqlite3 cotecmar.db ".tables"
sqlite3 cotecmar.db "SELECT * FROM projects;"
```

---

**¡Listo para desarrollar! 🎉**

Ejecuta `npm run dev` y ambos servidores se iniciarán automáticamente.
