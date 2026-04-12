# Fase 2 — Core APIs: APOD + Explorer

> **Objetivo:** Home con fondo dinamico del APOD y buscador funcional conectado a la libreria NASA.
> Ref. spec: §3.1, §3.2, §4 (Home, Explorer, MediaCard), §5 Fase 2

---

## Contratos de API

### APOD (spec §3.1)
```
GET https://api.nasa.gov/planetary/apod?api_key=KEY

Response shape:
{
  url: string,          // URL de la imagen o video
  hdurl: string,        // URL en alta resolucion
  title: string,
  explanation: string,
  media_type: 'image' | 'video',
  date: string
}
```

### NASA Image & Video Library (spec §3.2)
```
GET https://images-api.nasa.gov/search?q=<query>&media_type=image,video

Response shape:
{
  collection: {
    items: [
      {
        data: [{
          title: string,
          description: string,
          nasa_id: string,
          media_type: 'image' | 'video',
          date_created: string
        }],
        links: [{ href: string }]   // thumbnail URL
      }
    ]
  }
}
```

---

## Tareas

### 2.1 — Crear hook `useAPOD`

Archivo: `src/hooks/useAPOD.js`

- Llama a `GET /planetary/apod` via `nasaApi`.
- Retorna `{ data, isLoading, isError, error }`.
- Usar React Query (`useQuery`) con key `['apod']`.
- Cache de 24h (la imagen cambia una vez al dia).

```js
import { useQuery } from '@tanstack/react-query'
import { nasaApi } from '../api/nasaApi'

export function useAPOD() {
  return useQuery({
    queryKey: ['apod'],
    queryFn: () => nasaApi.get('/planetary/apod').then(r => r.data),
    staleTime: 1000 * 60 * 60 * 24,
  })
}
```

### 2.2 — Implementar `Home.jsx`

Archivo: `src/pages/Home.jsx`

- Usa `useAPOD()`.
- **Estado loading:** skeleton o spinner centrado.
- **Estado error:** mensaje con icono `AlertCircle` de Lucide.
- **Estado success:**
  - Si `media_type === 'image'`: fondo de pantalla completa con la imagen (`bg-cover bg-center`).
  - Si `media_type === 'video'`: embed de YouTube o fallback a imagen estatica.
  - Overlay oscuro semi-transparente sobre el fondo.
  - Titulo de la imagen en tipografia grande.
  - Descripcion (explanation) con scroll, max 3 lineas con "ver mas".
  - Badge con la fecha.

### 2.3 — Crear hook `useNASASearch`

Archivo: `src/hooks/useNASASearch.js`

- Recibe `{ query, mediaType }`.
- Llama a `GET https://images-api.nasa.gov/search`.
- No hace fetch si `query` esta vacia.
- Retorna `{ results, isLoading, isError }`.
- `results` es el array de items mapeado al shape:
  ```js
  { id, title, description, mediaType, thumbnail, date }
  ```

```js
import { useQuery } from '@tanstack/react-query'
import { nasaImagesApi } from '../api/nasaApi'

export function useNASASearch({ query, mediaType = 'image,video' }) {
  return useQuery({
    queryKey: ['nasa-search', query, mediaType],
    queryFn: () =>
      nasaImagesApi
        .get('/search', { params: { q: query, media_type: mediaType } })
        .then(r => r.data.collection.items.map(item => ({
          id: item.data[0].nasa_id,
          title: item.data[0].title,
          description: item.data[0].description,
          mediaType: item.data[0].media_type,
          thumbnail: item.links?.[0]?.href,
          date: item.data[0].date_created,
        }))),
    enabled: !!query,
  })
}
```

### 2.4 — Crear componente `MediaCard`

Archivo: `src/components/MediaCard.jsx`

Props: `{ id, title, description, mediaType, thumbnail, date }`

- Tarjeta con imagen de fondo (`thumbnail`).
- Badge de tipo: `IMAGE` / `VIDEO` con color diferente.
- Titulo truncado a 2 lineas.
- Fecha formateada.
- Hover: overlay con descripcion corta.
- Icono de favorito (corazon) en esquina — funcionalidad en Fase 4.
- Click: abre modal o navega a detalle (definir en esta fase).

### 2.5 — Implementar `Explorer.jsx`

Archivo: `src/pages/Explorer.jsx`

- Barra de busqueda controlada con `useState`.
- Filtro de tipo de media: Todos / Solo Imagenes / Solo Videos (botones toggle).
- Debounce de 500ms antes de disparar la busqueda.
- Grid responsivo de `MediaCard` (1 col mobile, 3 col desktop).
- Estado vacio: mensaje "Busca imagenes y videos del universo".
- Estado loading: grid de skeletons.
- Estado error: mensaje de error con retry.

---

## Criterio de Aceptacion

- [ ] `Home` muestra la imagen o video del dia de la NASA como fondo.
- [ ] `Home` maneja loading y error visualmente.
- [ ] `Explorer` retorna resultados al escribir en la barra de busqueda.
- [ ] `MediaCard` distingue visualmente imagenes de videos.
- [ ] Filtros de tipo de media funcionan correctamente.
- [ ] No se expone la API key en el codigo fuente (viene de `.env`).
