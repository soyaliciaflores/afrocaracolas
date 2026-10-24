import { defineField, defineType } from 'sanity';

export const publicacionRedes = defineType({
  name: 'publicacionRedes',
  title: 'Publicación de redes',
  type: 'document',
  description: 'Posts de Instagram, Facebook o TikTok que se muestran en el sitio. Se cargan a mano.',
  fields: [
    defineField({
      name: 'red',
      title: 'Red social',
      type: 'string',
      options: {
        list: [
          { title: 'Instagram', value: 'instagram' },
          { title: 'Facebook', value: 'facebook' },
          { title: 'TikTok', value: 'tiktok' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'instagram',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'url',
      title: 'Enlace a la publicación',
      type: 'url',
      description: 'Copia el enlace desde la app: «Compartir» → «Copiar enlace».',
      validation: (r) => r.required().uri({ scheme: ['https'] }).error('Pega el enlace completo (https://…).'),
    }),
    defineField({
      name: 'titulo',
      title: 'Título',
      type: 'textoLocal',
      description: 'Un título corto para el sitio, por ejemplo el nombre de la actividad.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'texto',
      title: 'Texto',
      type: 'textoLargoLocal',
      description: 'El texto tal como se publicó en la red.',
    }),
    defineField({
      name: 'fecha',
      title: 'Fecha',
      type: 'date',
      options: { dateFormat: 'DD/MM/YYYY' },
      validation: (r) => r.required().error('Escribe la fecha de la publicación.'),
    }),
    defineField({
      name: 'lugar',
      title: 'Lugar',
      type: 'textoLocal',
      description: 'Opcional. Región o municipio. No pongas la comunidad de una integrante sin su consentimiento.',
    }),
    defineField({
      name: 'eje',
      title: 'Eje',
      type: 'reference',
      to: [{ type: 'eje' }],
      description: 'Opcional. De él toma su color.',
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
      name: 'portada',
      title: 'Portada',
      type: 'imagen',
      description: 'La imagen que se ve en la tarjeta.',
    }),
    defineField({
      name: 'video',
      title: 'Video',
      type: 'file',
      description: 'Opcional. Sube el video solo si debe verse en el sitio. Mejor si pesa menos de 50 MB.',
      options: { accept: 'video/*' },
    }),
  ],
  orderings: [{ title: 'Fecha, más reciente', name: 'fechaDesc', by: [{ field: 'fecha', direction: 'desc' }] }],
  preview: {
    select: { titulo: 'titulo.es', red: 'red', fecha: 'fecha', media: 'portada' },
    prepare: ({ titulo, red, fecha, media }) => {
      const redes: Record<string, string> = { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok' };
      const dia = fecha ? new Date(`${fecha}T12:00:00`).toLocaleDateString('es-MX') : 'Sin fecha';
      return { title: titulo ?? 'Sin título', subtitle: `${redes[red] ?? ''} · ${dia}`, media };
    },
  },
});
