import { defineField, defineType } from 'sanity';
import { campoGaleria } from '../objetos/imagen';
import { maxCaracteres } from '../objetos/localizados';

// Los colores de cada eje viven en el código del sitio (src/data/ejes.ts) y se asocian por slug.
// Esta lista debe coincidir con ese archivo.
export const SLUGS_EJES = [
  'justicia-climatica-y-racial',
  'granja-acuicola',
  'autonomia-politica',
  'autonomia-economica',
  'formacion-cimarrona',
  'eicafro',
  'investigacion-afrocentrada',
];

export const eje = defineType({
  name: 'eje',
  title: 'Eje de trabajo',
  type: 'document',
  description: 'Los 7 ejes de trabajo. El color de cada eje está fijo en el sitio y no se edita aquí.',
  fields: [
    defineField({
      name: 'nombre',
      title: 'Nombre',
      type: 'textoLocal',
      description: 'Nombre del eje tal como aparece en el sitio.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      description: 'Parte final de la dirección: afrocaracolas.org/ejes/… No lo cambies: de él depende el color del eje.',
      options: { source: 'nombre.es', maxLength: 96 },
      validation: (r) =>
        r.required().custom((valor?: { current?: string }) =>
          !valor?.current || SLUGS_EJES.includes(valor.current)
            ? true
            : `Este slug no tiene color asignado. Usa uno de: ${SLUGS_EJES.join(', ')}.`,
        ),
    }),
    defineField({
      name: 'orden',
      title: 'Orden',
      type: 'number',
      description: 'Posición del eje en las listas, del 1 al 7.',
      validation: (r) => r.required().integer().min(1).max(7).error('Escribe un número entero del 1 al 7.'),
    }),
    defineField({
      name: 'descripcionCorta',
      title: 'Descripción corta',
      type: 'textoLargoLocal',
      description: 'Una o dos frases para tarjetas y listas. Máximo 200 caracteres.',
      validation: maxCaracteres(200),
    }),
    defineField({
      name: 'descripcion',
      title: 'Descripción',
      type: 'bloqueLocal',
      description: 'Qué problema atiende el eje y cómo lo trabajan en territorio.',
    }),
    defineField({
      name: 'fotoPrincipal',
      title: 'Foto principal',
      type: 'imagen',
      description: 'La foto grande de la página del eje.',
    }),
    campoGaleria(),
  ],
  orderings: [{ title: 'Orden', name: 'ordenAsc', by: [{ field: 'orden', direction: 'asc' }] }],
  preview: {
    select: { nombre: 'nombre.es', orden: 'orden', media: 'fotoPrincipal' },
    prepare: ({ nombre, orden, media }) => ({
      title: nombre ?? 'Eje sin nombre',
      subtitle: orden ? `Eje ${orden} de 7` : 'Sin orden',
      media,
    }),
  },
});
