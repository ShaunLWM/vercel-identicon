import { algorithmicGenerators } from "./generators/canvas/algorithmic";

import { bayerGenerators } from "./generators/canvas/dither-bayer";
import { errorDiffusionGenerators } from "./generators/canvas/dither-error";
import { organicDitherGenerators } from "./generators/canvas/dither-organic";
import { patternDitherGenerators } from "./generators/canvas/dither-pattern";
import { generativeGenerators } from "./generators/canvas/generative";
import { natureGenerators } from "./generators/canvas/nature";
import { retroGenerators } from "./generators/canvas/retro";
import { strikingGenerators } from "./generators/canvas/striking";
import { terminalGenerators } from "./generators/canvas/terminal";
import { textileGenerators } from "./generators/canvas/textile";
import { artShadersGenerators } from "./generators/webgl/shaders-art";
import { effectsShadersGenerators } from "./generators/webgl/shaders-effects";
import { sceneShadersGenerators } from "./generators/webgl/shaders-scenes";
import type { Generator } from "./types";

const allGenerators: Generator[] = [
	...bayerGenerators,
	...errorDiffusionGenerators,
	...patternDitherGenerators,
	...organicDitherGenerators,
	...terminalGenerators,
	...retroGenerators,
	...strikingGenerators,
	...algorithmicGenerators,
	...generativeGenerators,
	...natureGenerators,
	...textileGenerators,
	...sceneShadersGenerators,
	...artShadersGenerators,
	...effectsShadersGenerators,
];

export const registry = new Map<string, Generator>();
for (const g of allGenerators) {
	if (registry.has(g.id)) {
		console.warn(`[vercel-identicon] Duplicate generator id: "${g.id}"`);
	}
	registry.set(g.id, g);
}

export const variantIds: string[] = allGenerators.map((g) => g.id);
