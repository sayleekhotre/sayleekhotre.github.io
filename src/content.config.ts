import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const work = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/work' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string(),
      year: z.number().int(),
      role: z.string(),
      company: z.string(),
      platform: z.enum(['web', 'mobile']),
      summary: z.string(),
      tools: z.array(z.string()),
      heroImage: image(),
      order: z.number().int(),
      featured: z.boolean().default(false),
    }),
});

export const collections = { work };
