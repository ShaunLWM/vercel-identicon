import type { ColorScheme } from "../types";
import { deriveHue, hsl, oklchToRgb } from "./color";

const GOLDEN_ANGLE = 137.508;

type RGB = [number, number, number];
type ColorPair = [RGB, RGB];

type SchemeFunction = (hue: number) => ColorPair;

const schemes: Record<ColorScheme, SchemeFunction> = {
	"hsl-triadic": (hue) => [hsl(hue, 95, 50), hsl((hue + 120) % 360, 95, 50)],
	"hsl-complement": (hue) => [hsl(hue, 90, 50), hsl((hue + 180) % 360, 90, 50)],
	"hsl-analogous": (hue) => [hsl(hue, 85, 50), hsl((hue + 30) % 360, 85, 45)],
	"hsl-mono": (hue) => [hsl(hue, 70, 35), hsl(hue, 70, 65)],

	"oklch-triadic": (hue) => [oklchToRgb(0.7, 0.22, hue), oklchToRgb(0.62, 0.22, (hue + 120) % 360)],
	"oklch-golden": (hue) => [
		oklchToRgb(0.72, 0.22, hue),
		oklchToRgb(0.6, 0.22, (hue + GOLDEN_ANGLE) % 360),
	],
	"oklch-complement": (hue) => [
		oklchToRgb(0.75, 0.22, hue),
		oklchToRgb(0.55, 0.22, (hue + 180) % 360),
	],
	"oklch-analogous": (hue) => [
		oklchToRgb(0.72, 0.24, hue),
		oklchToRgb(0.58, 0.2, (hue + 35) % 360),
	],
	"oklch-split": (hue) => [oklchToRgb(0.7, 0.22, hue), oklchToRgb(0.6, 0.22, (hue + 150) % 360)],
	"oklch-tetrad": (hue) => [oklchToRgb(0.7, 0.22, hue), oklchToRgb(0.62, 0.22, (hue + 90) % 360)],
	"oklch-mono": (hue) => [oklchToRgb(0.8, 0.18, hue), oklchToRgb(0.45, 0.18, hue)],
	"oklch-warmcool": (hue) => {
		const warmH = (hue % 80) + 15;
		const coolH = 180 + (hue % 60);
		return [oklchToRgb(0.72, 0.24, warmH), oklchToRgb(0.58, 0.2, coolH)];
	},
	"oklch-vivid": (hue) => [
		oklchToRgb(0.72, 0.3, hue),
		oklchToRgb(0.6, 0.3, (hue + GOLDEN_ANGLE) % 360),
	],
	"oklch-pastel": (hue) => [oklchToRgb(0.82, 0.12, hue), oklchToRgb(0.75, 0.12, (hue + 120) % 360)],
	"oklch-cinema": (hue) => {
		const warmH = 40 + (hue % 40);
		const coolH = 220 + (hue % 30);
		return [oklchToRgb(0.74, 0.22, warmH), oklchToRgb(0.55, 0.18, coolH)];
	},
	"oklch-sunset": (hue) => [
		oklchToRgb(0.68, 0.26, (hue % 50) + 10),
		oklchToRgb(0.55, 0.22, (hue % 50) + 300),
	],
	"oklch-earth": (hue) => {
		const h = (hue % 60) + 30;
		return [oklchToRgb(0.55, 0.12, h), oklchToRgb(0.7, 0.1, (h + 30) % 360)];
	},
};

export function getColors(hash: [number, number], scheme: ColorScheme): ColorPair {
	const hue = deriveHue(hash);
	return (schemes[scheme] || schemes["oklch-mono"])(hue);
}
