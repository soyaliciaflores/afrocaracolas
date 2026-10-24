import { createClient, type SanityClient } from '@sanity/client';

let _client: SanityClient | null = null;

/** Cliente de solo lectura por el CDN: solo ve contenido publicado y no necesita token. */
export function getSanityClient(): SanityClient {
  if (!_client) {
    const projectId = import.meta.env.SANITY_PROJECT_ID;
    const dataset = import.meta.env.SANITY_DATASET;
    if (!projectId || !dataset) {
      throw new Error('Faltan SANITY_PROJECT_ID o SANITY_DATASET. Ver README.md.');
    }
    _client = createClient({
      projectId,
      dataset,
      apiVersion: '2024-06-01',
      useCdn: true,
      perspective: 'published',
    });
  }
  return _client;
}

/** URL de una imagen del CDN de Sanity con ancho y formato automáticos. */
export function urlImagen(url: string, ancho: number): string {
  return `${url}?w=${ancho}&auto=format&fit=max`;
}
