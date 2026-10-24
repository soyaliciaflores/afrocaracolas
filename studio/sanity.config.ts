import { esESLocale } from '@sanity/locale-es-es';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes, SINGLETONS } from './schemas';
import { structure } from './structure';

// Acciones permitidas en los documentos únicos: no se pueden duplicar ni borrar.
const ACCIONES_UNICOS = new Set(['publish', 'discardChanges', 'restore']);

export default defineConfig({
  name: 'afrocaracolas',
  title: 'Afrocaracolas',
  projectId: 'zw44t9i9',
  dataset: 'production',
  plugins: [structureTool({ title: 'Contenido', structure }), esESLocale()],
  schema: {
    types: schemaTypes,
    templates: (anteriores) => [
      ...anteriores.filter((t) => !SINGLETONS.has(t.schemaType)),
      {
        id: 'proyecto-en-eje',
        title: 'Proyecto en este eje',
        schemaType: 'proyecto',
        parameters: [{ name: 'ejeId', type: 'string' }],
        value: ({ ejeId }: { ejeId: string }) => ({ eje: { _type: 'reference', _ref: ejeId }, estado: 'activo' }),
      },
    ],
  },
  document: {
    actions: (anteriores, { schemaType }) =>
      SINGLETONS.has(schemaType)
        ? anteriores.filter(({ action }) => action && ACCIONES_UNICOS.has(action))
        : anteriores,
    newDocumentOptions: (anteriores, { creationContext }) =>
      creationContext.type === 'global'
        ? anteriores.filter((t) => !SINGLETONS.has(t.templateId) && t.templateId !== 'proyecto-en-eje')
        : anteriores,
  },
});
