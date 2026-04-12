# Checklist SDD — Validacion Final contra spec.md

> Antes de considerar el proyecto completo, cada item de `spec.md` debe tener cobertura verificada.
> Marcar cada item al completarse. Si un item falla, volver a la fase correspondiente.

---

## Stack Tecnologico (spec §2)

- [ ] React + Vite inicializado y corriendo
- [ ] Tailwind CSS configurado con paleta NASA
- [ ] Lucide React instalado y en uso
- [ ] Axios instalado
- [ ] React Query (`@tanstack/react-query`) configurado con `QueryClientProvider`
- [ ] React Router DOM con 5 rutas activas
- [ ] `@react-three/fiber` instalado (opcional: modelo 3D activo)
- [ ] React-Leaflet con mapa de ISS funcionando
- [ ] Framer Motion con animaciones visibles

---

## Contratos de API (spec §3)

### APOD (spec §3.1)
- [ ] Endpoint correcto: `GET https://api.nasa.gov/planetary/apod`
- [ ] Campos usados: `url`, `hdurl`, `title`, `explanation`, `media_type`
- [ ] Manejo de `media_type: 'video'`

### NASA Image & Video Library (spec §3.2)
- [ ] Endpoint correcto: `GET https://images-api.nasa.gov/search`
- [ ] Query Artemis II: `?q=Artemis+II&media_type=image,video`
- [ ] Campos usados: `collection.items[].data[0]`, `links[0].href`

### NeoWs (spec §3.3)
- [ ] Endpoint correcto: `GET https://api.nasa.gov/neo/rest/v1/feed`
- [ ] Campo `is_potentially_hazardous_asteroid` usado para filtrar/colorear
- [ ] Objeto `near_earth_objects` correctamente aplanado

### ISS Tracker (spec §3.4)
- [ ] Endpoint correcto: `GET http://api.open-notify.org/iss-now.json`
- [ ] Campos `latitude` y `longitude` usados en el mapa
- [ ] Polling cada 5 segundos activo

---

## Arquitectura de Componentes (spec §4)

### Layout Principal
- [ ] `Navbar` con enlaces a: Home, Galeria, Artemis, Radar de Asteroides, ISS
- [ ] `Sidebar` con widget de estado de ISS
- [ ] `Sidebar` con alertas de asteroides peligrosos

### Vistas
- [ ] `Home.jsx` — hero con APOD como fondo dinamico
- [ ] `Explorer.jsx` — barra de busqueda conectada a libreria NASA con filtros de media
- [ ] `ArtemisSection.jsx` — galeria de imagenes filtradas por "Artemis II"
- [ ] `ArtemisSection.jsx` — cronograma de la mision
- [ ] `AsteroidRadar.jsx` — lista/tabla con asteroides cercanos filtrados por peligrosidad
- [ ] `ISSTracker.jsx` — mapa interactivo con posicion de la estacion
- [ ] `MediaCard` — componente reutilizable (usado en Explorer y Artemis)

---

## Roadmap (spec §5)

### Fase 1
- [ ] Proyecto Vite + Tailwind inicializado
- [ ] React Router DOM con rutas basicas
- [ ] Layout global con Navbar inmersiva

### Fase 2
- [ ] Home con APOD con estados de carga y error
- [ ] Buscador en Explorer con API de busqueda
- [ ] Componente MediaCard reutilizable creado

### Fase 3
- [ ] Vista ArtemisSection con busqueda prefijada
- [ ] ISS Tracker con react-leaflet
- [ ] Seccion de asteroides con logica de colores por riesgo

### Fase 4
- [ ] Favoritos con localStorage
- [ ] Animaciones de entrada con Framer Motion
- [ ] Optimizacion de imagenes y responsive design

---

## Instrucciones del Agente (spec §6)

- [ ] Paleta `#0B3D91`, `#000000` y acentos blanco/gris aplicada
- [ ] API KEY en `.env`, nunca hardcodeada en el codigo
- [ ] Componentes funcionales con hooks personalizados para logica de APIs

---

## Resumen de cobertura

| Seccion spec | Items | Completados |
|-------------|-------|-------------|
| §2 Stack | 9 | 0 |
| §3 APIs | 11 | 0 |
| §4 Componentes | 12 | 0 |
| §5 Roadmap | 12 | 0 |
| §6 Instrucciones | 3 | 0 |
| **Total** | **47** | **0** |

> Actualizar contadores al completar cada item.
