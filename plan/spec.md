# Spec: NASA Cosmos Explorer Web App (Deep Space Explorer)

## 1. Visión General del Proyecto
Crear una plataforma web inmersiva utilizando React que consuma las APIs oficiales de la NASA para visualizar datos, imágenes y videos del universo, con un enfoque especial en la misión Artemis II y herramientas interactivas como el rastreo de la ISS.

APIKEY_NASA = OyJyC3ayfejho8bMdJa5fSgVUcbOHyYHcGxzWDkR

## 2. Stack Tecnológico
- **Framework:** React (Vite)
- **Estilos:** Tailwind CSS (Diseño oscuro/espacial)
- **Iconografía:** Lucide React
- **Estado/Fetching:** Axios + React Query (o Hooks nativos con useEffect)
- **Enrutamiento:** React Router DOM
- **Modelos 3D:** @react-three/fiber (Three.js) para la sección Artemis
- **Mapas:** React-Leaflet para el rastreo de la ISS

## 3. Especificaciones de API (Contratos)

### 3.1. APOD (Imagen del día)
- **Endpoint:** `GET https://api.nasa.gov/planetary/apod`
- **Campos Clave:** `url`, `hdurl`, `title`, `explanation`, `media_type`.

### 3.2. NASA Image & Video Library (Buscador y Artemis)
- **Endpoint:** `GET https://images-api.nasa.gov/search`
- **Query Artemis II:** `?q=Artemis II&media_type=image,video`
- **Campos Clave:** `collection.items[].data[0]`, `links[0].href` (thumbnail).

### 3.3. NeoWs (Asteroides)
- **Endpoint:** `GET https://api.nasa.gov/neo/rest/v1/feed`
- **Campos Clave:** `near_earth_objects`, `is_potentially_hazardous_asteroid`.

### 3.4. ISS Tracker (API Externa)
- **Endpoint:** `GET http://api.open-notify.org/iss-now.json`
- **Campos Clave:** `iss_position` (latitude, longitude).

## 4. Arquitectura de Componentes (Jerarquía)

### Layout Principal
- `Navbar`: Enlaces a Home, Galería, Artemis, Radar de Asteroides e ISS.
- `Sidebar`: Widget rápido con el estado de la ISS y alertas de asteroides.

### Vistas (Pages)
1. **`Home.jsx`**: Hero section con el APOD como fondo dinámico.
2. **`Explorer.jsx`**: Barra de búsqueda conectada a la librería de la NASA con filtros por tipo de media.
3. **`ArtemisSection.jsx`**: 
    - Galería de imágenes filtradas.
    - Modelo 3D de la cápsula Orion (opcional).
    - Cronograma de la misión.
4. **`AsteroidRadar.jsx`**: Tabla/Lista con asteroides cercanos filtrados por peligrosidad.
5. **`ISSTracker.jsx`**: Mapa interactivo con la posición de la estación.

## 5. Roadmap de Implementación (Fases)

### Fase 1: Setup y Estructura (Día 1)
- [ ] Inicializar proyecto con Vite + Tailwind.
- [ ] Configurar `react-router-dom` y definir las rutas básicas.
- [ ] Crear el layout global (Navbar inmersiva).

### Fase 2: Integración de Core APIs (Día 2)
- [ ] Implementar `Home` con el APOD. Manejar estados de carga y error.
- [ ] Implementar buscador en `Explorer` usando la API de búsqueda.
- [ ] Crear componente de tarjeta multimedia (`MediaCard`) reutilizable.

### Fase 3: Artemis II y Secciones Especiales (Día 3)
- [ ] Crear vista `ArtemisSection` con búsqueda prefijada.
- [ ] Implementar el rastreador de la ISS con `react-leaflet`.
- [ ] Añadir sección de asteroides con lógica de colores por riesgo.

### Fase 4: Interactividad y Pulido (Día 4)
- [ ] Implementar "Favoritos" usando `localStorage`.
- [ ] Añadir animaciones de entrada (Framer Motion).
- [ ] Optimización de imágenes y responsive design.

## 6. Instrucciones para el Agente (Windsurf/Copilot)
- **Diseño:** Utiliza una paleta de colores basada en `#0B3D91` (NASA Blue), `#000000` y acentos de blanco/gris galáctico.
- **Seguridad:** No expongas la API KEY directamente. Usa un archivo `.env`.
- **Patrones:** Sigue el principio de componentes funcionales y hooks personalizados para la lógica de las APIs.
