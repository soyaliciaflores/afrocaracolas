// Carga inicial de contenido en Sanity.
//
//   npm run carga-inicial                         → crea lo que falta, sin tocar lo que ya se editó
//   npm run carga-inicial -- --simular            → muestra lo que cargaría, sin escribir nada
//   npm run carga-inicial -- --forzar             → reemplaza los campos de esta carga con los textos de docs/
//   npm run carga-inicial -- --solo=paginaNosotras → limita la carga a un documento (se combina con --forzar)
//
// Usa SANITY_WRITE_TOKEN de .env.local. Se puede correr varias veces: los documentos tienen
// _id fijo (no se duplican) y, sin --forzar, solo se llenan los campos vacíos.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const simular = process.argv.includes('--simular');
const forzar = process.argv.includes('--forzar');
const solo = process.argv.find((a) => a.startsWith('--solo='))?.slice('--solo='.length);

if (existsSync(`${raiz}.env.local`)) process.loadEnvFile(`${raiz}.env.local`);
const { SANITY_PROJECT_ID, SANITY_DATASET, SANITY_WRITE_TOKEN } = process.env;
if (!SANITY_PROJECT_ID || !SANITY_DATASET || (!SANITY_WRITE_TOKEN && !simular)) {
  console.error('Faltan SANITY_PROJECT_ID, SANITY_DATASET o SANITY_WRITE_TOKEN en .env.local.');
  process.exit(1);
}

// ── Datos fijos (CLAUDE.md) ──────────────────────────────────────────────

// [nombre, slug, nombreCompleto opcional]
const EJES = [
  ['Justicia climática y racial', 'justicia-climatica-y-racial'],
  ['Granja Acuícola', 'granja-acuicola'],
  ['Autonomía política', 'autonomia-politica'],
  ['Autonomía económica', 'autonomia-economica'],
  ['Formación Cimarrona', 'formacion-cimarrona'],
  ['EICAfro', 'eicafro', 'Escuela Itinerante de Cine Afro'],
  ['Investigación afrocentrada', 'investigacion-afrocentrada'],
];

// Documentos que se reemplazaron por otro _id. Se borran solo si nada los referencia.
const REEMPLAZADOS = {
  'eje-elcafro': 'eje-eicafro', // El nombre correcto es EICAfro; ElCAfro fue un error del cierre del Bloque 2.
};

// Página de Inicio: palabras de Gema, tal como las dio Alicia para el Bloque 3.
const PAGINA_INICIO = {
  etiquetaPortada: 'Colectiva antirracista y afrofeminista',
  tituloPortada: 'Hoy alzamos nuestras voces cimarronas',
  tituloDestacado: 'voces cimarronas',
  subtituloPortada:
    'Somos mujeres afromexicanas que exigimos y anhelamos las reparaciones históricas para los pueblos y comunidades afrodescendientes. Trabajamos en territorio, en Afropulco y la Costa Chica de Guerrero.',
  fraseQuienesSomos:
    'Nos llamamos Afrocaracolas porque somos mujeres valientes, como nuestras abuelas, que reencarnan simbólicamente en caracolas. Nuestras historias vienen del mar.',
  fraseQuienesSomosDestacada: 'Nuestras historias vienen del mar.',
  territorio: 'Afropulco y Costa Chica',
};
const ANIO_INICIO = 2021;

const PROYECTOS = [
  ['Agenda Política de los derechos político-electorales de las mujeres afromexicanas', 'agenda-politica', 'autonomia-politica'],
  ['Cartilla de derechos de las mujeres afromexicanas', 'cartilla-de-derechos', 'autonomia-politica'],
];

const FRASE_CIERRE = 'Hoy alzamos nuestras voces cimarronas.';
const REDES = {
  instagram: 'https://www.instagram.com/afrocaracolas',
  facebook: 'https://www.facebook.com/share/198J1UVWpK/',
};

// ── Lectura de los textos de docs/contenido ──────────────────────────────

const leer = (ruta) => readFileSync(`${raiz}${ruta}`, 'utf8');

/** Separa un .md en secciones `## Título` → lista de párrafos y elementos de lista. */
function secciones(ruta) {
  const lineas = leer(ruta).split(/\r?\n/);
  const salida = {};
  let actual = null;
  let item = null;
  const cerrar = () => {
    if (item && actual) salida[actual].push(item);
    item = null;
  };
  for (const linea of lineas) {
    if (linea.startsWith('## ')) {
      cerrar();
      actual = linea.slice(3).trim();
      salida[actual] = [];
    } else if (linea.startsWith('# ') || linea.trim() === '---') {
      cerrar();
      actual = null;
    } else if (!actual) {
      continue;
    } else if (linea.trim() === '') {
      cerrar();
    } else if (linea.startsWith('- ')) {
      cerrar();
      item = { tipo: 'li', cabeza: linea.slice(2).trim(), cuerpo: '' };
    } else if (item?.tipo === 'li' && linea.startsWith('  ')) {
      item.cuerpo = [item.cuerpo, linea.trim()].filter(Boolean).join(' ');
    } else if (item?.tipo === 'p') {
      item.texto += ` ${linea.trim()}`;
    } else {
      cerrar();
      item = { tipo: 'p', texto: linea.trim() };
    }
  }
  cerrar();
  return salida;
}

