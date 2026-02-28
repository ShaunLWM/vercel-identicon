import { glRender } from "./generators/webgl/gl-renderer";
import { hashToUniforms } from "./generators/webgl/gl-uniforms";
import { registry } from "./registry";
import type { RenderOptions, WebGLGenerator } from "./types";

const noop = () => {};

function isWebGLGenerator(g: unknown): g is WebGLGenerator {
	return typeof g === "object" && g !== null && "fragmentSource" in g;
}

export function isAnimatedVariant(variant: string): boolean {
	const generator = registry.get(variant);
	return !!generator && isWebGLGenerator(generator) && !!generator.animated;
}

/** Renders a single static frame. For animated generators, renders T=0 freeze frame. */
export function renderToCanvas(canvas: HTMLCanvasElement, options: RenderOptions): void {
	const {
		value,
		size = 32,
		variant = "bayer-4x4-oklch-mono",
		colorScheme = "oklch-mono",
	} = options;

	const generator = registry.get(variant);
	if (!generator) {
		console.warn(`[vercel-identicon] Unknown variant: "${variant}"`);
		return;
	}

	if (isWebGLGenerator(generator)) {
		const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
		canvas.width = size * dpr;
		canvas.height = size * dpr;
		const uniforms = hashToUniforms(value, colorScheme);
		glRender(
			canvas,
			generator.fragmentSource,
			generator.animated ? { ...uniforms, T: 0 } : uniforms,
		);
		return;
	}

	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	generator.render(ctx, size, value, colorScheme);
}

/** Starts an animation loop for animated WebGL generators. Returns stop function. */
export function startAnimation(canvas: HTMLCanvasElement, options: RenderOptions): () => void {
	const {
		value,
		size = 32,
		variant = "bayer-4x4-oklch-mono",
		colorScheme = "oklch-mono",
	} = options;

	const generator = registry.get(variant);
	if (!generator || !isWebGLGenerator(generator) || !generator.animated) return noop;

	const fragSource = generator.fragmentSource;
	const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
	canvas.width = size * dpr;
	canvas.height = size * dpr;
	const uniforms = hashToUniforms(value, colorScheme);

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
		glRender(canvas, fragSource, { ...uniforms, T: time });
		rafId = requestAnimationFrame(animate);
	}

	rafId = requestAnimationFrame(animate);

	return () => {
		running = false;
		cancelAnimationFrame(rafId);
	};
}
