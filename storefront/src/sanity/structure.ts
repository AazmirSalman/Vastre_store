import type { StructureResolver } from 'sanity/structure'

const orderList = (S: Parameters<StructureResolver>[0], id: string, title: string, filter: string) =>
  S.listItem()
    .id(id)
    .title(title)
    .child(
      S.documentList()
        .id(id)
        .title(title)
        .schemaType('order')
        .filter(`_type == "order" && ${filter}`)
        .defaultOrdering([{ field: 'placedAt', direction: 'desc' }]),
    )

/** The left-hand menu the owner sees. Orders first, then the shop's content. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Vastre')
    .items([
      S.listItem()
        .id('orders')
        .title('Orders')
        .child(
          S.list()
            .id('orders-menu')
            .title('Orders')
            .items([
              orderList(S, 'orders-awaiting', 'Awaiting payment', '(status == "awaiting_payment" || !defined(status))'),
              orderList(S, 'orders-make', 'To make (paid / in production)', 'status in ["paid", "in_production"]'),
              orderList(S, 'orders-shipped', 'Shipped', 'status == "shipped"'),
              orderList(S, 'orders-delivered', 'Delivered', 'status == "delivered"'),
              orderList(S, 'orders-cancelled', 'Cancelled', 'status == "cancelled"'),
              S.divider(),
              orderList(S, 'orders-all', 'All orders', 'true'),
            ]),
        ),
      S.divider(),
      S.documentTypeListItem('product').title('Products'),
      S.documentTypeListItem('collection').title('Collections'),
      S.divider(),
      S.listItem()
        .id('siteSettings')
        .title('Site settings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings').title('Site settings')),
    ])
