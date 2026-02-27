import type { CSSProperties } from "react";

export type ColorScheme =
	| "hsl-triadic"
	| "hsl-complement"
	| "hsl-analogous"
	| "hsl-mono"
	| "oklch-mono"
	| "oklch-triadic"
	| "oklch-golden"
	| "oklch-complement"
	| "oklch-analogous"
	| "oklch-split"
	| "oklch-tetrad"
	| "oklch-warmcool"
	| "oklch-vivid"
	| "oklch-pastel"
	| "oklch-cinema"
	| "oklch-sunset"
	| "oklch-earth";

export type CanvasGenerator = {
	id: string;
	render: (
		ctx: CanvasRenderingContext2D,
		size: number,
		value: string,
		colorScheme: ColorScheme,
	) => void;
};

export type WebGLGenerator = {
	id: string;
	fragmentSource: string;
	animated?: boolean;
};

export type Generator = CanvasGenerator | WebGLGenerator;

export type Variant = string & {};

export type IdenticonProps = {
	value: string;
	size?: number;
	variant?: Variant;
	colorScheme?: ColorScheme;
	className?: string;
	style?: CSSProperties;
};

export type RenderOptions = {
	value: string;
	size?: number;
	variant?: Variant;
	colorScheme?: ColorScheme;
};
