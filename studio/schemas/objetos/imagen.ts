import { defineArrayMember, defineField, defineType } from 'sanity';

export const imagen = defineType({
  name: 'imagen',
  title: 'Imagen',
  type: 'image',
  description: 'No subas fotos de integrantes sin su consentimiento.',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Texto alternativo',
      type: 'textoLocal',
      description:
        'Describe lo que se ve en la foto, para personas que usan lector de pantalla: quiénes o qué aparece y qué pasa.',
      validation: (r) => r.required().error('Agrega el texto alternativo de la imagen.'),
    }),
    defineField({
      name: 'pie',
      title: 'Pie de foto',
      type: 'textoLocal',
      description: 'Opcional. Texto que aparece debajo de la foto.',
    }),
  ],
});

/** Campo de galería reutilizable: lista de imágenes con texto alternativo. */
export const campoGaleria = (descripcion = 'Fotos adicionales. Arrástralas para cambiar el orden.') =>
  defineField({
    name: 'galeria',
    title: 'Galería',
    type: 'array',
    description: descripcion,
    of: [defineArrayMember({ type: 'imagen' })],
    options: { layout: 'grid' },
  });
