import { getSanityClient } from './sanity';

// Consultas a Sanity para las páginas del sitio (bloques 3, 4 y 5).
// Los textos en dos idiomas ({ es, en }) se resuelven aquí: se pide `lang` y,
// si ese idioma está vacío, se usa el español.

export type Lang = 'es' | 'en';

const l = (campo: string) => `coalesce(${campo}[$lang], ${campo}.es)`;

// ── Tipos ─────────────────────────────────────────────────────────────────

/** Portable Text tal como lo guarda Sanity. */
export type Bloques = { _type: string; _key: string; [campo: string]: unknown }[];

export interface Imagen {
  url: string;
  ancho: number;
  alto: number;
  lqip?: string;
  alt: string;
  pie?: string;
}

export interface EjeResumen {
  _id: string;
  slug: string;
  orden: number;
  nombre: string;
  descripcionCorta?: string;
  fotoPrincipal?: Imagen;
  proyectos: ProyectoResumen[];
}

export interface Eje extends EjeResumen {
  descripcion?: Bloques;
  galeria: Imagen[];
  notas: NotaResumen[];
  publicaciones: PublicacionRedes[];
}

export interface EjeRef {
  slug: string;
  nombre: string;
}

export interface ProyectoResumen {
  _id: string;
  slug: string;
  nombre: string;
  estado: 'activo' | 'concluido';
  resumen?: string;
  fotoPrincipal?: Imagen;
  eje: EjeRef;
}

export interface Proyecto extends ProyectoResumen {
  fechaInicio?: string;
  fechaFin?: string;
  porQue?: string;
  queHacemos?: Bloques;
  lugar?: string;
  conQuien?: string;
  queFalta?: string;
  galeria: Imagen[];
  cita?: { texto: string; autora?: string; comunidad?: string };
  cifras: { valor: string; etiqueta: string }[];
  descargables: { titulo: string; url: string; tamano?: number }[];
  destacado: boolean;
  notas: NotaResumen[];
  publicaciones: PublicacionRedes[];
}

export interface NotaResumen {
  _id: string;
  slug: string;
  titulo: string;
  fecha?: string;
  resumen?: string;
  tipo: 'noticia' | 'momento' | 'archivoHistorico';
  imagen?: { url: string; alt?: string };
  eje?: EjeRef;
  proyecto?: { slug: string; nombre: string };
}

export interface Nota extends NotaResumen {
  cuerpo?: Bloques;
  archivos: { titulo: string; url: string }[];
}

export interface PublicacionRedes {
  _id: string;
  red: 'instagram' | 'facebook' | 'tiktok';
  url: string;
  titulo: string;
  texto?: string;
  fecha: string;
  lugar?: string;
  portada?: Imagen;
  video?: string;
  eje?: EjeRef;
  proyecto?: { slug: string; nombre: string };
}

export interface Integrante {
  _id: string;
  nombreVisible: string;
  rol?: string;
  descripcion?: string;
  /** Solo viene si la integrante autorizó mostrar su foto (mostrarFoto). */
  foto?: Imagen;
}

export interface Ajustes {
  correo?: string;
  redes: { instagram?: string; facebook?: string; tiktok?: string };
  donorboxUrl?: string;
}

export interface PaginaNosotras {
  intro?: Bloques;
  mision?: Bloques;
  vision?: Bloques;
  porQueAfrocaracolas?: Bloques;
  comoTrabajamos?: Bloques;
  incidencia?: Bloques;
  saberesItinerantes?: Bloques;
  comoEmpezamos?: Bloques;
  fraseCierre?: string;
}

export interface PaginaDona {
  porQueDonar?: Bloques;
  usos: { titulo: string; texto?: string; eje?: EjeRef }[];
  otrasFormas?: Bloques;
  preguntasFrecuentes: { pregunta: string; respuesta: string }[];
}

// ── Fragmentos GROQ ───────────────────────────────────────────────────────

const imagen = (campo: string) => `${campo}{
  "url": asset->url,
  "ancho": asset->metadata.dimensions.width,
  "alto": asset->metadata.dimensions.height,
  "lqip": asset->metadata.lqip,
  "alt": ${l('alt')},
  "pie": ${l('pie')}
}`;

const galeria = `"galeria": coalesce(galeria[]${imagen('')}, [])`;

const ejeRef = `"eje": eje->{ "slug": slug.current, "nombre": ${l('nombre')} }`;

