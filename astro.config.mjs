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
if (!/^[a-z0-9-]+$/.test(env.SANITY_PROJECT_ID) || !/^~?[a-z0-9_-]{1,64}$/.test(env.SANITY_DATASET)) {
	throw new Error(
		'Las variables de Sanity tienen un formato no válido:\n' +
			`  SANITY_PROJECT_ID=${JSON.stringify(env.SANITY_PROJECT_ID)}\n` +
			`  SANITY_DATASET=${JSON.stringify(env.SANITY_DATASET)}\n` +
			'Deben ser exactamente zw44t9i9 y production: en minúsculas, sin comillas ni espacios.',
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
