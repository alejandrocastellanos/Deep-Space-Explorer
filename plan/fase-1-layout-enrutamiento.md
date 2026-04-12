# Fase 1 — Layout Global y Enrutamiento

> **Objetivo:** Tener las 5 rutas navegables con layout base funcional.
> Ref. spec: §4 (Arquitectura — Layout Principal y Vistas)

---

## Contratos a implementar

| Componente | Spec ref. |
|------------|-----------|
| `Navbar` con 5 enlaces | spec §4 — Layout Principal |
| `Sidebar` con slots de ISS y alertas | spec §4 — Layout Principal |
| 5 rutas: `/`, `/explorer`, `/artemis`, `/asteroids`, `/iss` | spec §4 — Vistas |

---

## Tareas

### 1.1 — Configurar React Router DOM con las 5 rutas

Archivo: `src/main.jsx`

```jsx
import { BrowserRouter } from 'react-router-dom'

// Envuelve <App /> con <BrowserRouter>
```

Archivo: `src/App.jsx`

```jsx
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Explorer from './pages/Explorer'
import ArtemisSection from './pages/ArtemisSection'
import AsteroidRadar from './pages/AsteroidRadar'
import ISSTracker from './pages/ISSTracker'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="explorer" element={<Explorer />} />
        <Route path="artemis" element={<ArtemisSection />} />
        <Route path="asteroids" element={<AsteroidRadar />} />
        <Route path="iss" element={<ISSTracker />} />
      </Route>
    </Routes>
  )
}
```

### 1.2 — Implementar `Navbar`

Archivo: `src/components/Navbar.jsx`

- Logo "Deep Space Explorer" a la izquierda.
- Links con `<NavLink>` a las 5 rutas usando `Lucide React` para iconos.
- Fondo `bg-nasa-dark/90 backdrop-blur` para efecto inmersivo.
- Link activo resaltado con `text-nasa-blue`.

Rutas y etiquetas:
| Path | Label | Icono sugerido |
|------|-------|---------------|
| `/` | Home | `Home` |
| `/explorer` | Galeria | `Search` |
| `/artemis` | Artemis II | `Rocket` |
| `/asteroids` | Radar | `Radar` |
| `/iss` | ISS | `Satellite` |

### 1.3 — Implementar `Sidebar`

Archivo: `src/components/Sidebar.jsx`

- Columna fija a la derecha (o colapsable en mobile).
- Dos slots con placeholder por ahora:
  - **Estado ISS:** latitud/longitud (se conecta en Fase 3).
  - **Alerta Asteroides:** conteo de NEOs peligrosos hoy (se conecta en Fase 3).
- Usar `Lucide React` icons: `MapPin` para ISS, `AlertTriangle` para asteroides.

### 1.4 — Implementar componente `Layout`

Archivo: `src/components/Layout.jsx`

```jsx
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-nasa-dark text-white flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
        <Sidebar />
      </div>
    </div>
  )
}
```

### 1.5 — Crear pages con placeholders

Cada archivo en `src/pages/` retorna un `<div>` con el nombre de la vista. Se reemplazaran en fases siguientes.

---

## Criterio de Aceptacion

- [ ] Navegar entre las 5 rutas sin recargar la pagina.
- [ ] Link activo en Navbar resaltado visualmente.
- [ ] Layout muestra Navbar en top, Sidebar en right, contenido en center.
- [ ] Fondo oscuro (`bg-nasa-dark`) aplicado globalmente.
- [ ] No hay errores de consola.
