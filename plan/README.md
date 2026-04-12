# Plan de Implementacion — Deep Space Explorer

> Metodologia: **Spec Driven Development (SDD)**
> La spec es la fuente de verdad. Cada tarea implementa un contrato definido en `spec.md`.
> Nada se construye sin un contrato previo.

## Indice de Fases

| Fase | Archivo | Descripcion |
|------|---------|-------------|
| 0 | [fase-0-contratos-setup.md](./fase-0-contratos-setup.md) | Contratos de datos, dependencias y estructura base |
| 1 | [fase-1-layout-enrutamiento.md](./fase-1-layout-enrutamiento.md) | Navbar, Sidebar y React Router DOM |
| 2 | [fase-2-core-apis.md](./fase-2-core-apis.md) | APOD + buscador Explorer |
| 3 | [fase-3-secciones-especiales.md](./fase-3-secciones-especiales.md) | Artemis II, Asteroides e ISS Tracker |
| 4 | [fase-4-pulido-validacion.md](./fase-4-pulido-validacion.md) | Favoritos, animaciones, responsive y auditoria final |
| — | [checklist-sdd.md](./checklist-sdd.md) | Checklist de validacion contra la spec completa |

## Principios SDD aplicados

1. **Spec como contrato:** Cada tarea referencia el numero de seccion de `spec.md` que implementa.
2. **Contratos de datos primero:** Los shapes de las APIs se definen en Fase 0, antes de cualquier componente.
3. **Criterios de aceptacion por fase:** Cada fase tiene condiciones observables que confirman que la spec fue cumplida.
4. **Sin over-engineering:** Solo se implementa lo que esta en la spec. Los opcionales estan marcados como tal.

## Referencia rapida del stack (spec §2)

| Tecnologia | Uso |
|------------|-----|
| React + Vite | Framework base |
| Tailwind CSS | Estilos con paleta NASA `#0B3D91` |
| Lucide React | Iconografia |
| Axios + React Query | Fetching de APIs |
| React Router DOM | Enrutamiento de 5 vistas |
| @react-three/fiber | Modelo 3D Orion (opcional) |
| React-Leaflet | Mapa ISS Tracker |
| Framer Motion | Animaciones (Fase 4) |
