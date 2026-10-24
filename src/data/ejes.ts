// Color fijo de cada eje, asociado por slug (tabla de ejes de CLAUDE.md).
// El resto de los datos de los ejes vive en Sanity. Los colores no se editan en el Studio
// para que nadie rompa el contraste por accidente.
// Si agregas o cambias un slug, actualiza también SLUGS_EJES en studio/schemas/documentos/eje.ts.

export interface ColorEje {
	color: string;
	colorTexto: string;
}

const NEGRO = '#141013';
const BLANCO = '#FFFFFF';

export const COLORES_EJE: Record<string, ColorEje> = {
	'justicia-climatica-y-racial': { color: '#12A150', colorTexto: NEGRO },
	'granja-acuicola': { color: '#0A75C2', colorTexto: BLANCO },
	'autonomia-politica': { color: '#6B1E92', colorTexto: BLANCO },
	'autonomia-economica': { color: '#FFB627', colorTexto: NEGRO },
	'formacion-cimarrona': { color: '#FF5A36', colorTexto: NEGRO },
	eicafro: { color: '#C2185B', colorTexto: BLANCO }, // EICAfro = Escuela Itinerante de Cine Afro
	'investigacion-afrocentrada': { color: '#13A3A0', colorTexto: NEGRO },
};

/** Color de un eje por su slug. Falla el build si el slug no tiene color asignado. */
export function colorEje(slug: string): ColorEje {
	const color = COLORES_EJE[slug];
	if (!color) {
		throw new Error(
			`El eje con slug "${slug}" no tiene color asignado en src/data/ejes.ts. ` +
				`Slugs con color: ${Object.keys(COLORES_EJE).join(', ')}.`,
		);
	}
	return color;
}
