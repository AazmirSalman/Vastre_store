'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemaTypes'
import { structure } from './structure'

/** The editing panel. It runs inside the website at /studio, so there is nothing separate to deploy. */
export default defineConfig({
  name: 'vastre',
  title: 'Vastre',
  basePath: '/studio',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'not-set',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  plugins: [structureTool({ structure })],
  schema: {
    types: schemaTypes,
    // "Site settings" is a single page, so it is never offered as "create new".
    templates: (prev) => prev.filter((t) => t.schemaType !== 'siteSettings'),
  },
  document: {
    // Site settings can be edited but never deleted or duplicated by accident.
    actions: (prev, context) =>
      context.schemaType === 'siteSettings'
        ? prev.filter(({ action }) => action !== 'delete' && action !== 'duplicate' && action !== 'unpublish')
        : prev,
  },
})
