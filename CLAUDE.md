# Afrocaracolas · reglas del proyecto

Sitio de **Afrocaracolas**, colectiva antirracista y afrofeminista de mujeres afromexicanas que trabaja en Afropulco y la Costa Chica de Guerrero. Dominio: afrocaracolas.org.

Objetivo del sitio: que una persona donante entienda qué hace la colectiva en territorio, vea su trabajo y quiera apoyar. La acción principal es **Dona**.

## Cómo trabajamos

- Alicia define cada bloque de trabajo junto con el chat de diseño. Laura (Claude Code) ejecuta un bloque a la vez.
- Al terminar cada bloque, Laura se detiene y entrega un reporte (formato al final de este archivo). No empieza el siguiente bloque por su cuenta.
- Si algo del bloque no está claro o contradice estas reglas, pregunta antes de hacerlo.

## Bloques

1. Base limpia
2. Sanity (modelo de contenido)
3. Inicio
4. Ejes, eje y proyecto
5. Nosotras, En el tiempo, Dona, Contacto y Observatorio
6. Revisión final y lanzamiento

## Reglas de git y despliegue

- Todo el trabajo va en la rama `rediseno`. Nunca hagas commit ni push a `main` ni merge a `main` sin una instrucción explícita.
- Producción (afrocaracolas.org) hoy es una página "Próximamente" subida a mano con Netlify Drop. No está conectada a este repo. No toques Netlify ni el DNS (Namecheap).
- El sitio nuevo se despliega en Vercel desde `rediseno` (rama de producción en Vercel): https://afrocaracolas.vercel.app y el Preview https://afrocaracolas-git-rediseno-imaliciaflores.vercel.app. El dominio afrocaracolas.org no se conecta hasta que Gema apruebe el lanzamiento.
- Commits pequeños y en español, que digan qué cambió (`Agrega franja multicolor al header`).
- No instales, quites ni actualices dependencias sin que el bloque lo pida. Si crees que hace falta una, propónla en el reporte.
- Nunca subas secretos. `.env` y `.env.local` deben estar en `.gitignore`.
- No uses enlaces simbólicos en el repo. Esta computadora es Windows y Vercel no los desempaqueta bien.

## Stack

- Astro (salida estática), TypeScript.
- Sanity como CMS. Studio en `studio/`. projectId `zw44t9i9`, dataset `production`.
- Despliegue en Vercel (salida estática, sin adaptador mientras no haga falta).
- Español (es-MX) en la v1. El sitio debe quedar listo para inglés: usa el i18n de Astro con `es` por defecto sin prefijo en la URL, y en Sanity deja los campos de texto preparados para traducción.

## Reglas de contenido (las más importantes)

- **Nunca inventes contenido**: ni textos, ni cifras, ni nombres, ni fechas, ni testimonios. Donde falte algo, pon un marcador entre corchetes que diga qué va ahí, por ejemplo `[Descripción del eje: qué problema atiende]`.
- Los textos son de la colectiva (Gema, la fundadora). Respeta su voz y sus palabras: "colectiva", "jovenas", "mayoras", "sentipensares", "voces cimarronas", "Saberes Itinerantes" (con mayúsculas).
- Afrocaracolas se describe como **colectiva antirracista y afrofeminista**. Es A.C., pero en los textos visibles se usa "colectiva".
- Fechas y números en formato es-MX.
- **Seguridad de las integrantes**: algunas viven violencia en Guerrero. No publiques nombres completos, localidades ni fotos de integrantes salvo que el contenido de Sanity lo traiga explícitamente autorizado.
- Donativos: Afrocaracolas **no es donataria autorizada** todavía. Cualquier sección de donar debe decir: "Afrocaracolas está en proceso de ser donataria autorizada. Por ahora los donativos no son deducibles de impuestos."

## Mapa del sitio

| Ruta | Página |
|---|---|
| `/` | Inicio |
| `/nosotras` | Nosotras (historia, integrantes, Saberes Itinerantes) |
| `/ejes` | Ejes de trabajo (los 7 ejes) |
| `/ejes/[eje]` | Página de un eje con sus proyectos |
| `/ejes/[eje]/[proyecto]` | Ficha de proyecto |
| `/en-el-tiempo` | Afrocaracolas en el tiempo (línea del tiempo por año, filtrable por eje) |
| `/observatorio` | Observatorio. En la v1 es "Próximamente"; el Índice llega en 2027 |
| `/dona` | Dona |
| `/contacto` | Contacto |

