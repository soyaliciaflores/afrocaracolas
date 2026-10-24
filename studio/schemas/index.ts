import { eje } from './documentos/eje';
import { integrante } from './documentos/integrante';
import { nota } from './documentos/nota';
import { proyecto } from './documentos/proyecto';
import { publicacionRedes } from './documentos/publicacionRedes';
import { imagen } from './objetos/imagen';
import { bloqueLocal, contenidoLocal, textoLargoLocal, textoLocal } from './objetos/localizados';
import { ajustesSitio, paginaDona, paginaNosotras } from './singletons';

export const schemaTypes = [
  // Objetos reutilizables
  textoLocal,
  textoLargoLocal,
  bloqueLocal,
  contenidoLocal,
  imagen,
  // Documentos únicos
  ajustesSitio,
  paginaNosotras,
  paginaDona,
  // Documentos
  eje,
  proyecto,
  nota,
  publicacionRedes,
  integrante,
];

export const SINGLETONS = new Set(['ajustesSitio', 'paginaNosotras', 'paginaDona']);