/** Párrafos de un texto plano copiado de PDF: los separa una línea vacía; los saltos internos se unen. */
function parrafos(ruta) {
  return leer(ruta)
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).join(' '))
    .filter(Boolean);
}

/** Reemplaza `de` por `a` exactamente una vez en la lista de párrafos (cortes de PDF). */
function corregir(lista, de, a) {
  const veces = lista.reduce((n, p) => n + p.split(de).length - 1, 0);
  if (veces !== 1) throw new Error(`Esperaba encontrar «${de}» una vez y lo encontré ${veces}.`);
  return lista.map((p) => p.replace(de, a));
}

/** Título de un elemento de lista: sin el emoji del inicio, sin ** y sin los dos puntos finales. */
const tituloDeLista = (cabeza) =>
  cabeza
    .replace(/^[^*\p{L}]+/u, '')
    .replaceAll('**', '')
    .replace(/:$/, '')
    .trim();

function exigir(seccion, nombre, ruta) {
  if (!seccion) throw new Error(`No encontré la sección «${nombre}» en ${ruta}.`);
  return seccion;
}

// ── Portable Text con claves estables (para que volver a correr no cambie nada) ──

const clave = (...partes) => createHash('sha1').update(partes.join('|')).digest('hex').slice(0, 12);

function spans(texto, base) {
  return texto
    .split(/(\*\*[^*]+\*\*)/)
    .filter(Boolean)
    .map((parte, i) => {
      const negritas = parte.startsWith('**') && parte.endsWith('**');
      return { _type: 'span', _key: `${base}s${i}`, text: negritas ? parte.slice(2, -2) : parte, marks: negritas ? ['strong'] : [] };
    });
}

function bloques(campo, items) {
  return items.map(([estilo, texto], i) => {
    const k = clave(campo, i, texto);
    return { _type: 'block', _key: k, style: estilo, markDefs: [], children: spans(texto, k) };
  });
}

const local = (es) => ({ es });
const bloqueLocal = (campo, items) => ({ es: bloques(campo, items) });

// ── Página Nosotras ───────────────────────────────────────────────────────
// Fuente principal: el texto de Gema. De quienes-somos.md solo se toman misión, visión
// y «Lo que hacemos», que el texto de Gema no cubre.

const RUTA_GEMA = 'docs/contenido/quienes-somos-gema.md';
const RUTA_QS = 'docs/contenido/quienes-somos.md';

let gema = parrafos(RUTA_GEMA);
gema = corregir(gema, 'conmemora- ción', 'conmemoración');
gema = corregir(gema, 'libertad01', 'libertad');

// Cada párrafo de Gema se toma por cómo empieza; al final se revisa que no sobre ninguno.
const usados = new Set();
function g(inicio) {
  const i = gema.findIndex((p) => p.startsWith(inicio));
  if (i === -1) throw new Error(`No encontré en ${RUTA_GEMA} el párrafo que empieza «${inicio}».`);
  if (usados.has(i)) throw new Error(`El párrafo «${inicio}» se usa dos veces.`);
  usados.add(i);
  return gema[i];
}

g('¿Quienes somos las afrocaracolas?'); // Título del texto: lo pone el diseño, no va en un bloque.

const qs = secciones(RUTA_QS);
const qsMision = exigir(qs['Misión'], 'Misión', RUTA_QS);
const qsVision = exigir(qs['Visión'], 'Visión', RUTA_QS);
const qsHacemos = exigir(qs['Lo que hacemos'], 'Lo que hacemos', RUTA_QS);

const paginaNosotras = {
  intro: bloqueLocal('intro', [
    ['normal', g('Somos una colectiva antirracista')],
    ['normal', g('Las lecturas, análisis y posicionamientos')],
  ]),
  mision: bloqueLocal('mision', qsMision.map((p) => ['normal', p.texto])),
  vision: bloqueLocal('vision', qsVision.map((p) => ['normal', p.texto])),
  porQueAfrocaracolas: bloqueLocal('porQueAfrocaracolas', [['normal', g('Nos llamamos Afrocaracolas')]]),
  comoTrabajamos: bloqueLocal('comoTrabajamos', [
    ['normal', g('Trabajamos directamente en las comunidades')],
    ...qsHacemos.flatMap((li) => [
      ['h3', tituloDeLista(li.cabeza)],
      ['normal', li.cuerpo],
    ]),
  ]),
  incidencia: bloqueLocal('incidencia', [['normal', g('A nivel nacional')]]),
  comoEmpezamos: bloqueLocal('comoEmpezamos', [
    ['normal', g('Empezamos a reunirnos')],
    ['normal', g('Nunca olvidaremos')],
    ['normal', g('Nuestro camino no ha sido fácil')],
    ['normal', g('Esta libertad que hoy nos permite soñar')],
  ]),
  fraseCierre: local(g(FRASE_CIERRE)),
};

