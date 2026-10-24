import { defineArrayMember, defineField, defineType } from 'sanity';

// Documentos únicos: solo existe uno de cada tipo y su _id es igual a su nombre.

/** Comprueba que `parte` aparezca tal cual dentro de `campo` (para resaltarla en amarillo). */
const estaDentroDe = (campo: string) => (r: any) =>
  r.custom((parte: { es?: string; en?: string } | undefined, { document }: any) => {
    const texto = document?.[campo] as { es?: string; en?: string } | undefined;
    for (const idioma of ['es', 'en'] as const) {
      if (parte?.[idioma] && texto?.[idioma] && !texto[idioma]!.includes(parte[idioma]!)) {
        return `Debe ser una parte exacta del texto de arriba (${idioma === 'es' ? 'español' : 'inglés'}).`;
      }
    }
    return true;
  });

export const paginaInicio = defineType({
  name: 'paginaInicio',
  title: 'Página de Inicio',
  type: 'document',
  groups: [
    { name: 'portada', title: 'Portada', default: true },
    { name: 'quienes', title: 'Quiénes somos' },
  ],
  fields: [
    defineField({
      name: 'etiquetaPortada',
      title: 'Etiqueta de la portada',
      type: 'textoLocal',
      group: 'portada',
      description: 'Texto corto en el recuadro amarillo, arriba del título.',
    }),
    defineField({
      name: 'tituloPortada',
      title: 'Título de la portada',
      type: 'textoLocal',
      group: 'portada',
      description: 'El título grande de la página.',
    }),
    defineField({
      name: 'tituloDestacado',
      title: 'Parte destacada del título',
      type: 'textoLocal',
      group: 'portada',
      description: 'Copia aquí, tal cual, la parte del título que va en amarillo.',
      validation: estaDentroDe('tituloPortada'),
    }),
    defineField({
      name: 'subtituloPortada',
      title: 'Subtítulo de la portada',
      type: 'textoLargoLocal',
      group: 'portada',
      description: 'Una o dos frases debajo del título.',
    }),
    defineField({
      name: 'fotosPortada',
      title: 'Fotos de la portada',
      type: 'array',
      group: 'portada',
      description: 'Exactamente 3 fotos. La primera va grande y también se usa al compartir el sitio en redes.',
      of: [defineArrayMember({ type: 'imagen' })],
      options: { layout: 'grid' },
      validation: (r) => r.length(3).error('Sube exactamente 3 fotos.'),
    }),
    defineField({
      name: 'fraseQuienesSomos',
      title: 'Frase de «Quiénes somos»',
      type: 'textoLargoLocal',
      group: 'quienes',
      description: 'La frase grande de la sección «¿Quiénes somos las Afrocaracolas?».',
    }),
    defineField({
      name: 'fraseQuienesSomosDestacada',
      title: 'Parte destacada de la frase',
      type: 'textoLocal',
      group: 'quienes',
      description: 'Copia aquí, tal cual, la parte de la frase que va en amarillo.',
      validation: estaDentroDe('fraseQuienesSomos'),
    }),
    defineField({
      name: 'anioInicio',
      title: 'Año de inicio',
      type: 'number',
      group: 'quienes',
      description: 'Año en que empezó la colectiva. Se muestra como «Desde».',
      validation: (r) => r.integer().min(1900).max(2100),
    }),
    defineField({
      name: 'territorio',
      title: 'Territorio',
      type: 'textoLocal',
      group: 'quienes',
      description: 'Dónde trabajan, en pocas palabras.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Página de Inicio' }) },
});

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
      description:
        'Déjalo vacío. El sitio no menciona el estatus de donataria ni la deducibilidad de impuestos; si hace falta, se consulta antes.',
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
    defineField({ name: 'mision', title: 'Misión', type: 'bloqueLocal', description: 'Sin el subtítulo «Misión»: el sitio lo pone.' }),
    defineField({ name: 'vision', title: 'Visión', type: 'bloqueLocal', description: 'Sin el subtítulo «Visión»: el sitio lo pone.' }),
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
