import { defineArrayMember, defineField, defineType } from 'sanity';
import { campoGaleria } from '../objetos/imagen';

export const proyecto = defineType({
  name: 'proyecto',
  title: 'Proyecto',
  type: 'document',
  description: 'Un proyecto dentro de un eje de trabajo.',
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'contenido', title: 'Contenido' },
    { name: 'fotos', title: 'Fotos' },
    { name: 'extras', title: 'Cita, cifras y descargas' },
  ],
  fields: [
    defineField({
      name: 'nombre',
      title: 'Nombre',
      type: 'textoLocal',
      group: 'general',
      description: 'Nombre completo del proyecto.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      group: 'general',
      description: 'Parte final de la dirección: afrocaracolas.org/ejes/[eje]/… Usa palabras cortas, sin acentos.',
      options: { source: 'nombre.es', maxLength: 64 },
      validation: (r) => r.required().error('Genera el slug con el botón «Generate».'),
    }),
    defineField({
      name: 'eje',
      title: 'Eje',
      type: 'reference',
      group: 'general',
      to: [{ type: 'eje' }],
      description: 'El eje de trabajo al que pertenece. De él toma su color.',
      validation: (r) => r.required().error('Elige el eje del proyecto.'),
    }),
    defineField({
      name: 'estado',
      title: 'Estado',
      type: 'string',
      group: 'general',
      options: {
        list: [
          { title: 'Activo', value: 'activo' },
          { title: 'Concluido', value: 'concluido' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'activo',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'fechaInicio',
      title: 'Fecha de inicio',
      type: 'date',
      group: 'general',
      options: { dateFormat: 'DD/MM/YYYY' },
    }),
    defineField({
      name: 'fechaFin',
      title: 'Fecha de fin',
      type: 'date',
      group: 'general',
      description: 'Opcional. Déjala vacía si el proyecto sigue.',
      options: { dateFormat: 'DD/MM/YYYY' },
      validation: (r) =>
        r.custom((fin: string | undefined, { document }) => {
          const inicio = document?.fechaInicio as string | undefined;
          return fin && inicio && fin < inicio ? 'La fecha de fin no puede ser anterior a la de inicio.' : true;
        }),
    }),
    defineField({
      name: 'destacado',
      title: 'Destacado',
      type: 'boolean',
      group: 'general',
      description: 'Actívalo para mostrarlo en Inicio.',
      initialValue: false,
    }),
    defineField({
      name: 'resumen',
      title: 'Resumen',
      type: 'textoLargoLocal',
      group: 'contenido',
      description: 'Una o dos frases que expliquen el proyecto.',
    }),
    defineField({
      name: 'porQue',
      title: '¿Por qué?',
      type: 'textoLargoLocal',
      group: 'contenido',
      description: 'Qué problema atiende el proyecto.',
    }),
    defineField({
      name: 'queHacemos',
      title: '¿Qué hacemos?',
      type: 'bloqueLocal',
      group: 'contenido',
      description: 'Las actividades del proyecto en territorio.',
    }),
    defineField({
      name: 'lugar',
      title: 'Lugar',
      type: 'textoLocal',
      group: 'contenido',
      description: 'Región o municipio. No pongas la comunidad de una integrante sin su consentimiento.',
    }),
    defineField({
      name: 'conQuien',
      title: '¿Con quién?',
      type: 'textoLargoLocal',
      group: 'contenido',
      description: 'Con quiénes se hace: comunidades, aliadas, instituciones.',
    }),
    defineField({
      name: 'queFalta',
      title: '¿Qué falta?',
      type: 'textoLargoLocal',
      group: 'contenido',
      description: 'Qué necesita el proyecto para seguir. Ayuda a quien quiere donar.',
    }),
    defineField({
      name: 'fotoPrincipal',
      title: 'Foto principal',
      type: 'imagen',
      group: 'fotos',
    }),
    { ...campoGaleria(), group: 'fotos' },
    defineField({
      name: 'cita',
      title: 'Cita',
      type: 'object',
      group: 'extras',
      description: 'Opcional. Publica solo con el consentimiento de quien la dijo.',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'texto', title: 'Texto de la cita', type: 'textoLargoLocal', validation: (r) => r.required() }),
        defineField({
          name: 'autora',
          title: 'Autora',
          type: 'textoLocal',
          description: 'Como quiere aparecer; puede ser solo su nombre.',
        }),
        defineField({
          name: 'comunidad',
          title: 'Comunidad',
          type: 'textoLocal',
          description: 'Solo si ella lo autorizó.',
        }),
      ],
    }),
    defineField({
      name: 'cifras',
      title: 'Cifras',
      type: 'array',
      group: 'extras',
      description: 'Opcional. Datos del proyecto, por ejemplo cuántas personas participaron. Solo cifras confirmadas.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'cifra',
          title: 'Cifra',
          fields: [
            defineField({
              name: 'valor',
              title: 'Valor',
              type: 'string',
              description: 'El número tal como se debe leer, con formato de México: 1,500 · 12.5 %',
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'etiqueta',
              title: 'Etiqueta',
              type: 'textoLocal',
              description: 'Qué cuenta ese número, por ejemplo «mujeres en los talleres».',
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: { valor: 'valor', etiqueta: 'etiqueta.es' },
            prepare: ({ valor, etiqueta }) => ({ title: `${valor ?? ''} ${etiqueta ?? ''}`.trim() }),
          },
        }),
      ],
    }),
    defineField({
      name: 'descargables',
      title: 'Descargables',
      type: 'array',
      group: 'extras',
      description: 'Documentos en PDF para descargar, por ejemplo la Cartilla.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'descargable',
          title: 'Descargable',
          fields: [
            defineField({ name: 'titulo', title: 'Título', type: 'textoLocal', validation: (r) => r.required() }),
            defineField({
              name: 'archivo',
              title: 'Archivo PDF',
              type: 'file',
              options: { accept: 'application/pdf' },
              validation: (r) => r.required().error('Sube el archivo PDF.'),
            }),
          ],
          preview: { select: { title: 'titulo.es' } },
        }),
      ],
    }),
  ],
  orderings: [
    { title: 'Nombre', name: 'nombreAsc', by: [{ field: 'nombre.es', direction: 'asc' }] },
    { title: 'Fecha de inicio, más reciente', name: 'inicioDesc', by: [{ field: 'fechaInicio', direction: 'desc' }] },
  ],
  preview: {
    select: { nombre: 'nombre.es', eje: 'eje.nombre.es', estado: 'estado', media: 'fotoPrincipal' },
    prepare: ({ nombre, eje, estado, media }) => ({
      title: nombre ?? 'Proyecto sin nombre',
      subtitle: [eje, estado === 'concluido' ? 'Concluido' : 'Activo'].filter(Boolean).join(' · '),
      media,
    }),
  },
});
