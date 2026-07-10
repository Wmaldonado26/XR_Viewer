# Sistema de Modales Profesionales

## Descripción General

Se ha implementado un sistema completo de modales profesionales que reemplazan todas las notificaciones nativas del navegador (`alert`, `confirm`, `prompt`) con componentes React estilizados y personalizables.

## Componente Principal: ConfirmModal

### Ubicación
- **Componente**: `src/components/ConfirmModal.js`
- **Estilos**: `src/components/ConfirmModal.css`

### Características

#### 1. **Tipos de Modal**
- `confirm`: Modal de confirmación estándar (azul)
- `alert`: Modal de éxito/información (verde)
- `danger`: Modal de advertencia (rojo)
- `delete`: Modal específico para eliminaciones (rojo con énfasis)
- `info`: Modal informativo (azul)

#### 2. **Confirmación Rigurosa**
Para acciones críticas como eliminar proyectos, se puede requerir que el usuario escriba una palabra de confirmación:

```javascript
setModal({
  isOpen: true,
  type: 'delete',
  title: '¿Eliminar Proyecto Permanentemente?',
  message: 'Esta acción es irreversible...',
  onConfirm: () => { /* acción */ },
  requiresConfirmation: true,
  confirmationText: 'ELIMINAR'
});
```

#### 3. **Personalización**
- Título personalizable
- Mensaje personalizable
- Texto de botones personalizable
- Opción para ocultar botón de cancelar
- Animaciones suaves de entrada/salida

### Propiedades del Componente

| Prop | Tipo | Descripción | Default |
|------|------|-------------|---------|
| `isOpen` | `boolean` | Controla la visibilidad del modal | - |
| `onClose` | `function` | Callback al cerrar el modal | - |
| `onConfirm` | `function` | Callback al confirmar la acción | - |
| `title` | `string` | Título del modal | - |
| `message` | `string` | Mensaje principal del modal | - |
| `type` | `string` | Tipo de modal (confirm/alert/danger/delete/info) | `'confirm'` |
| `confirmText` | `string` | Texto del botón de confirmar | `'Confirmar'` |
| `cancelText` | `string` | Texto del botón de cancelar | `'Cancelar'` |
| `requiresConfirmation` | `boolean` | Requiere escribir texto de confirmación | `false` |
| `confirmationText` | `string` | Texto que el usuario debe escribir | `''` |
| `showCancelButton` | `boolean` | Mostrar botón de cancelar | `true` |

## Implementación en Componentes

### 1. Importar el Componente

```javascript
import ConfirmModal from './ConfirmModal';
```

### 2. Agregar Estado

```javascript
const [modal, setModal] = useState({
  isOpen: false,
  type: 'confirm',
  title: '',
  message: '',
  onConfirm: null,
  requiresConfirmation: false,
  confirmationText: ''
});
```

### 3. Agregar el Componente al JSX

```javascript
<ConfirmModal
  isOpen={modal.isOpen}
  onClose={() => setModal({ ...modal, isOpen: false })}
  onConfirm={modal.onConfirm}
  title={modal.title}
  message={modal.message}
  type={modal.type}
  confirmText={modal.confirmText}
  cancelText={modal.cancelText}
  requiresConfirmation={modal.requiresConfirmation}
  confirmationText={modal.confirmationText}
  showCancelButton={modal.showCancelButton !== false}
/>
```

### 4. Usar el Modal

#### Confirmación Simple
```javascript
const handleDeleteExperience = (index) => {
  setModal({
    isOpen: true,
    type: 'danger',
    title: '¿Eliminar Experiencia?',
    message: 'Esta acción no se puede deshacer.',
    onConfirm: () => {
      // Ejecutar eliminación
      setModal({ ...modal, isOpen: false });
    }
  });
};
```

#### Confirmación Rigurosa (para eliminar proyectos)
```javascript
const handleDeleteProject = (projectId) => {
  setModal({
    isOpen: true,
    type: 'delete',
    title: '¿Eliminar Proyecto Permanentemente?',
    message: 'Se perderán todas las escenas, hotspots y configuraciones.',
    onConfirm: () => {
      projectService.deleteProject(projectId);
      setModal({ ...modal, isOpen: false });
    },
    requiresConfirmation: true,
    confirmationText: 'ELIMINAR',
    confirmText: 'Eliminar Proyecto',
    cancelText: 'Cancelar'
  });
};
```

