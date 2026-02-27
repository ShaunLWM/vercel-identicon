import { deriveHue } from "../../core/color";
import { getColors } from "../../core/color-schemes";
import { hashString, mulberry32 } from "../../core/hash";
import type { ColorScheme } from "../../types";

export function hashToUniforms(
	value: string,
	colorScheme: ColorScheme = "oklch-mono",
): Record<string, number | number[]> {
	const hash = hashString(value);
	const rng = mulberry32(hash[0]);
	const [c1, c2] = getColors(hash, colorScheme);
	const p: number[] = [];
	for (let i = 0; i < 8; i++) p.push(rng());
	return {
		S: hash[0] / 4294967296,
		H: deriveHue(hash) / 360,
		P: [p[0], p[1], p[2], p[3]],
		Q: [p[4], p[5], p[6], p[7]],
		C1: [c1[0] / 255, c1[1] / 255, c1[2] / 255],
		C2: [c2[0] / 255, c2[1] / 255, c2[2] / 255],
	};
}
