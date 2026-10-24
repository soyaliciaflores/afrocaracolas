// Carga inicial de contenido en Sanity.
//
//   npm run carga-inicial              → crea lo que falta, sin tocar lo que ya se editó
//   npm run carga-inicial -- --simular → muestra lo que cargaría, sin escribir nada
//   npm run carga-inicial -- --forzar  → reemplaza los campos de esta carga con los textos de docs/
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

if (existsSync(`${raiz}.env.local`)) process.loadEnvFile(`${raiz}.env.local`);
const { SANITY_PROJECT_ID, SANITY_DATASET, SANITY_WRITE_TOKEN } = process.env;
if (!SANITY_PROJECT_ID || !SANITY_DATASET || (!SANITY_WRITE_TOKEN && !simular)) {
  console.error('Faltan SANITY_PROJECT_ID, SANITY_DATASET o SANITY_WRITE_TOKEN en .env.local.');
  process.exit(1);
}

// ── Datos fijos (CLAUDE.md) ──────────────────────────────────────────────

const EJES = [
  ['Justicia climática y racial', 'justicia-climatica-y-racial'],
  ['Granja Acuícola', 'granja-acuicola'],
  ['Autonomía política', 'autonomia-politica'],
  ['Autonomía económica', 'autonomia-economica'],
  ['Formación Cimarrona', 'formacion-cimarrona'],
  ['EICAfro', 'eicafro'],
  ['Investigación afrocentrada', 'investigacion-afrocentrada'],
];

const PROYECTOS = [
  ['Agenda Política de los derechos político-electorales de las mujeres afromexicanas', 'agenda-politica', 'autonomia-politica'],
  ['Cartilla de derechos de las mujeres afromexicanas', 'cartilla-de-derechos', 'autonomia-politica'],
];

const LEYENDA_DONATARIA =
  'Afrocaracolas está en proceso de ser donataria autorizada. Por ahora los donativos no son deducibles de impuestos.';
const FRASE_CIERRE = 'Hoy alzamos nuestras voces cimarronas.';
const REDES = {
  instagram: 'https://www.instagram.com/afrocaracolas',
  facebook: 'https://www.facebook.com/share/198J1UVWpK/',
};

// ── Lectura de los textos de docs/contenido ──────────────────────────────

/** Separa un .md en secciones `## Título` → lista de párrafos y elementos de lista. */
function secciones(ruta) {
  const lineas = readFileSync(`${raiz}${ruta}`, 'utf8').split(/\r?\n/);
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

const RUTA_QS = 'docs/contenido/quienes-somos.md';
const RUTA_GEMA = 'docs/contenido/quienes-somos-gema.md';
const qs = secciones(RUTA_QS);
const qsQuienes = exigir(qs['Quiénes somos'], 'Quiénes somos', RUTA_QS);
const qsHistoria = exigir(qs['Historia'], 'Historia', RUTA_QS);
const qsMision = exigir(qs['Misión'], 'Misión', RUTA_QS);
const qsVision = exigir(qs['Visión'], 'Visión', RUTA_QS);
const qsHacemos = exigir(qs['Lo que hacemos'], 'Lo que hacemos', RUTA_QS);

const avisos = [];
if (!existsSync(`${raiz}${RUTA_GEMA}`)) {
  avisos.push(`No existe ${RUTA_GEMA}: la Página Nosotras se carga solo con ${RUTA_QS}.`);
}

const paginaNosotras = {
  // Los párrafos sin un bloque claro van en intro (ver reporte del Bloque 2).
  intro: bloqueLocal('intro', [
    ...qsQuienes.map((p) => ['normal', p.texto]),
    ['normal', qsHistoria[1].texto],
    ['h3', 'Misión'],
    ...qsMision.map((p) => ['normal', p.texto]),
    ['h3', 'Visión'],
    ...qsVision.map((p) => ['normal', p.texto]),
  ]),
  porQueAfrocaracolas: bloqueLocal('porQueAfrocaracolas', [['normal', qsHistoria[2].texto]]),
  comoEmpezamos: bloqueLocal('comoEmpezamos', [['normal', qsHistoria[0].texto]]),
  comoTrabajamos: bloqueLocal(
    'comoTrabajamos',
    qsHacemos.flatMap((li) => [
      ['h3', tituloDeLista(li.cabeza)],
      ['normal', li.cuerpo],
    ]),
  ),
  fraseCierre: local(FRASE_CIERRE),
};

// ── Página Dona ───────────────────────────────────────────────────────────

const RUTA_DONAR = 'docs/contenido/donar.md';
const donar = secciones(RUTA_DONAR);
const donarApoya = exigir(donar['Apoya nuestro trabajo'], 'Apoya nuestro trabajo', RUTA_DONAR);
const donarUsos = exigir(donar['¿Cómo usamos tu donación?'], '¿Cómo usamos tu donación?', RUTA_DONAR);

const paginaDona = {
  porQueDonar: bloqueLocal('porQueDonar', donarApoya.map((p) => ['normal', p.texto])),
  usos: donarUsos.map((li) => {
    const titulo = tituloDeLista(li.cabeza);
    return { _type: 'uso', _key: clave('uso', titulo), titulo: local(titulo), texto: local(li.cuerpo) };
  }),
};

// ── Documentos ────────────────────────────────────────────────────────────

const documentos = [
  ...EJES.map(([nombre, slug], i) => ({
    _id: `eje-${slug}`,
    _type: 'eje',
    campos: { nombre: local(nombre), slug: { _type: 'slug', current: slug }, orden: i + 1 },
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
  { _id: 'ajustesSitio', _type: 'ajustesSitio', campos: { leyendaDonataria: local(LEYENDA_DONATARIA), redes: REDES } },
  { _id: 'paginaNosotras', _type: 'paginaNosotras', campos: paginaNosotras },
  { _id: 'paginaDona', _type: 'paginaDona', campos: paginaDona },
];

for (const aviso of avisos) console.warn(`Aviso: ${aviso}`);

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
