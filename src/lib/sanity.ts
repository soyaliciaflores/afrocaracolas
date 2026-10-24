import { createClient, type SanityClient } from '@sanity/client';
import { createImageUrlBuilder, type ImageUrlBuilder, type SanityImageSource } from '@sanity/image-url';

let _client: SanityClient | null = null;
let _builder: ImageUrlBuilder | null = null;

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

/**
 * URL de una imagen del CDN de Sanity con formato automático.
 * Con `alto`, recorta respetando el punto focal (hotspot) que se marcó en el Studio.
 */
export function urlImagen(fuente: SanityImageSource, ancho: number, alto?: number): string {
  _builder ??= createImageUrlBuilder(getSanityClient());
  let b = _builder.image(fuente).width(Math.round(ancho)).auto('format').quality(80);
  b = alto ? b.height(Math.round(alto)).fit('crop') : b.fit('max');
  return b.url();
}