const proyectoResumen = `{
  _id,
  "slug": slug.current,
  "nombre": ${l('nombre')},
  estado,
  "resumen": ${l('resumen')},
  "fotoPrincipal": ${imagen('fotoPrincipal')},
  ${ejeRef}
}`;

const notaCampos = `
  _id,
  "slug": slug.current,
  "titulo": ${l('title')},
  "fecha": publishedAt,
  "resumen": ${l('excerpt')},
  "tipo": coalesce(tipo, "noticia"),
  "imagen": heroImage{ "url": asset->url, "alt": altText },
  ${ejeRef},
  "proyecto": proyecto->{ "slug": slug.current, "nombre": ${l('nombre')} }
`;

const notaResumen = `{${notaCampos}}`;

const publicacion = `{
  _id,
  red,
  url,
  "titulo": ${l('titulo')},
  "texto": ${l('texto')},
  fecha,
  "lugar": ${l('lugar')},
  "portada": ${imagen('portada')},
  "video": video.asset->url,
  ${ejeRef},
  "proyecto": proyecto->{ "slug": slug.current, "nombre": ${l('nombre')} }
}`;

const ejeResumen = `
  _id,
  "slug": slug.current,
  orden,
  "nombre": ${l('nombre')},
  "descripcionCorta": ${l('descripcionCorta')},
  "fotoPrincipal": ${imagen('fotoPrincipal')},
  "proyectos": *[_type == "proyecto" && eje._ref == ^._id] | order(nombre.es asc) ${proyectoResumen}
`;

// ── Consultas ─────────────────────────────────────────────────────────────

function fetch<T>(query: string, params: Record<string, unknown> = {}): Promise<T> {
  return getSanityClient().fetch<T>(query, { lang: 'es', ...params });
}

/** Ajustes generales: correo, redes, Donorbox. */
export function getAjustes(lang: Lang = 'es') {
  return fetch<Ajustes>(
    `*[_id == "ajustesSitio"][0]{
      correo,
      "redes": coalesce(redes, {}),
      donorboxUrl
    }`,
    { lang },
  );
}

/** Los 7 ejes en orden, con sus proyectos (Inicio y /ejes). */
export function getEjes(lang: Lang = 'es') {
  return fetch<EjeResumen[]>(`*[_type == "eje" && defined(slug.current)] | order(orden asc) { ${ejeResumen} }`, {
    lang,
  });
}

/** Un eje con descripción, galería, proyectos, notas y publicaciones (/ejes/[eje]). */
export function getEje(slug: string, lang: Lang = 'es') {
  return fetch<Eje | null>(
    `*[_type == "eje" && slug.current == $slug][0]{
      ${ejeResumen},
      "descripcion": ${l('descripcion')},
      ${galeria},
      "notas": *[_type == "nota" && eje._ref == ^._id] | order(publishedAt desc)[0...6] ${notaResumen},
      "publicaciones": *[_type == "publicacionRedes" && eje._ref == ^._id] | order(fecha desc)[0...8] ${publicacion}
    }`,
    { slug, lang },
  );
}

/** Todos los proyectos con su eje (rutas /ejes/[eje]/[proyecto]). */
export function getProyectos(lang: Lang = 'es') {
  return fetch<ProyectoResumen[]>(
    `*[_type == "proyecto" && defined(slug.current) && defined(eje->slug.current)] | order(nombre.es asc) ${proyectoResumen}`,
    { lang },
  );
}

/** Proyectos marcados como destacados (Inicio). */
export function getProyectosDestacados(lang: Lang = 'es') {
  return fetch<ProyectoResumen[]>(
    `*[_type == "proyecto" && destacado == true && defined(eje->slug.current)] | order(fechaInicio desc) ${proyectoResumen}`,
    { lang },
  );
}

