import { defineField, defineType } from 'sanity';

const CONSENTIMIENTO = 'Publica solo con el consentimiento de la integrante sobre su nombre, foto y comunidad.';

export const integrante = defineType({
  name: 'integrante',
  title: 'Integrante',
  type: 'document',
  description: CONSENTIMIENTO,
  fields: [
    defineField({
      name: 'publicada',
      title: 'Publicada en el sitio',
      type: 'boolean',
      description: `Apagado por defecto. ${CONSENTIMIENTO}`,
      initialValue: false,
    }),
    defineField({
      name: 'nombreVisible',
      title: 'Nombre visible',
      type: 'string',
      description: 'Cómo quiere aparecer. Puede ser solo su nombre, sin apellidos.',
      validation: (r) => r.required().error('Escribe cómo quiere aparecer.'),
    }),
    defineField({
      name: 'rol',
      title: 'Rol',
      type: 'textoLocal',
      description: 'Su papel en la colectiva.',
    }),
    defineField({
      name: 'descripcion',
      title: 'Descripción',
      type: 'textoLargoLocal',
      description: 'Unas líneas sobre ella, con sus palabras. No incluyas su comunidad sin su permiso.',
    }),
    defineField({
      name: 'foto',
      title: 'Foto',
      type: 'imagen',
      description: 'Opcional. Solo se muestra si activas «Mostrar foto».',
    }),
    defineField({
      name: 'mostrarFoto',
      title: 'Mostrar foto',
      type: 'boolean',
      description: 'Apagado por defecto. Actívalo solo si ella autorizó que se publique su foto.',
      initialValue: false,
      validation: (r) =>
        r.custom((mostrar: boolean | undefined, { document }) =>
          mostrar && !document?.foto ? 'Activaste «Mostrar foto» pero no hay foto.' : true,
        ).warning(),
    }),
    defineField({
      name: 'orden',
      title: 'Orden',
      type: 'number',
      description: 'Posición en la lista de integrantes (1 va primero).',
      validation: (r) => r.integer().min(1),
    }),
  ],
  orderings: [{ title: 'Orden', name: 'ordenAsc', by: [{ field: 'orden', direction: 'asc' }] }],
  preview: {
    select: { nombre: 'nombreVisible', rol: 'rol.es', publicada: 'publicada', mostrarFoto: 'mostrarFoto', media: 'foto' },
    prepare: ({ nombre, rol, publicada, mostrarFoto, media }) => ({
      title: nombre,
      subtitle: [publicada ? 'Publicada' : 'No publicada', rol].filter(Boolean).join(' · '),
      media: mostrarFoto ? media : undefined,
    }),
  },
});
