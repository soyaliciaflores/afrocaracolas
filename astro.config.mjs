// @ts-check

import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

// Sin Sanity el sitio se construiría vacío: mejor fallar con un mensaje claro.
const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const faltan = ['SANITY_PROJECT_ID', 'SANITY_DATASET'].filter((nombre) => !env[nombre]);
if (faltan.length > 0) {
	throw new Error(
		`Faltan variables de entorno de Sanity: ${faltan.join(', ')}.\n` +
			'Defínelas en .env.local (en tu computadora) o en Vercel → Settings → Environment Variables.\n' +
			'Valores: SANITY_PROJECT_ID=zw44t9i9 y SANITY_DATASET=production. Ver README.md.',
	);
}

// https://astro.build/config
// Las redirecciones viven en vercel.json (301 reales).
export default defineConfig({
	site: 'https://afrocaracolas.org',
	integrations: [sitemap()],
	i18n: {
		locales: ['es', 'en'],
		defaultLocale: 'es',
		routing: {
			prefixDefaultLocale: false,
		},
	},
});
