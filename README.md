# Afrocaracolas · sitio web

Sitio de **Afrocaracolas**, colectiva antirracista y afrofeminista de mujeres afromexicanas que trabaja en Afropulco y la Costa Chica de Guerrero ([afrocaracolas.org](https://afrocaracolas.org)).

- Sitio: [Astro](https://astro.build) con salida estática y TypeScript.
- Contenido: [Sanity](https://www.sanity.io). El Studio vive en `studio/` (projectId `zw44t9i9`, dataset `production`).
- Despliegue: Vercel, como Preview de la rama `rediseno`.

Las reglas del proyecto (contenido, diseño, git) están en [CLAUDE.md](CLAUDE.md).

## Cómo correrlo

Requiere Node 22.12 o más reciente.

```sh
npm install
cp .env.example .env   # y llena los valores
npm run dev            # http://localhost:4321
npm run build          # genera el sitio en dist/
npm run preview        # sirve dist/ en local
```

Studio de Sanity (aparte, con sus propias dependencias):

```sh
cd studio
npm install
npm run dev            # http://localhost:3333
```

## Variables de entorno

Van en `.env` (no se sube al repo). La plantilla es `.env.example`.

| Variable | Para qué sirve | Obligatoria |
|---|---|---|
| `SANITY_PROJECT_ID` | Proyecto de Sanity (`zw44t9i9`). Si falta, el sitio se construye sin leer contenido de Sanity. | No |
| `SANITY_DATASET` | Dataset de Sanity. Por defecto `production`. | No |
| `DONORBOX_URL` | URL del formulario de Donorbox para la página Dona. | No |

El sitio solo lee contenido publicado por el CDN de Sanity, así que no necesita token.
