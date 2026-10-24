// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://afrocaracolas.org',
	integrations: [mdx(), sitemap()],
	i18n: {
		locales: ['es', 'en'],
		defaultLocale: 'es',
		routing: {
			prefixDefaultLocale: false,
		},
	},
	redirects: {
		'/quienes-somos': '/nosotras',
		'/donar': '/dona',
	},
});
