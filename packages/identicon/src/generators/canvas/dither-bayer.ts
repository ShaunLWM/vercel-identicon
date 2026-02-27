import { deriveHue, hsl, oklchToRgb, setPixel } from "../../core/color";
import { getColors } from "../../core/color-schemes";
import { hashString, mulberry32 } from "../../core/hash";
import type { CanvasGenerator } from "../../types";

export const bayerGenerators: CanvasGenerator[] = [
	{
		id: "bayer-2x2",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [rgb1, rgb2] = getColors(hash, colorScheme);
			const angle = rng() * Math.PI * 2;
			const B = [
				[0, 2],
				[3, 1],
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
					const pick = t > B[y % 2][x % 2] / 4 ? rgb1 : rgb2;
					setPixel(img, y * size + x, pick[0], pick[1], pick[2]);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "bayer-4x4",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [rgb1, rgb2] = getColors(hash, colorScheme);
			const angle = rng() * Math.PI * 2;
			const B = [
				[0, 8, 2, 10],
				[12, 4, 14, 6],
				[3, 11, 1, 9],
				[15, 7, 13, 5],
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
		id: "bayer-4x4-hsl-triadic",
		render(ctx, size, value, _colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const hue = deriveHue(hash);
			const rgb1 = hsl(hue, 95, 50);
			const rgb2 = hsl((hue + 120) % 360, 95, 50);
			const angle = rng() * Math.PI * 2;
			const B = [
				[0, 8, 2, 10],
				[12, 4, 14, 6],
				[3, 11, 1, 9],
				[15, 7, 13, 5],
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
		id: "bayer-4x4-oklch-mono",
		render(ctx, size, value, _colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const hue = deriveHue(hash);
			const rgb1 = oklchToRgb(0.8, 0.18, hue);
			const rgb2 = oklchToRgb(0.45, 0.18, hue);
			const angle = rng() * Math.PI * 2;
			const B = [
				[0, 8, 2, 10],
				[12, 4, 14, 6],
				[3, 11, 1, 9],
				[15, 7, 13, 5],
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
		id: "bayer-4x4-1-5x",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [rgb1, rgb2] = getColors(hash, colorScheme);
			const angle = rng() * Math.PI * 2;
			const B = [
				[0, 8, 2, 10],
				[12, 4, 14, 6],
				[3, 11, 1, 9],
				[15, 7, 13, 5],
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
					const pick = t > B[Math.floor(y / 1.5) % 4][Math.floor(x / 1.5) % 4] / 16 ? rgb1 : rgb2;
					setPixel(img, y * size + x, pick[0], pick[1], pick[2]);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "bayer-4x4-2x",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [rgb1, rgb2] = getColors(hash, colorScheme);
			const angle = rng() * Math.PI * 2;
			const B = [
				[0, 8, 2, 10],
				[12, 4, 14, 6],
				[3, 11, 1, 9],
				[15, 7, 13, 5],
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
					const pick = t > B[Math.floor(y / 2) % 4][Math.floor(x / 2) % 4] / 16 ? rgb1 : rgb2;
					setPixel(img, y * size + x, pick[0], pick[1], pick[2]);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "bayer-8x8",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [rgb1, rgb2] = getColors(hash, colorScheme);
			const angle = rng() * Math.PI * 2;
			const B = Array.from({ length: 8 }, (_, y) =>
				Array.from({ length: 8 }, (_, x) => {
					let v = 0,
						xc = x,
						yc = y,
						s = 8;
					while (s > 1) {
						s >>= 1;
						v <<= 2;
						v |= ((xc >= s ? 1 : 0) ^ (yc >= s ? 1 : 0)) | ((yc >= s ? 1 : 0) << 1);
						xc %= s;
						yc %= s;
					}
					return v;
				}),
			);
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
					const pick = t > B[y % 8][x % 8] / 64 ? rgb1 : rgb2;
					setPixel(img, y * size + x, pick[0], pick[1], pick[2]);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
];
