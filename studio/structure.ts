import type { StructureBuilder, StructureResolver } from 'sanity/structure';

const unico = (S: StructureBuilder, id: string, titulo: string) =>
  S.listItem()
    .title(titulo)
    .id(id)
    .schemaType(id)
    .child(S.document().schemaType(id).documentId(id).title(titulo));

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenido')
    .items([
      unico(S, 'ajustesSitio', 'Ajustes del sitio'),
      unico(S, 'paginaNosotras', 'Página Nosotras'),
      unico(S, 'paginaDona', 'Página Dona'),
      S.divider(),
      S.listItem()
        .title('Ejes')
        .schemaType('eje')
        .child(
          S.documentTypeList('eje')
            .title('Ejes')
            .defaultOrdering([{ field: 'orden', direction: 'asc' }]),
        ),
      S.listItem()
        .title('Proyectos')
        .schemaType('proyecto')
        .child(
          S.list()
            .title('Proyectos')
            .items([
              S.listItem()
                .title('Todos los proyectos')
                .schemaType('proyecto')
                .child(S.documentTypeList('proyecto').title('Todos los proyectos')),
              S.listItem()
                .title('Por eje')
                .child(
                  S.documentTypeList('eje')
                    .title('Proyectos por eje')
                    .defaultOrdering([{ field: 'orden', direction: 'asc' }])
                    .child((ejeId) =>
                      S.documentList()
                        .title('Proyectos del eje')
                        .schemaType('proyecto')
                        .filter('_type == "proyecto" && eje._ref == $ejeId')
                        .params({ ejeId })
                        .initialValueTemplates([S.initialValueTemplateItem('proyecto-en-eje', { ejeId })]),
                    ),
                ),
            ]),
        ),
      S.documentTypeListItem('nota').title('Notas y momentos'),
      S.documentTypeListItem('publicacionRedes').title('Publicaciones de redes'),
      S.documentTypeListItem('integrante').title('Integrantes'),
    ]);
