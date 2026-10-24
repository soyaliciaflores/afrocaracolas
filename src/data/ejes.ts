// Datos temporales de los 7 ejes mientras se crean los schemas de Sanity (Bloque 2).
// Colores y color de texto según la tabla de ejes de CLAUDE.md.

export interface Proyecto {
	nombre: string;
	slug: string;
}

export interface Eje {
	nombre: string;
	slug: string;
	color: string;
	colorTexto: string;
	proyectos: Proyecto[];
}

const NEGRO = '#141013';
const BLANCO = '#FFFFFF';

export const EJES: Eje[] = [
	{
		nombre: 'Justicia climática y racial',
		slug: 'justicia-climatica-y-racial',
		color: '#12A150',
		colorTexto: NEGRO,
		proyectos: [],
	},
	{
		nombre: 'Granja Acuícola',
		slug: 'granja-acuicola',
		color: '#0A75C2',
		colorTexto: BLANCO,
		proyectos: [],
	},
	{
		nombre: 'Autonomía política',
		slug: 'autonomia-politica',
		color: '#6B1E92',
		colorTexto: BLANCO,
		proyectos: [
			{
				nombre: 'Agenda Política de los derechos político-electorales de las mujeres afromexicanas',
				slug: 'agenda-politica',
			},
			{
				nombre: 'Cartilla de derechos de las mujeres afromexicanas',
				slug: 'cartilla-de-derechos',
			},
		],
	},
	{
		nombre: 'Autonomía económica',
		slug: 'autonomia-economica',
		color: '#FFB627',
		colorTexto: NEGRO,
		proyectos: [],
	},
	{
		nombre: 'Formación Cimarrona',
		slug: 'formacion-cimarrona',
		color: '#FF5A36',
		colorTexto: NEGRO,
		proyectos: [],
	},
	{
		nombre: 'EICAfro',
		slug: 'eicafro',
		color: '#C2185B',
		colorTexto: BLANCO,
		proyectos: [],
	},
	{
		nombre: 'Investigación afrocentrada',
		slug: 'investigacion-afrocentrada',
		color: '#13A3A0',
		colorTexto: NEGRO,
		proyectos: [],
	},
];