#### Alerta de Éxito
```javascript
setModal({
  isOpen: true,
  type: 'alert',
  title: 'Proyecto Guardado',
  message: 'El proyecto se ha guardado exitosamente.',
  onConfirm: () => setModal({ ...modal, isOpen: false }),
  showCancelButton: false,
  confirmText: 'Aceptar'
});
```

#### Alerta de Error
```javascript
setModal({
  isOpen: true,
  type: 'danger',
  title: 'Error al Guardar',
  message: `No se pudo guardar el proyecto: ${result.error}`,
  onConfirm: () => setModal({ ...modal, isOpen: false }),
  showCancelButton: false,
  confirmText: 'Aceptar'
});
```

## Componentes Actualizados

Los siguientes componentes han sido actualizados para usar el nuevo sistema de modales:

### 1. **ProjectEditor.js**
- ✅ Confirmación para eliminar experiencias
- ✅ Confirmación para eliminar escenas
- ✅ Confirmación para eliminar hotspots
- ✅ Confirmación al cerrar sin guardar
- ✅ Alertas de guardado exitoso/fallido

### 2. **ProjectManager.js**
- ✅ **Confirmación rigurosa para eliminar proyectos** (requiere escribir "ELIMINAR")
- ✅ Alertas de importación exitosa/fallida
- ✅ Confirmación de duplicado de proyectos

### 3. **HotspotVisualEditor.js**
- ✅ Confirmación para eliminar hotspots en el editor visual

### 4. **App.js**
- ✅ Alertas de errores al crear proyectos

## Funcionalidad de Eliminación de Proyectos

### Características de Seguridad

1. **Confirmación Rigurosa**: El usuario debe escribir "ELIMINAR" para confirmar
2. **Información Detallada**: Se muestra el nombre del proyecto a eliminar
3. **Advertencia Clara**: Se indica que la acción es irreversible
4. **Feedback Visual**: Modal tipo "delete" con color rojo y animación de advertencia
5. **Confirmación Posterior**: Después de eliminar, se muestra un modal de éxito

### Flujo de Eliminación

```
[Click en botón eliminar]
    ↓
[Modal de confirmación rigurosa]
    ↓
[Usuario escribe "ELIMINAR"]
    ↓
[Click en "Eliminar Proyecto"]
    ↓
[Proyecto eliminado de localStorage]
    ↓
[Modal de éxito]
    ↓
[Lista de proyectos actualizada]
```

## Diseño y Estilos

### Características Visuales
- **Overlay con blur**: Fondo difuminado para mejor enfoque
- **Animaciones suaves**: Entrada y salida con transiciones
- **Iconos contextuales**: Diferentes iconos según el tipo de modal
- **Responsive**: Se adapta a dispositivos móviles
- **Soporte de modo oscuro**: Estilos para dark mode
- **Accesibilidad**: Foco automático en inputs de confirmación

### Colores por Tipo
- **Confirm/Info**: Azul (`#2563eb`)
- **Alert/Success**: Verde (`#16a34a`)
- **Danger/Delete**: Rojo (`#dc2626`)

### Animaciones
- **fadeIn**: Aparición suave del overlay
- **slideUp**: Entrada del modal desde abajo
- **shake**: Animación de advertencia para modales de peligro

## Beneficios

1. ✅ **Profesionalismo**: Interfaz moderna y coherente
2. ✅ **Consistencia**: Mismo diseño en toda la aplicación
3. ✅ **Seguridad**: Confirmaciones rigurosas para acciones críticas
4. ✅ **Experiencia de Usuario**: Mejor feedback visual
5. ✅ **Mantenibilidad**: Un solo componente reutilizable
6. ✅ **Personalización**: Fácil de adaptar a diferentes casos de uso
7. ✅ **Accesibilidad**: Mejor que los modales nativos del navegador

## Próximas Mejoras Sugeridas

- [ ] Agregar soporte para mensajes HTML en el body del modal
- [ ] Implementar modales con inputs personalizados (prompt mejorado)
- [ ] Agregar animaciones de salida diferentes según el tipo
- [ ] Implementar cola de modales para mostrar varios seguidos
- [ ] Agregar soporte para modales de tamaño variable (pequeño, mediano, grande)
- [ ] Implementar modales con formularios complejos

## Notas Técnicas

- El modal usa `z-index: 10000` para asegurar que aparezca sobre todo el contenido
- Se previenen clicks en el overlay para cerrar accidentalmente
- El botón de confirmar se deshabilita hasta que se complete la confirmación rigurosa
- Los modales son completamente controlados desde el estado del componente padre
- Se limpian los estados internos al cerrar el modal
