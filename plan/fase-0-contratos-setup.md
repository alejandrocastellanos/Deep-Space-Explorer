# Fase 0 — Contratos y Setup

> **Objetivo:** Definir todos los contratos de datos e interfaces antes de escribir un solo componente.
> Ref. spec: §2 (Stack), §3 (APIs), §6 (Seguridad y Diseno)

---

## Tareas

### 0.1 — Inicializar proyecto

```bash
npm create vite@latest deep-space-explorer -- --template react
cd deep-space-explorer
```

### 0.2 — Instalar dependencias del stack completo (spec §2)

```bash
npm install \
  react-router-dom \
  axios \
  @tanstack/react-query \
  lucide-react \
  @react-three/fiber \
  @react-three/drei \
  three \
  react-leaflet \
  leaflet \
  framer-motion

npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 0.3 — Configurar Tailwind con paleta NASA (spec §6)

Archivo: `tailwind.config.js`

```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'nasa-blue': '#0B3D91',
        'nasa-dark': '#000000',
        'nasa-gray': '#A0AEC0',
      },
      fontFamily: {
        space: ['Inter', 'sans-serif'],
      },
    },
  },
}
```

### 0.4 — Crear archivo `.env` y `.env.example` (spec §6 — Seguridad)

`.env.example`:
```
VITE_NASA_API_KEY=your_api_key_here
```

`.gitignore` debe incluir `.env`.

### 0.5 — Definir contratos de datos (shapes de API)

Archivo sugerido: `src/api/contracts.js`

```js
// Contrato APOD — spec §3.1
// GET https://api.nasa.gov/planetary/apod
// {
//   url: string,
//   hdurl: string,
//   title: string,
//   explanation: string,
//   media_type: 'image' | 'video',
//   date: string
// }

// Contrato NASA Search — spec §3.2
// GET https://images-api.nasa.gov/search?q=...&media_type=image,video
// collection.items[i] = {
//   data: [{ title, description, nasa_id, media_type, date_created }],
//   links: [{ href: string }]   // thumbnail
// }

// Contrato NeoWs — spec §3.3
// GET https://api.nasa.gov/neo/rest/v1/feed?start_date=X&end_date=Y
// near_earth_objects[date][i] = {
//   name: string,
//   nasa_jpl_url: string,
//   is_potentially_hazardous_asteroid: boolean,
//   close_approach_data: [{ miss_distance, relative_velocity }],
//   estimated_diameter: { kilometers: { min, max } }
// }

// Contrato ISS — spec §3.4
// GET http://api.open-notify.org/iss-now.json
// {
//   iss_position: { latitude: string, longitude: string },
//   timestamp: number,
//   message: 'success'
// }
```

### 0.6 — Crear estructura de carpetas (spec §4 — Arquitectura)

```
src/
├── api/
│   ├── contracts.js      # Shapes documentados (0.5)
│   ├── nasaApi.js        # Instancia Axios con base URL y API key
│   └── issApi.js         # Instancia Axios para open-notify
├── components/
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   └── MediaCard.jsx
├── hooks/
│   ├── useAPOD.js
│   ├── useNASASearch.js
│   ├── useAsteroids.js
│   └── useISSPosition.js
├── pages/
│   ├── Home.jsx
│   ├── Explorer.jsx
│   ├── ArtemisSection.jsx
│   ├── AsteroidRadar.jsx
│   └── ISSTracker.jsx
└── utils/
    └── asteroidRisk.js   # Logica de colores por peligrosidad
```

### 0.7 — Configurar instancias de Axios

Archivo: `src/api/nasaApi.js`

```js
import axios from 'axios'

export const nasaApi = axios.create({
  baseURL: 'https://api.nasa.gov',
  params: { api_key: import.meta.env.VITE_NASA_API_KEY },
})

export const nasaImagesApi = axios.create({
  baseURL: 'https://images-api.nasa.gov',
})

export const issApi = axios.create({
  baseURL: 'http://api.open-notify.org',
})
```

---

## Criterio de Aceptacion

- [ ] `npm run dev` levanta sin errores.
- [ ] Tailwind aplica la clase `bg-nasa-blue` correctamente.
- [ ] `.env` existe localmente y `.env.example` esta commiteado.
- [ ] Estructura de carpetas creada (pueden estar vacias con `.gitkeep`).
- [ ] Los contratos de datos estan documentados en `src/api/contracts.js`.
