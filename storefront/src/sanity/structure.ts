import type { StructureResolver } from 'sanity/structure'

/** The left-hand menu the owner sees. Site settings is a single page, the rest are lists. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Vastre')
    .items([
      S.documentTypeListItem('product').title('Products'),
      S.documentTypeListItem('collection').title('Collections'),
      S.divider(),
      S.listItem()
        .id('siteSettings')
        .title('Site settings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings').title('Site settings')),
    ])