Redirecciones (301, en `vercel.json`): `/quienes-somos` → `/nosotras`, `/donar` → `/dona`.

Menú: Inicio · Nosotras · Ejes de trabajo · En el tiempo · Observatorio · Contacto · **Dona** (botón coral).

## Ejes y su color

Cada eje tiene un color fijo que se usa en todo el sitio (etiquetas, tarjetas, línea del tiempo, posts de redes).

| Eje | Slug | Color | Texto encima |
|---|---|---|---|
| Justicia climática y racial | `justicia-climatica-y-racial` | `#12A150` verde | negro |
| Granja Acuícola | `granja-acuicola` | `#0A75C2` azul | blanco |
| Autonomía política | `autonomia-politica` | `#6B1E92` morado | blanco |
| Autonomía económica | `autonomia-economica` | `#FFB627` mango | negro |
| Formación Cimarrona | `formacion-cimarrona` | `#FF5A36` coral | negro |
| EICAfro | `eicafro` | `#C2185B` magenta | blanco |
| Investigación afrocentrada | `investigacion-afrocentrada` | `#13A3A0` turquesa | negro |

Proyectos confirmados de Autonomía política: *Agenda Política de los derechos político-electorales de las mujeres afromexicanas* y *Cartilla de derechos de las mujeres afromexicanas*. Los demás ejes todavía no tienen proyectos confirmados.

## Diseño

La referencia visual aprobada es `docs/diseno/inicio-referencia.html`. Úsala para colores, tamaños, espaciados y orden de secciones. No copies su JavaScript ni sus etiquetas `<x-dc>`, `<sc-for>` o `{{ }}`: son del prototipo, no de Astro.

Tokens (defínelos una sola vez como variables CSS):

- Base: negro `#141013`, negro secundario `#1F181E`, blanco `#FFFFFF`, gris texto sobre negro `#D8D0D9`.
- Paleta: los 7 colores de la tabla de ejes. El coral `#FF5A36` es el color de **Dona**.
- Tipografía: **Bricolage Grotesque** (800) para títulos y **Atkinson Hyperlegible** (400/700) para texto. Cárgalas autoalojadas (Fontsource) si el bloque lo autoriza; si no, desde Google Fonts.
- Títulos grandes con `letter-spacing: -0.02em` y `text-wrap: balance`. Etiquetas pequeñas en mayúsculas con `letter-spacing: 0.12em`.
- Esquinas rectas o casi rectas (4–6 px). Nada de tarjetas muy redondeadas.
- Recursos de identidad: franja multicolor con los 7 colores bajo el header y al final del footer; marcos negros gruesos en fotos; sombras sólidas desplazadas (`10px 10px 0`) en tarjetas destacadas.
- Secciones de fondo completo en color, alternando con negro.

## Accesibilidad y calidad

- Contraste mínimo 4.5:1. Respeta la columna "Texto encima" de la tabla de ejes.
- HTML semántico: `<button>` para acciones, `<a>` para navegación, `alt` en todas las imágenes (vacío si es decorativa), `aria-label` en botones de solo ícono.
- Foco visible en todo lo navegable. Respeta `prefers-reduced-motion`.
- Todo funciona en celular (desde 360 px). El menú se colapsa en móvil.
- Imágenes con `astro:assets` o el CDN de imágenes de Sanity, con tamaños responsivos y `loading="lazy"` fuera del primer pantallazo.
- Sin emojis como íconos. Íconos SVG de trazo, en línea.

## Formato del reporte al final de cada bloque

1. Resumen en 3–5 líneas.
2. Lista de lo que hiciste, con los commits.
3. Cómo probarlo (comandos y URLs: localhost y Preview de Vercel si aplica).
4. Lo que no pudiste hacer o dejaste pendiente, y por qué.
5. Dudas o decisiones que necesitas de Alicia.
