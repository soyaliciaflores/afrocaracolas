import { defineArrayMember, defineField, defineType } from 'sanity';

// Los campos originales (title, slug, publishedAt, excerpt, heroImage, body) conservan su nombre.
// title, excerpt y body pasaron a dos idiomas con scripts/migracion-cierre-bloque-2.mjs.
export const nota = defineType({
  name: 'nota',
  title: 'Nota o momento',
  type: 'document',
  description: 'Noticias y momentos de la línea del tiempo «Afrocaracolas en el tiempo».',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'textoLocal',
      validation: (r) => r.required().error('Escribe el título.'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      description: 'Parte final de la dirección. Genérala con el botón «Generate».',
      options: { source: 'title.es', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'tipo',
      title: 'Tipo',
      type: 'string',
      description: 'Noticia: algo reciente. Momento: un hito de la colectiva. Archivo histórico: documentos o fotos de otros años.',
      options: {
        list: [
          { title: 'Noticia', value: 'noticia' },
          { title: 'Momento', value: 'momento' },
          { title: 'Archivo histórico', value: 'archivoHistorico' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'noticia',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'enLineaDelTiempo',
      title: 'Mostrar en la línea del tiempo',
      type: 'boolean',
      description: 'Actívalo para que aparezca en «Afrocaracolas en el tiempo».',
      initialValue: false,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Fecha',
      type: 'datetime',
      description: 'Para noticias, la fecha de publicación. Para momentos y archivo histórico, la fecha en que ocurrió.',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'eje',
      title: 'Eje',
      type: 'reference',
      to: [{ type: 'eje' }],
      description: 'Opcional. El eje de trabajo relacionado; de él toma su color.',
    }),
    defineField({
      name: 'proyecto',
      title: 'Proyecto',
      type: 'reference',
      to: [{ type: 'proyecto' }],
      description: 'Opcional. Si elegiste un eje, solo aparecen sus proyectos.',
      options: {
        filter: ({ document }) => {
          const ejeId = (document?.eje as { _ref?: string } | undefined)?._ref;
          return ejeId ? { filter: 'eje._ref == $ejeId', params: { ejeId } } : {};
        },
      },
    }),
    defineField({
      name: 'excerpt',
      title: 'Resumen',
      type: 'textoLargoLocal',
      description: 'Breve descripción que aparece en listados y redes sociales.',
    }),
    defineField({
      name: 'heroImage',
      title: 'Imagen principal',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'altText',
          title: 'Texto alternativo',
          type: 'string',
          description: 'Describe lo que se ve en la foto, para personas que usan lector de pantalla.',
          validation: (r) => r.required().error('Agrega el texto alternativo de la imagen.'),
        }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Contenido',
      type: 'contenidoLocal',
      description: 'El texto de la nota. Puedes poner fotos entre los párrafos.',
    }),
    defineField({
      name: 'archivos',
      title: 'Archivos',
      type: 'array',
      description: 'Opcional. Documentos para descargar (PDF, fotos, audio).',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'archivoAdjunto',
          title: 'Archivo',
          fields: [
            defineField({ name: 'titulo', title: 'Título', type: 'textoLocal', validation: (r) => r.required() }),
            defineField({
              name: 'archivo',
              title: 'Archivo',
              type: 'file',
              validation: (r) => r.required().error('Sube el archivo.'),
            }),
          ],
          preview: { select: { title: 'titulo.es' } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title.es', fecha: 'publishedAt', tipo: 'tipo', media: 'heroImage' },
    prepare({ title, fecha, tipo, media }) {
      const tipos: Record<string, string> = { noticia: 'Noticia', momento: 'Momento', archivoHistorico: 'Archivo histórico' };
      return {
        title,
        subtitle: [tipos[tipo] ?? 'Noticia', fecha ? new Date(fecha).toLocaleDateString('es-MX') : 'Sin fecha'].join(' · '),
        media,
      };
    },
  },
  orderings: [
    {
      title: 'Fecha, más reciente',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
});
