import { defineArrayMember, defineField, defineType } from 'sanity';

// Documentos únicos: solo existe uno de cada tipo y su _id es igual a su nombre.

export const ajustesSitio = defineType({
  name: 'ajustesSitio',
  title: 'Ajustes del sitio',
  type: 'document',
  fields: [
    defineField({
      name: 'correo',
      title: 'Correo de contacto',
      type: 'email',
      description: 'Aparece en Contacto y en el pie de página.',
    }),
    defineField({
      name: 'redes',
      title: 'Redes sociales',
      type: 'object',
      description: 'Enlaces a los perfiles de la colectiva. Deja vacía la red que no usen.',
      fields: [
        defineField({ name: 'instagram', title: 'Instagram', type: 'url' }),
        defineField({ name: 'facebook', title: 'Facebook', type: 'url' }),
        defineField({ name: 'tiktok', title: 'TikTok', type: 'url' }),
      ],
    }),
    defineField({
      name: 'leyendaDonataria',
      title: 'Leyenda de donataria',
      type: 'textoLargoLocal',
      description: 'Aviso sobre la deducibilidad de los donativos. Aparece en todas las secciones de donar.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'donorboxUrl',
      title: 'Formulario de Donorbox',
      type: 'url',
      description: 'Opcional. En Donorbox → tu campaña → «Donation Form», copia la URL del iframe.',
      validation: (r) => r.uri({ scheme: ['https'] }),
    }),
  ],
  preview: { prepare: () => ({ title: 'Ajustes del sitio' }) },
});

export const paginaDona = defineType({
  name: 'paginaDona',
  title: 'Página Dona',
  type: 'document',
  fields: [
    defineField({
      name: 'porQueDonar',
      title: '¿Por qué donar?',
      type: 'bloqueLocal',
      description: 'El texto de entrada de la página.',
    }),
    defineField({
      name: 'usos',
      title: '¿En qué usamos tu donativo?',
      type: 'array',
      description: 'Cada tarjeta explica un uso de los donativos. Arrástralas para cambiar el orden.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'uso',
          title: 'Uso',
          fields: [
            defineField({ name: 'titulo', title: 'Título', type: 'textoLocal', validation: (r) => r.required() }),
            defineField({ name: 'texto', title: 'Texto', type: 'textoLargoLocal' }),
            defineField({
              name: 'eje',
              title: 'Eje',
              type: 'reference',
              to: [{ type: 'eje' }],
              description: 'Opcional. Le da el color del eje a la tarjeta.',
            }),
          ],
          preview: { select: { title: 'titulo.es', subtitle: 'eje.nombre.es' } },
        }),
      ],
    }),
    defineField({
      name: 'otrasFormas',
      title: 'Otras formas de apoyar',
      type: 'bloqueLocal',
      description: 'Alianzas, apoyo en especie, voluntariado…',
    }),
    defineField({
      name: 'preguntasFrecuentes',
      title: 'Preguntas frecuentes',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'pregunta',
          title: 'Pregunta',
          fields: [
            defineField({ name: 'pregunta', title: 'Pregunta', type: 'textoLocal', validation: (r) => r.required() }),
            defineField({ name: 'respuesta', title: 'Respuesta', type: 'textoLargoLocal', validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'pregunta.es' } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Página Dona' }) },
});

export const paginaNosotras = defineType({
  name: 'paginaNosotras',
  title: 'Página Nosotras',
  type: 'document',
  fields: [
    defineField({ name: 'intro', title: 'Introducción', type: 'bloqueLocal', description: 'Quiénes somos, en pocas palabras.' }),
    defineField({ name: 'porQueAfrocaracolas', title: '¿Por qué Afrocaracolas?', type: 'bloqueLocal', description: 'El origen del nombre.' }),
    defineField({ name: 'comoTrabajamos', title: 'Cómo trabajamos', type: 'bloqueLocal' }),
    defineField({ name: 'incidencia', title: 'Incidencia', type: 'bloqueLocal' }),
    defineField({ name: 'saberesItinerantes', title: 'Saberes Itinerantes', type: 'bloqueLocal' }),
    defineField({ name: 'comoEmpezamos', title: 'Cómo empezamos', type: 'bloqueLocal' }),
    defineField({
      name: 'fraseCierre',
      title: 'Frase de cierre',
      type: 'textoLocal',
      description: 'La frase grande al final de la página.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Página Nosotras' }) },
});
