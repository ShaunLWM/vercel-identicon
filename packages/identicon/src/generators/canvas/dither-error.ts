import { setPixel } from "../../core/color";
import { getColors } from "../../core/color-schemes";
import { hashString, mulberry32 } from "../../core/hash";
import type { CanvasGenerator } from "../../types";

export const errorDiffusionGenerators: CanvasGenerator[] = [
	{
		id: "floyd-steinberg",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [rgb1, rgb2] = getColors(hash, colorScheme);
			const angle = rng() * Math.PI * 2;
			const gray = new Float32Array(size * size);
			for (let y = 0; y < size; y++)
				for (let x = 0; x < size; x++)
					gray[y * size + x] = Math.max(
						0,
						Math.min(
							1,
							(x / size - 0.5) * Math.cos(angle) + (y / size - 0.5) * Math.sin(angle) + 0.5,
						),
					);
			const err = Float32Array.from(gray);
			const out = new Uint8Array(size * size);
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const i = y * size + x;
					const nv = err[i] >= 0.5 ? 1 : 0;
					out[i] = nv;
					const e = err[i] - nv;
					if (x + 1 < size) err[i + 1] += (e * 7) / 16;
					if (y + 1 < size && x - 1 >= 0) err[i + size - 1] += (e * 3) / 16;
					if (y + 1 < size) err[i + size] += (e * 5) / 16;
					if (y + 1 < size && x + 1 < size) err[i + size + 1] += (e * 1) / 16;
				}
			}
			const img = ctx.createImageData(size, size);
			for (let i = 0; i < out.length; i++) {
				const c = out[i] ? rgb1 : rgb2;
				setPixel(img, i, c[0], c[1], c[2]);
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "atkinson",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [rgb1, rgb2] = getColors(hash, colorScheme);
			const angle = rng() * Math.PI * 2;
			const gray = new Float32Array(size * size);
			for (let y = 0; y < size; y++)
				for (let x = 0; x < size; x++)
					gray[y * size + x] = Math.max(
						0,
						Math.min(
							1,
							(x / size - 0.5) * Math.cos(angle) + (y / size - 0.5) * Math.sin(angle) + 0.5,
						),
					);
			const err = Float32Array.from(gray);
			const out = new Uint8Array(size * size);
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const i = y * size + x;
					const nv = err[i] >= 0.5 ? 1 : 0;
					out[i] = nv;
					const e = (err[i] - nv) / 8;
					if (x + 1 < size) err[i + 1] += e;
					if (x + 2 < size) err[i + 2] += e;
					if (y + 1 < size && x - 1 >= 0) err[i + size - 1] += e;
					if (y + 1 < size) err[i + size] += e;
					if (y + 1 < size && x + 1 < size) err[i + size + 1] += e;
					if (y + 2 < size) err[i + size * 2] += e;
				}
			}
			const img = ctx.createImageData(size, size);
			for (let i = 0; i < out.length; i++) {
				const c = out[i] ? rgb1 : rgb2;
				setPixel(img, i, c[0], c[1], c[2]);
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "jarvis-judice-ninke",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [rgb1, rgb2] = getColors(hash, colorScheme);
			const angle = rng() * Math.PI * 2;
			const gray = new Float32Array(size * size);
			for (let y = 0; y < size; y++)
				for (let x = 0; x < size; x++)
					gray[y * size + x] = Math.max(
						0,
						Math.min(
							1,
							(x / size - 0.5) * Math.cos(angle) + (y / size - 0.5) * Math.sin(angle) + 0.5,
						),
					);
			const err = Float32Array.from(gray);
			const out = new Uint8Array(size * size);
			const kernel = [
				[0, 0, 0, 7, 5],
				[3, 5, 7, 5, 3],
				[1, 3, 5, 3, 1],
			];
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const i = y * size + x;
					const nv = err[i] >= 0.5 ? 1 : 0;
					out[i] = nv;
					const e = err[i] - nv;
					for (let ky = 0; ky < 3; ky++) {
						for (let kx = 0; kx < 5; kx++) {
							const w = kernel[ky][kx];
							if (w === 0) continue;
							const nx = x + kx - 2,
								ny = y + ky;
							if (nx >= 0 && nx < size && ny < size) err[ny * size + nx] += (e * w) / 48;
						}
					}
				}
			}
			const img = ctx.createImageData(size, size);
			for (let i = 0; i < out.length; i++) {
				const c = out[i] ? rgb1 : rgb2;
				setPixel(img, i, c[0], c[1], c[2]);
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "sierra",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [rgb1, rgb2] = getColors(hash, colorScheme);
			const angle = rng() * Math.PI * 2;
			const gray = new Float32Array(size * size);
			for (let y = 0; y < size; y++)
				for (let x = 0; x < size; x++)
					gray[y * size + x] = Math.max(
						0,
						Math.min(
							1,
							(x / size - 0.5) * Math.cos(angle) + (y / size - 0.5) * Math.sin(angle) + 0.5,
						),
					);
			const err = Float32Array.from(gray);
			const out = new Uint8Array(size * size);
			// [dx, dy, weight]
			const offsets: [number, number, number][] = [
				[1, 0, 5],
				[2, 0, 3],
				[-2, 1, 2],
				[-1, 1, 4],
				[0, 1, 5],
				[1, 1, 4],
				[2, 1, 2],
				[-1, 2, 2],
				[0, 2, 3],
				[1, 2, 2],
			];
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const i = y * size + x;
					const nv = err[i] >= 0.5 ? 1 : 0;
					out[i] = nv;
					const e = err[i] - nv;
					for (const [dx, dy, w] of offsets) {
						const nx = x + dx,
							ny = y + dy;
						if (nx >= 0 && nx < size && ny < size) err[ny * size + nx] += (e * w) / 32;
					}
				}
			}
			const img = ctx.createImageData(size, size);
			for (let i = 0; i < out.length; i++) {
				const c = out[i] ? rgb1 : rgb2;
				setPixel(img, i, c[0], c[1], c[2]);
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "stucki",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [rgb1, rgb2] = getColors(hash, colorScheme);
			const angle = rng() * Math.PI * 2;
			const gray = new Float32Array(size * size);
			for (let y = 0; y < size; y++)
				for (let x = 0; x < size; x++)
					gray[y * size + x] = Math.max(
						0,
						Math.min(
							1,
							(x / size - 0.5) * Math.cos(angle) + (y / size - 0.5) * Math.sin(angle) + 0.5,
						),
					);
			const err = Float32Array.from(gray);
			const out = new Uint8Array(size * size);
			const offsets: [number, number, number][] = [
				[1, 0, 8],
				[2, 0, 4],
				[-2, 1, 2],
				[-1, 1, 4],
				[0, 1, 8],
				[1, 1, 4],
				[2, 1, 2],
				[-2, 2, 1],
				[-1, 2, 2],
				[0, 2, 4],
				[1, 2, 2],
				[2, 2, 1],
			];
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const i = y * size + x;
					const nv = err[i] >= 0.5 ? 1 : 0;
					out[i] = nv;
					const e = err[i] - nv;
					for (const [dx, dy, w] of offsets) {
						const nx = x + dx,
							ny = y + dy;
						if (nx >= 0 && nx < size && ny < size) err[ny * size + nx] += (e * w) / 42;
					}
				}
			}
			const img = ctx.createImageData(size, size);
			for (let i = 0; i < out.length; i++) {
				const c = out[i] ? rgb1 : rgb2;
				setPixel(img, i, c[0], c[1], c[2]);
			}
			ctx.putImageData(img, 0, 0);
		},
	},
];
