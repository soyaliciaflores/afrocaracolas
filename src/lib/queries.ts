import { getSanityClient } from './sanity';

export type Nota = {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  excerpt: string;
  heroImage?: { asset: { url: string; altText?: string } };
  body: any[];
};

export type CarouselNota = {
  _id: string;
  title: string;
  slug: { current: string };
  heroImage: { asset: { url: string; altText?: string } };
};

async function safeFetch<T>(
  query: string,
  params?: Record<string, unknown>,
  empty: T = [] as unknown as T,
): Promise<T> {
  const client = getSanityClient();
  if (!client) return empty;
  return client.fetch<T>(query, params ?? {});
}

const notaFields = `
  _id, title, slug, publishedAt, excerpt,
  heroImage { asset -> { url, altText } }
`;

export async function getNotas(): Promise<Nota[]> {
  return safeFetch<Nota[]>(`*[_type == "nota"] | order(publishedAt desc) { ${notaFields} }`);
}

export async function getUltimasNotas(limit = 3): Promise<Nota[]> {
  return safeFetch<Nota[]>(
    `*[_type == "nota"] | order(publishedAt desc)[0...${limit}] { ${notaFields} }`,
  );
}

export async function getNota(slug: string): Promise<Nota | null> {
  return safeFetch<Nota | null>(
    `*[_type == "nota" && slug.current == $slug][0] { ${notaFields}, body }`,
    { slug },
    null,
  );
}

export async function getNotaSlugs(): Promise<string[]> {
  const notas = await safeFetch<{ slug: { current: string } }[]>(`*[_type == "nota"] { slug }`);
  return notas.map((n) => n.slug.current);
}

export async function getCarouselNotas(): Promise<CarouselNota[]> {
  return safeFetch<CarouselNota[]>(
    `*[_type == "nota" && defined(heroImage.asset)] | order(publishedAt desc)[0...4] {
      _id, title, slug,
      heroImage { asset -> { url, altText } }
    }`,
  );
}