/** Ficha completa de un proyecto (/ejes/[eje]/[proyecto]). */
export function getProyecto(ejeSlug: string, slug: string, lang: Lang = 'es') {
  return fetch<Proyecto | null>(
    `*[_type == "proyecto" && slug.current == $slug && eje->slug.current == $ejeSlug][0]{
      _id,
      "slug": slug.current,
      "nombre": ${l('nombre')},
      estado,
      fechaInicio,
      fechaFin,
      "resumen": ${l('resumen')},
      "porQue": ${l('porQue')},
      "queHacemos": ${l('queHacemos')},
      "lugar": ${l('lugar')},
      "conQuien": ${l('conQuien')},
      "queFalta": ${l('queFalta')},
      "fotoPrincipal": ${imagen('fotoPrincipal')},
      ${galeria},
      "cita": cita{ "texto": ${l('texto')}, "autora": ${l('autora')}, "comunidad": ${l('comunidad')} },
      "cifras": coalesce(cifras[]{ valor, "etiqueta": ${l('etiqueta')} }, []),
      "descargables": coalesce(descargables[]{ "titulo": ${l('titulo')}, "url": archivo.asset->url, "tamano": archivo.asset->size }, []),
      "destacado": coalesce(destacado, false),
      ${ejeRef},
      "notas": *[_type == "nota" && proyecto._ref == ^._id] | order(publishedAt desc) ${notaResumen},
      "publicaciones": *[_type == "publicacionRedes" && proyecto._ref == ^._id] | order(fecha desc) ${publicacion}
    }`,
    { ejeSlug, slug, lang },
  );
}

/** Notas más recientes de cualquier tipo (Inicio). */
export function getNotasRecientes(limite = 3, lang: Lang = 'es') {
  return fetch<NotaResumen[]>(
    `*[_type == "nota" && defined(slug.current)] | order(publishedAt desc)[0...$limite] ${notaResumen}`,
    { limite, lang },
  );
}

/** Una nota completa con su contenido y archivos. */
export function getNota(slug: string, lang: Lang = 'es') {
  return fetch<Nota | null>(
    `*[_type == "nota" && slug.current == $slug][0]{
      ${notaCampos},
      "cuerpo": ${l('body')},
      "archivos": coalesce(archivos[]{ "titulo": ${l('titulo')}, "url": archivo.asset->url }, [])
    }`,
    { slug, lang },
  );
}

/** Momentos de la línea del tiempo, del más antiguo al más reciente (/en-el-tiempo). */
export function getLineaDelTiempo(lang: Lang = 'es') {
  return fetch<NotaResumen[]>(
    `*[_type == "nota" && enLineaDelTiempo == true] | order(publishedAt asc) ${notaResumen}`,
    { lang },
  );
}

/** Publicaciones de redes más recientes (Inicio). */
export function getPublicacionesRedes(limite = 8, lang: Lang = 'es') {
  return fetch<PublicacionRedes[]>(`*[_type == "publicacionRedes"] | order(fecha desc)[0...$limite] ${publicacion}`, {
    limite,
    lang,
  });
}

/** Integrantes publicadas. La foto solo viene si ella autorizó mostrarla (/nosotras). */
export function getIntegrantes(lang: Lang = 'es') {
  return fetch<Integrante[]>(
    `*[_type == "integrante" && publicada == true] | order(orden asc, nombreVisible asc){
      _id,
      nombreVisible,
      "rol": ${l('rol')},
      "descripcion": ${l('descripcion')},
      "foto": select(mostrarFoto == true => ${imagen('foto')}, null)
    }`,
    { lang },
  );
}

/** Contenido de la página Nosotras. */
export function getPaginaNosotras(lang: Lang = 'es') {
  return fetch<PaginaNosotras | null>(
    `*[_id == "paginaNosotras"][0]{
      "intro": ${l('intro')},
      "mision": ${l('mision')},
      "vision": ${l('vision')},
      "porQueAfrocaracolas": ${l('porQueAfrocaracolas')},
      "comoTrabajamos": ${l('comoTrabajamos')},
      "incidencia": ${l('incidencia')},
      "saberesItinerantes": ${l('saberesItinerantes')},
      "comoEmpezamos": ${l('comoEmpezamos')},
      "fraseCierre": ${l('fraseCierre')}
    }`,
    { lang },
  );
}

/** Contenido de la página Dona. */
export function getPaginaDona(lang: Lang = 'es') {
  return fetch<PaginaDona | null>(
    `*[_id == "paginaDona"][0]{
      "porQueDonar": ${l('porQueDonar')},
      "usos": coalesce(usos[]{ "titulo": ${l('titulo')}, "texto": ${l('texto')}, ${ejeRef} }, []),
      "otrasFormas": ${l('otrasFormas')},
      "preguntasFrecuentes": coalesce(preguntasFrecuentes[]{ "pregunta": ${l('pregunta')}, "respuesta": ${l('respuesta')} }, [])
    }`,
    { lang },
  );
}
