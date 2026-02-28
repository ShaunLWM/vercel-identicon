import { setPixel } from "../../core/color";
import { getColors } from "../../core/color-schemes";
import { hashString, mulberry32 } from "../../core/hash";
import type { CanvasGenerator } from "../../types";

function pixelHash(x: number, y: number, seed: number): number {
	let h = seed;
	h = Math.imul(h ^ x, 2654435761);
	h = Math.imul(h ^ y, 2246822507);
	h ^= h >>> 16;
	return (h >>> 0) / 4294967296;
}

export const patternDitherGenerators: CanvasGenerator[] = [
	{
		id: "white-noise",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [rgb1, rgb2] = getColors(hash, colorScheme);
			const angle = rng() * Math.PI * 2;
			const threshRng = mulberry32(hash[1]);
			const img = ctx.createImageData(size, size);
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const t = Math.max(
						0,
						Math.min(
							1,
							(x / size - 0.5) * Math.cos(angle) + (y / size - 0.5) * Math.sin(angle) + 0.5,
						),
					);
					const pick = t > threshRng() ? rgb1 : rgb2;
					setPixel(img, y * size + x, pick[0], pick[1], pick[2]);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "blue-noise",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [rgb1, rgb2] = getColors(hash, colorScheme);
			const angle = rng() * Math.PI * 2;
			const seed = hash[0];
			const img = ctx.createImageData(size, size);
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const t = Math.max(
						0,
						Math.min(
							1,
							(x / size - 0.5) * Math.cos(angle) + (y / size - 0.5) * Math.sin(angle) + 0.5,
						),
					);
					const pick = t > pixelHash(x, y, seed) ? rgb1 : rgb2;
					setPixel(img, y * size + x, pick[0], pick[1], pick[2]);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "halftone-dots",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [rgb1, rgb2] = getColors(hash, colorScheme);
			const angle = rng() * Math.PI * 2;
			const B = [
				[12, 5, 6, 13],
				[4, 0, 1, 7],
				[11, 3, 2, 8],
				[15, 10, 9, 14],
			];
			const img = ctx.createImageData(size, size);
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const t = Math.max(
						0,
						Math.min(
							1,
							(x / size - 0.5) * Math.cos(angle) + (y / size - 0.5) * Math.sin(angle) + 0.5,
						),
					);
					const pick = t > B[y % 4][x % 4] / 16 ? rgb1 : rgb2;
					setPixel(img, y * size + x, pick[0], pick[1], pick[2]);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "diagonal-line",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [rgb1, rgb2] = getColors(hash, colorScheme);
			const angle = rng() * Math.PI * 2;
			const cellSize = 4;
			const img = ctx.createImageData(size, size);
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const t = Math.max(
						0,
						Math.min(
							1,
							(x / size - 0.5) * Math.cos(angle) + (y / size - 0.5) * Math.sin(angle) + 0.5,
						),
					);
					const diag = ((x + y) % cellSize) / cellSize;
					const pick = t > diag ? rgb1 : rgb2;
					setPixel(img, y * size + x, pick[0], pick[1], pick[2]);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "horizontal-line",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [rgb1, rgb2] = getColors(hash, colorScheme);
			const angle = rng() * Math.PI * 2;
			const cellSize = size <= 32 ? 3 : 4;
			const img = ctx.createImageData(size, size);
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const t = Math.max(
						0,
						Math.min(
							1,
							(x / size - 0.5) * Math.cos(angle) + (y / size - 0.5) * Math.sin(angle) + 0.5,
						),
					);
					const line = (y % cellSize) / cellSize;
					const pick = t > line ? rgb1 : rgb2;
					setPixel(img, y * size + x, pick[0], pick[1], pick[2]);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "spiral",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [rgb1, rgb2] = getColors(hash, colorScheme);
			const angle = rng() * Math.PI * 2;
			const twist = 2 + rng() * 4;
			const img = ctx.createImageData(size, size);
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const t = Math.max(
						0,
						Math.min(
							1,
							(x / size - 0.5) * Math.cos(angle) + (y / size - 0.5) * Math.sin(angle) + 0.5,
						),
					);
					const dx = x / size - 0.5,
						dy = y / size - 0.5;
					const a = Math.atan2(dy, dx);
					const dist = Math.sqrt(dx * dx + dy * dy);
					const spiral = (((a / (Math.PI * 2) + dist * twist) % 1) + 1) % 1;
					const pick = t > spiral ? rgb1 : rgb2;
					setPixel(img, y * size + x, pick[0], pick[1], pick[2]);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "radial",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [rgb1, rgb2] = getColors(hash, colorScheme);
			const angle = rng() * Math.PI * 2;
			const cx = size * (0.3 + rng() * 0.4);
			const cy = size * (0.3 + rng() * 0.4);
			const rings = size <= 32 ? 6 : 10;
			const img = ctx.createImageData(size, size);
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const t = Math.max(
						0,
						Math.min(
							1,
							(x / size - 0.5) * Math.cos(angle) + (y / size - 0.5) * Math.sin(angle) + 0.5,
						),
					);
					const d = Math.hypot(x - cx, y - cy) / size;
					const ring = (d * rings) % 1;
					const pick = t > ring ? rgb1 : rgb2;
					setPixel(img, y * size + x, pick[0], pick[1], pick[2]);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "checkerboard",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [rgb1, rgb2] = getColors(hash, colorScheme);
			const angle = rng() * Math.PI * 2;
			const img = ctx.createImageData(size, size);
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const t = Math.max(
						0,
						Math.min(
							1,
							(x / size - 0.5) * Math.cos(angle) + (y / size - 0.5) * Math.sin(angle) + 0.5,
						),
					);
					const checker = ((x + y) % 2) / 2 + 0.25;
					const pick = t > checker ? rgb1 : rgb2;
					setPixel(img, y * size + x, pick[0], pick[1], pick[2]);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "cross",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [rgb1, rgb2] = getColors(hash, colorScheme);
			const angle = rng() * Math.PI * 2;
			const B = [
				[11, 6, 8, 13],
				[5, 0, 1, 7],
				[9, 2, 3, 10],
				[15, 4, 12, 14],
			];
			const img = ctx.createImageData(size, size);
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const t = Math.max(
						0,
						Math.min(
							1,
							(x / size - 0.5) * Math.cos(angle) + (y / size - 0.5) * Math.sin(angle) + 0.5,
						),
					);
					const pick = t > B[y % 4][x % 4] / 16 ? rgb1 : rgb2;
					setPixel(img, y * size + x, pick[0], pick[1], pick[2]);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "diamond",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [rgb1, rgb2] = getColors(hash, colorScheme);
			const angle = rng() * Math.PI * 2;
			const cellSize = 6;
			const img = ctx.createImageData(size, size);
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const t = Math.max(
						0,
						Math.min(
							1,
							(x / size - 0.5) * Math.cos(angle) + (y / size - 0.5) * Math.sin(angle) + 0.5,
						),
					);
					const cx = (x % cellSize) - cellSize / 2 + 0.5;
					const cy = (y % cellSize) - cellSize / 2 + 0.5;
					const diamond = (Math.abs(cx) + Math.abs(cy)) / cellSize;
					const pick = t > diamond ? rgb1 : rgb2;
					setPixel(img, y * size + x, pick[0], pick[1], pick[2]);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
];
