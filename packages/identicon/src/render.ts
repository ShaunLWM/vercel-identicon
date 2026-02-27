import { glRender } from "./generators/webgl/gl-renderer";
import { hashToUniforms } from "./generators/webgl/gl-uniforms";
import { registry } from "./registry";
import type { RenderOptions, WebGLGenerator } from "./types";

const noop = () => {};

function isWebGLGenerator(g: unknown): g is WebGLGenerator {
	return typeof g === "object" && g !== null && "fragmentSource" in g;
}

export function renderToCanvas(canvas: HTMLCanvasElement, options: RenderOptions): () => void {
	const {
		value,
		size = 32,
		variant = "bayer-4x4-oklch-mono",
		colorScheme = "oklch-mono",
	} = options;

	const generator = registry.get(variant);
	if (!generator) {
		console.warn(`[vercel-identicon] Unknown variant: "${variant}"`);
		return noop;
	}

	if (isWebGLGenerator(generator)) {
		const glGen = generator;
		const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
		canvas.width = size * dpr;
		canvas.height = size * dpr;
		const uniforms = hashToUniforms(value, colorScheme);

		if (glGen.animated) {
			let time = 0;
			let lastTs = 0;
			let running = true;
			let rafId = 0;

			function animate(ts: number) {
				if (!running) return;
				if (!lastTs) lastTs = ts;
				const dt = Math.min((ts - lastTs) / 1000, 0.05);
				lastTs = ts;
				time += dt;
				glRender(canvas, glGen.fragmentSource, { ...uniforms, T: time });
				rafId = requestAnimationFrame(animate);
			}

			glRender(canvas, glGen.fragmentSource, { ...uniforms, T: 0 });
			rafId = requestAnimationFrame(animate);

			return () => {
				running = false;
				cancelAnimationFrame(rafId);
			};
		}

		glRender(canvas, glGen.fragmentSource, uniforms);
		return noop;
	}

	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext("2d");
	if (!ctx) return noop;
	generator.render(ctx, size, value, colorScheme);
	return noop;
}
