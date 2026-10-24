// Migración de cierre del Bloque 2 (una sola vez; se puede volver a correr sin efecto).
//
//   node scripts/migracion-cierre-bloque-2.mjs --simular   → muestra los cambios sin escribir
//   node scripts/migracion-cierre-bloque-2.mjs             → los escribe
//
// 1. Notas: pasa title, excerpt y body a dos idiomas ({ es }) sin cambiar su contenido,
//    y les asigna eje, proyecto, tipo y línea del tiempo. No toca sus imágenes.
// 2. ajustesSitio: vacía la leyenda de donataria.
// 3. paginaDona: vacía porQueDonar y usos (la colectiva escribirá textos nuevos).

import { existsSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const simular = process.argv.includes('--simular');

if (existsSync(`${raiz}.env.local`)) process.loadEnvFile(`${raiz}.env.local`);
const { SANITY_PROJECT_ID, SANITY_DATASET, SANITY_WRITE_TOKEN } = process.env;
if (!SANITY_PROJECT_ID || !SANITY_DATASET || !SANITY_WRITE_TOKEN) {
  console.error('Faltan SANITY_PROJECT_ID, SANITY_DATASET o SANITY_WRITE_TOKEN en .env.local.');
  process.exit(1);
}

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_WRITE_TOKEN,
  apiVersion: '2024-06-01',
  useCdn: false,
  perspective: 'raw', // incluye borradores
});

// Decisiones de Alicia para las notas existentes (por _id, sin el prefijo drafts.).
const ASIGNACIONES = {
  '427adbe7-ba93-4840-8bd2-0113500fab8d': {
    nombre: 'Cimarronas al Poder…',
    eje: 'eje-autonomia-politica',
    proyecto: 'proyecto-agenda-politica',
  },
  '78f5dcc9-aa62-4aaf-b6df-443a798b944e': {
    nombre: 'Exigencias y Voces de las Juventudes Afromexicanas…',
    eje: 'eje-justicia-climatica-y-racial',
    proyecto: null,
  },
};

const ref = (id) => ({ _type: 'reference', _ref: id });
const esLocal = (v) => v && typeof v === 'object' && !Array.isArray(v) && 'es' in v;

const tx = client.transaction();
const cambios = [];

// 1. Notas
const notas = await client.fetch('*[_type == "nota"]');
for (const nota of notas) {
  const base = nota._id.replace(/^drafts\./, '');
  const asignacion = ASIGNACIONES[base];
  const set = {};
  const unset = [];

  if (typeof nota.title === 'string') set.title = { es: nota.title };
  if (typeof nota.excerpt === 'string') set.excerpt = { es: nota.excerpt };
  if (Array.isArray(nota.body)) set.body = { es: nota.body };

  if (asignacion) {
    if (nota.eje?._ref !== asignacion.eje) set.eje = ref(asignacion.eje);
    if (asignacion.proyecto && nota.proyecto?._ref !== asignacion.proyecto) set.proyecto = ref(asignacion.proyecto);
    if (!asignacion.proyecto && nota.proyecto) unset.push('proyecto');
    if (nota.tipo !== 'momento') set.tipo = 'momento';
    if (nota.enLineaDelTiempo !== true) set.enLineaDelTiempo = true;
  } else {
    console.warn(`Aviso: la nota ${nota._id} no tiene asignación de eje; solo se pasa a dos idiomas.`);
  }

  // Comprobación: el contenido en español queda idéntico al original.
  const despues = { ...nota, ...set };
  for (const campo of ['title', 'excerpt', 'body']) {
    const antes = esLocal(nota[campo]) ? nota[campo].es : nota[campo];
    const ahora = esLocal(despues[campo]) ? despues[campo].es : despues[campo];
    if (!isDeepStrictEqual(antes, ahora)) throw new Error(`La migración cambiaría el contenido de ${campo} en ${nota._id}.`);
  }
  if (!isDeepStrictEqual(nota.heroImage, despues.heroImage)) throw new Error(`La migración tocaría la imagen de ${nota._id}.`);

  if (Object.keys(set).length || unset.length) {
    tx.patch(nota._id, (p) => p.set(set).unset(unset));
    cambios.push({
      _id: nota._id,
      titulo: nota.title?.es ?? nota.title,
      campos: Object.fromEntries(
        Object.entries(set).map(([k, v]) => [
          k,
          k === 'body' ? `{ es: [${v.es.length} bloques sin cambios] }` : k === 'excerpt' ? '{ es: <resumen sin cambios> }' : v,
        ]),
      ),
      quita: unset,
    });
  }
}

// 2 y 3. Ajustes y Página Dona
const vaciar = [
  ['ajustesSitio', ['leyendaDonataria']],
  ['paginaDona', ['porQueDonar', 'usos']],
];
for (const [id, campos] of vaciar) {
  const doc = await client.getDocument(id);
  const presentes = campos.filter((c) => doc?.[c] !== undefined);
  if (presentes.length) {
    tx.patch(id, (p) => p.unset(presentes));
    cambios.push({ _id: id, quita: presentes, contenidoQueSeQuita: Object.fromEntries(presentes.map((c) => [c, doc[c]])) });
  }
}

if (cambios.length === 0) {
  console.log('No hay nada que migrar: todo está al día.');
  process.exit(0);
}

console.log(JSON.stringify(cambios, null, 2));
if (simular) {
  console.log('\n(--simular: no se escribió nada)');
  process.exit(0);
}

await tx.commit({ visibility: 'sync' });
console.log(`\nListo: ${cambios.length} documentos actualizados en ${SANITY_DATASET}.`);
