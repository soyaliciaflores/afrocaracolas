import { defineArrayMember, defineField, defineType, type Rule } from 'sanity';

// Textos visibles en dos idiomas: `es` obligatorio y `en` opcional, en un grupo cerrado.
const fieldsetIngles = {
  name: 'ingles',
  title: 'English (opcional)',
  options: { collapsible: true, collapsed: true },
};

const esObligatorio = (r: Rule) => r.required().error('Escribe el texto en español.');

export const textoLocal = defineType({
  name: 'textoLocal',
  title: 'Texto corto',
  type: 'object',
  fieldsets: [fieldsetIngles],
  fields: [
    defineField({ name: 'es', title: 'Español', type: 'string', validation: esObligatorio }),
    defineField({ name: 'en', title: 'English', type: 'string', fieldset: 'ingles' }),
  ],
});

export const textoLargoLocal = defineType({
  name: 'textoLargoLocal',
  title: 'Texto largo',
  type: 'object',
  fieldsets: [fieldsetIngles],
  fields: [
    defineField({ name: 'es', title: 'Español', type: 'text', rows: 4, validation: esObligatorio }),
    defineField({ name: 'en', title: 'English', type: 'text', rows: 4, fieldset: 'ingles' }),
  ],
});

const bloques = [
  defineArrayMember({
    type: 'block',
    styles: [
      { title: 'Párrafo', value: 'normal' },
      { title: 'Subtítulo', value: 'h3' },
      { title: 'Subtítulo pequeño', value: 'h4' },
      { title: 'Cita', value: 'blockquote' },
    ],
    lists: [
      { title: 'Viñetas', value: 'bullet' },
      { title: 'Numerada', value: 'number' },
    ],
    marks: {
      decorators: [
        { title: 'Negritas', value: 'strong' },
        { title: 'Cursivas', value: 'em' },
      ],
      annotations: [
        {
          name: 'link',
          title: 'Enlace',
          type: 'object',
          fields: [
            defineField({
              name: 'href',
              title: 'Dirección (URL)',
              type: 'url',
              description: 'Empieza con https://, mailto: o tel:',
              validation: (r) =>
                r
                  .required()
                  .uri({ scheme: ['http', 'https', 'mailto', 'tel'] })
                  .error('Escribe una dirección completa, por ejemplo https://…'),
            }),
          ],
        },
      ],
    },
  }),
];

export const bloqueLocal = defineType({
  name: 'bloqueLocal',
  title: 'Texto con formato',
  type: 'object',
  fieldsets: [fieldsetIngles],
  fields: [
    defineField({ name: 'es', title: 'Español', type: 'array', of: bloques, validation: esObligatorio }),
    defineField({ name: 'en', title: 'English', type: 'array', of: bloques, fieldset: 'ingles' }),
  ],
});

// Como bloqueLocal, pero también admite fotos entre los párrafos (contenido de las notas).
const bloquesConImagen = [...bloques, defineArrayMember({ type: 'imagen' })];

export const contenidoLocal = defineType({
  name: 'contenidoLocal',
  title: 'Contenido con fotos',
  type: 'object',
  fieldsets: [fieldsetIngles],
  fields: [
    defineField({ name: 'es', title: 'Español', type: 'array', of: bloquesConImagen, validation: esObligatorio }),
    defineField({ name: 'en', title: 'English', type: 'array', of: bloquesConImagen, fieldset: 'ingles' }),
  ],
});

/** Valida que ningún idioma pase de `max` caracteres (para textoLocal y textoLargoLocal). */
export const maxCaracteres = (max: number) => (r: Rule) =>
  r.custom((valor?: { es?: string; en?: string }) => {
    const largo = Math.max(valor?.es?.length ?? 0, valor?.en?.length ?? 0);
    return largo > max ? `Máximo ${max} caracteres (llevas ${largo}).` : true;
  });
