# Fase 4 — Pulido, Interactividad y Validacion Final

> **Objetivo:** Completar todos los items del roadmap (spec §5 Fase 4) y validar el 100% de la spec.
> Ref. spec: §5 Fase 4, §6 (Diseno y Seguridad)

---

## Tareas

### 4.1 — Implementar Favoritos con `localStorage`

Archivo: `src/hooks/useFavorites.js`

```js
// Contrato del hook:
// favorites: array de items guardados
// addFavorite(item): agrega al localStorage
// removeFavorite(id): elimina por id
// isFavorite(id): boolean
```

- El estado se inicializa desde `localStorage` al montar.
- Persistir en cada cambio con `useEffect`.
- Clave de localStorage: `'dse-favorites'`.

Integracion en `MediaCard`:
- El icono de corazon llama a `addFavorite` / `removeFavorite`.
- Si `isFavorite(id)` es true, el icono se llena (`Heart` filled vs outline).

Nueva ruta opcional: `/favorites` con grid de cards guardadas.

### 4.2 — Animaciones de entrada con Framer Motion

Componentes a animar:
| Componente | Animacion |
|------------|-----------|
| `MediaCard` | `fadeInUp` al aparecer en el grid |
| `Home` hero text | `fadeIn` con delay escalonado |
| `Sidebar` widgets | `slideInRight` al montar |
| Cambio de ruta | `AnimatePresence` + `opacity` fade |

Patron a usar en `MediaCard`:
```jsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  {/* contenido */}
</motion.div>
```

Animacion de transicion de rutas en `Layout.jsx`:
```jsx
import { AnimatePresence, motion } from 'framer-motion'

// Envolver <Outlet> con AnimatePresence + motion.div
```

### 4.3 — Responsive Design

Breakpoints a revisar en cada componente:

| Vista | Mobile (< 768px) | Desktop (>= 1024px) |
|-------|-----------------|---------------------|
| `Navbar` | Menu hamburguesa | Links horizontales |
| `Sidebar` | Oculto / drawer | Columna fija |
| `MediaCard` grid | 1 columna | 3 columnas |
| `AsteroidRadar` | Cards apiladas | Tabla horizontal |
| `ISSTracker` mapa | Full width | 2/3 width + panel |

Clases Tailwind clave:
- `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- `hidden md:block` para Sidebar en desktop
- `md:hidden` para menu hamburguesa en mobile

### 4.4 — Optimizacion de Imagenes

- Agregar `loading="lazy"` a todos los `<img>` en `MediaCard`.
- Fallback de imagen rota:
  ```jsx
  <img
    src={thumbnail}
    alt={title}
    loading="lazy"
    onError={(e) => { e.target.src = '/placeholder-space.jpg' }}
  />
  ```
- Placeholder estatico `public/placeholder-space.jpg` — imagen oscura del espacio.
- Limitar tamano de thumbnails con parametros de URL si la API lo soporta.

### 4.5 — Auditoria de Seguridad (spec §6)

Checklist a ejecutar antes del deploy:

- [ ] Buscar `DEMO_KEY` o cualquier API key hardcodeada en el codigo.
- [ ] Verificar que `.env` esta en `.gitignore`.
- [ ] Confirmar que `import.meta.env.VITE_NASA_API_KEY` es el unico punto de acceso a la key.
- [ ] Revisar que no hay `console.log` con datos sensibles.
- [ ] Verificar que la ISS API usa `https` si hay version disponible (o documentar el riesgo de `http`).

### 4.6 — Auditoria de Diseno (spec §6)

Checklist visual:

- [ ] Paleta `#0B3D91` (NASA Blue) usada en elementos interactivos y acentos.
- [ ] Fondo general en `#000000` o muy oscuro.
- [ ] Texto principal en blanco / gris galactico (`nasa-gray`).
- [ ] Tipografia consistente en todas las vistas.
- [ ] Iconos de `Lucide React` usados en lugar de emojis o texto plano.
- [ ] No hay elementos visuales que rompan el tema espacial.

### 4.7 — Configurar React Query Provider

Si no se configuro en Fase 0, asegurar que `QueryClientProvider` envuelve la app en `main.jsx`:

```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </QueryClientProvider>,
  document.getElementById('root')
)
```

---

## Criterio de Aceptacion

- [ ] Agregar y quitar favoritos persiste entre recargas de pagina.
- [ ] Las cards del grid tienen animacion de entrada visible.
- [ ] La app es navegable en pantalla de 375px de ancho (iPhone SE).
- [ ] Las imagenes tienen lazy loading y fallback ante URL rota.
- [ ] No existe ninguna API key en el codigo fuente del repositorio.
- [ ] La paleta de colores es consistente en las 5 vistas.
