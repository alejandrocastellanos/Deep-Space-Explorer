# Fase 3 — Secciones Especiales: Artemis, Asteroides e ISS

> **Objetivo:** Implementar las 3 vistas tematicas con sus APIs respectivas y conectar el Sidebar.
> Ref. spec: §3.2, §3.3, §3.4, §4 (ArtemisSection, AsteroidRadar, ISSTracker, Sidebar), §5 Fase 3

---

## Contratos de API

### Artemis II — NASA Images (spec §3.2)
```
GET https://images-api.nasa.gov/search?q=Artemis+II&media_type=image,video

Mismo shape que useNASASearch. Query prefijada: "Artemis II"
```

### NeoWs — Asteroides (spec §3.3)
```
GET https://api.nasa.gov/neo/rest/v1/feed?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&api_key=KEY

Response shape relevante:
{
  near_earth_objects: {
    "YYYY-MM-DD": [
      {
        name: string,
        nasa_jpl_url: string,
        is_potentially_hazardous_asteroid: boolean,
        estimated_diameter: {
          kilometers: { estimated_diameter_min: number, estimated_diameter_max: number }
        },
        close_approach_data: [{
          close_approach_date: string,
          miss_distance: { kilometers: string },
          relative_velocity: { kilometers_per_hour: string }
        }]
      }
    ]
  }
}
```

### ISS Position (spec §3.4)
```
GET http://api.open-notify.org/iss-now.json

Response shape:
{
  iss_position: { latitude: string, longitude: string },
  timestamp: number,
  message: 'success'
}
```

---

## Tareas

### 3.1 — Crear hook `useArtemis`

Archivo: `src/hooks/useArtemis.js`

- Reutiliza la logica de `useNASASearch` con query fija `"Artemis II"`.
- Filtra para incluir `image` y `video`.

```js
import { useNASASearch } from './useNASASearch'

export function useArtemis() {
  return useNASASearch({ query: 'Artemis II', mediaType: 'image,video' })
}
```

### 3.2 — Implementar `ArtemisSection.jsx`

Archivo: `src/pages/ArtemisSection.jsx`

Estructura de la vista:
1. **Hero banner** con texto "Mision Artemis II" y subtitulo.
2. **Galeria de imagenes/videos** usando `MediaCard` (misma que Explorer).
   - Filtro interno: solo imagenes / solo videos.
3. **Cronograma de la mision** — timeline estatico con hitos clave:
   - Hitos sugeridos: anuncio de la tripulacion, fecha de lanzamiento estimada, objetivos.
   - Componente `TimelineItem` con fecha, titulo y descripcion.
4. **(Opcional) Modelo 3D Orion** — ver tarea 3.3.

### 3.3 — (Opcional) Modelo 3D Orion con `@react-three/fiber`

Archivo: `src/components/OrionModel.jsx`

- Carga un modelo `.glb` de la capsula Orion.
- Rotacion automatica con `useFrame`.
- `<Suspense>` con fallback de texto "Cargando modelo...".
- Solo renderizar si el navegador soporta WebGL.

> Marcar como opcional segun spec §4. Implementar solo si hay modelo 3D disponible.

### 3.4 — Crear hook `useAsteroids`

Archivo: `src/hooks/useAsteroids.js`

- Calcula `start_date` y `end_date` (hoy y hoy + 7 dias).
- Llama a `GET /neo/rest/v1/feed`.
- Aplana `near_earth_objects` en un array unico.
- Ordena: peligrosos primero.
- Retorna `{ asteroids, hazardousCount, isLoading, isError }`.

```js
// Logica de aplanamiento:
const all = Object.values(data.near_earth_objects).flat()
const sorted = all.sort((a, b) =>
  b.is_potentially_hazardous_asteroid - a.is_potentially_hazardous_asteroid
)
```

### 3.5 — Crear utilidad `asteroidRisk`

Archivo: `src/utils/asteroidRisk.js`

```js
// Retorna clases de Tailwind segun peligrosidad
export function riskColor(isHazardous) {
  return isHazardous
    ? 'text-red-500 border-red-500'
    : 'text-green-400 border-green-400'
}

export function riskLabel(isHazardous) {
  return isHazardous ? 'PELIGROSO' : 'SEGURO'
}
```

### 3.6 — Implementar `AsteroidRadar.jsx`

Archivo: `src/pages/AsteroidRadar.jsx`

Estructura de la vista:
1. **Header** con titulo y conteo total / conteo peligrosos.
2. **Filtro** toggle: Todos / Solo Peligrosos.
3. **Tabla o lista de tarjetas** con columnas:
   - Nombre del asteroide
   - Diametro estimado (km min–max)
   - Velocidad relativa (km/h)
   - Distancia de aproximacion (km)
   - Badge de riesgo (rojo/verde segun `riskColor`)
4. Click en asteroide: link a `nasa_jpl_url` en nueva pestana.

### 3.7 — Crear hook `useISSPosition`

Archivo: `src/hooks/useISSPosition.js`

- Polling cada 5 segundos con `refetchInterval`.
- Convierte `latitude` y `longitude` de string a number.
- Retorna `{ position: { lat, lng }, timestamp, isLoading }`.

```js
import { useQuery } from '@tanstack/react-query'
import { issApi } from '../api/nasaApi'

export function useISSPosition() {
  return useQuery({
    queryKey: ['iss-position'],
    queryFn: () => issApi.get('/iss-now.json').then(r => ({
      lat: parseFloat(r.data.iss_position.latitude),
      lng: parseFloat(r.data.iss_position.longitude),
      timestamp: r.data.timestamp,
    })),
    refetchInterval: 5000,
  })
}
```

### 3.8 — Implementar `ISSTracker.jsx`

Archivo: `src/pages/ISSTracker.jsx`

- Importar CSS de Leaflet en `main.jsx` o en el componente.
- `<MapContainer>` con `center` en posicion actual de la ISS.
- `<TileLayer>` con mapa oscuro (tile de CartoDB Dark Matter).
- `<Marker>` con icono personalizado (icono de satelite).
- `<Popup>` con lat/lng y timestamp formateado.
- El mapa se mueve (`setView`) automaticamente con cada actualizacion.
- Panel lateral con: latitud, longitud y ultima actualizacion.

**Tile URL oscuro:**
```
https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
```

### 3.9 — Conectar `Sidebar` con datos reales

Archivo: `src/components/Sidebar.jsx`

- Usar `useISSPosition()` para mostrar lat/lng en vivo.
- Usar `useAsteroids()` para mostrar `hazardousCount` con icono de alerta.
- Actualizar sin parpadeo (React Query maneja el background refetch).

---

## Criterio de Aceptacion

- [ ] `ArtemisSection` muestra galeria filtrada de imagenes y videos de Artemis II.
- [ ] Cronograma de mision visible con al menos 3 hitos.
- [ ] `AsteroidRadar` lista NEOs de los proximos 7 dias.
- [ ] Asteroides peligrosos aparecen en rojo, seguros en verde.
- [ ] `ISSTracker` muestra el mapa con la posicion actual de la ISS.
- [ ] El marcador de la ISS se mueve en el mapa cada 5 segundos.
- [ ] `Sidebar` muestra datos reales de ISS y conteo de asteroides peligrosos.
