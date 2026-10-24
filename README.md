# Afrocaracolas · sitio web

Sitio de **Afrocaracolas**, colectiva antirracista y afrofeminista de mujeres afromexicanas que trabaja en Afropulco y la Costa Chica de Guerrero ([afrocaracolas.org](https://afrocaracolas.org)).

- Sitio: [Astro](https://astro.build) con salida estática y TypeScript.
- Contenido: [Sanity](https://www.sanity.io). El Studio vive en `studio/` (projectId `zw44t9i9`, dataset `production`).
- Despliegue: Vercel, desde la rama `rediseno`. Las redirecciones 301 están en `vercel.json`.

Las reglas del proyecto (contenido, diseño, git) están en [CLAUDE.md](CLAUDE.md).

## Cómo correrlo

Requiere Node 22.12 o más reciente.

```sh
npm install
cp .env.example .env.local   # y llena los valores
npm run dev                  # http://localhost:4321
npm run build                # genera el sitio en dist/
npm run preview              # sirve dist/ en local
```

Studio de Sanity (aparte, con sus propias dependencias):

```sh
cd studio
npm install
npm run dev                  # http://localhost:3333
npm run deploy               # publica en https://afrocaracolas.sanity.studio
```

## Contenido

El sitio lee de Sanity solo el contenido **publicado**, por el CDN y sin token. Las consultas están en `src/lib/queries.ts`.

Los colores de los ejes no están en Sanity: viven en `src/data/ejes.ts` y se asocian por el slug del eje.

Carga inicial (ejes, proyectos, ajustes y textos de `docs/contenido/`):

```sh
npm run carga-inicial -- --simular   # muestra lo que cargaría, sin escribir
npm run carga-inicial                # crea lo que falta; no pisa lo editado en el Studio
npm run carga-inicial -- --forzar    # reemplaza esos campos con los textos de docs/
```

## Variables de entorno

Van en `.env.local` (no se sube al repo). La plantilla es `.env.example`.

| Variable | Para qué sirve | Dónde |
|---|---|---|
| `SANITY_PROJECT_ID` | Proyecto de Sanity (`zw44t9i9`). Obligatoria: sin ella el build falla. | Local y Vercel |
| `SANITY_DATASET` | Dataset de Sanity (`production`). Obligatoria: sin ella el build falla. | Local y Vercel |
| `SANITY_WRITE_TOKEN` | Token con permiso de escritura, solo para `npm run carga-inicial`. | Solo local |

La URL de Donorbox, el correo y las redes se editan en el Studio, en **Ajustes del sitio**.
