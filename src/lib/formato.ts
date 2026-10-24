// Utilidades de presentación: fechas en es-MX y textos con una parte destacada.

const ZONA = 'America/Mexico_City';

/** «8 de marzo» */
export function diaYMes(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', timeZone: ZONA });
}

/** «8 de marzo de 2021» */
export function fechaLarga(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: ZONA });
}

/** «2021» */
export function anio(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', timeZone: ZONA });
}

/**
 * Fecha de Sanity tipo `date` (AAAA-MM-DD, sin hora). Se lee como mediodía en México
 * para que no cambie de día por la zona horaria.
 */
export function fechaDeDia(fecha: string): string {
  return fechaLarga(`${fecha}T12:00:00-06:00`);
}

/** Separa `texto` en [antes, destacado, después]. Si `destacado` no está en el texto, no destaca nada. */
export function partirDestacado(texto: string, destacado?: string): [string, string, string] {
  const i = destacado ? texto.indexOf(destacado) : -1;
  if (!destacado || i === -1) return [texto, '', ''];
  return [texto.slice(0, i), destacado, texto.slice(i + destacado.length)];
}