const sobrantes = gema.filter((_, i) => !usados.has(i));
if (sobrantes.length > 0) {
  throw new Error(`Hay párrafos de ${RUTA_GEMA} sin asignar:\n${sobrantes.map((p) => `  · ${p.slice(0, 80)}…`).join('\n')}`);
}

// ── Momentos de 2021 (línea del tiempo) ───────────────────────────────────
// El resumen es el texto de Gema tal cual: la primera oración del párrafo «Empezamos a
// reunirnos…» y el párrafo completo «Nunca olvidaremos…».

const parrafoGema = (inicio) => {
  const p = gema.find((t) => t.startsWith(inicio));
  if (!p) throw new Error(`No encontré en ${RUTA_GEMA} el párrafo que empieza «${inicio}».`);
  return p;
};
const primeraOracion = (texto) => texto.slice(0, texto.indexOf('. ') + 1);

const MOMENTOS = [
  {
    _id: 'momento-2021-primeras-lineas',
    titulo: 'Escribimos las primeras líneas',
    slug: 'escribimos-las-primeras-lineas',
    fecha: '2021-03-08T18:00:00.000Z', // mediodía en México
    resumen: primeraOracion(parrafoGema('Empezamos a reunirnos')),
  },
  {
    _id: 'momento-2021-primera-asamblea',
    titulo: 'Primera Asamblea-Tallercita',
    slug: 'primera-asamblea-tallercita',
    fecha: '2021-06-15T17:00:00.000Z', // mediodía en México
    resumen: parrafoGema('Nunca olvidaremos'),
  },
];

// ── Documentos ────────────────────────────────────────────────────────────

let documentos = [
  ...EJES.map(([nombre, slug, nombreCompleto], i) => ({
    _id: `eje-${slug}`,
    _type: 'eje',
    campos: {
      nombre: local(nombre),
      ...(nombreCompleto && { nombreCompleto: local(nombreCompleto) }),
      slug: { _type: 'slug', current: slug },
      orden: i + 1,
    },
  })),
  ...PROYECTOS.map(([nombre, slug, eje]) => ({
    _id: `proyecto-${slug}`,
    _type: 'proyecto',
    campos: {
      nombre: local(nombre),
      slug: { _type: 'slug', current: slug },
      eje: { _type: 'reference', _ref: `eje-${eje}` },
      estado: 'activo',
    },
  })),
  { _id: 'ajustesSitio', _type: 'ajustesSitio', campos: { redes: REDES } },
  { _id: 'paginaNosotras', _type: 'paginaNosotras', campos: paginaNosotras },
  {
    _id: 'paginaInicio',
    _type: 'paginaInicio',
    campos: {
      ...Object.fromEntries(
        Object.entries(PAGINA_INICIO).map(([campo, texto]) => [campo, local(texto)]),
      ),
      anioInicio: ANIO_INICIO,
    },
  },
  ...MOMENTOS.map(({ _id, titulo, slug, fecha, resumen }) => ({
    _id,
    _type: 'nota',
    campos: {
      title: local(titulo),
      slug: { _type: 'slug', current: slug },
      tipo: 'momento',
      enLineaDelTiempo: true,
      publishedAt: fecha,
      excerpt: local(resumen),
    },
  })),
];

if (solo) {
  documentos = documentos.filter((d) => d._id === solo);
  if (documentos.length === 0) {
    console.error(`--solo=${solo}: no hay un documento con ese _id en esta carga.`);
    process.exit(1);
  }
}

if (simular) {
  console.log(JSON.stringify(documentos, null, 2));
  process.exit(0);
}

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_WRITE_TOKEN,
  apiVersion: '2024-06-01',
  useCdn: false,
});

const tx = client.transaction();
for (const { _id, _type, campos } of documentos) {
  tx.createIfNotExists({ _id, _type });
  tx.patch(_id, (p) => (forzar ? p.set(campos) : p.setIfMissing(campos)));
}
await tx.commit({ visibility: 'sync' });

console.log(`Listo: ${documentos.length} documentos ${forzar ? 'reemplazados' : 'creados o completados'} en ${SANITY_DATASET}.`);
for (const { _id } of documentos) console.log(`  · ${_id}`);

if (!solo) {
  for (const [viejo, nuevo] of Object.entries(REEMPLAZADOS)) {
    for (const id of [viejo, `drafts.${viejo}`]) {
      if (!(await client.getDocument(id))) continue;
      const referencias = await client.fetch('count(*[references($id)])', { id });
      if (referencias > 0) {
        console.warn(`No borré ${id}: lo usan ${referencias} documentos. Cámbialos a ${nuevo} en el Studio.`);
      } else {
        await client.delete(id);
        console.log(`Borré ${id} (lo reemplaza ${nuevo}).`);
      }
    }
  }
}
