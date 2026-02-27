import { deriveHue, hsl, setPixel } from "../../core/color";
import { getBits, hashString, mulberry32 } from "../../core/hash";
import type { CanvasGenerator } from "../../types";

export const terminalGenerators: CanvasGenerator[] = [
	{
		id: "phosphor-grid",
		render(ctx, size, value, _colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const bits = getBits(hash, 64);
			const isGreen = hash[0] % 2;
			const bright: [number, number, number] = isGreen ? [0, 255, 65] : [255, 176, 0];
			const dim: [number, number, number] = isGreen ? [0, 40, 8] : [40, 28, 0];
			const gridN = size <= 32 ? 5 : 7;
			const cell = size / gridN;
			const img = ctx.createImageData(size, size);
			for (let i = 0; i < size * size; i++) setPixel(img, i, dim[0], dim[1], dim[2]);
			ctx.putImageData(img, 0, 0);
			for (let row = 0; row < gridN; row++) {
				for (let col = 0; col < gridN; col++) {
					const on = bits[(row * gridN + col) % bits.length];
					const cx = col * cell + cell / 2;
					const cy = row * cell + cell / 2;
					const r = cell * 0.35;
					if (on) {
						const grad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r * 2.2);
						grad.addColorStop(0, `rgba(${bright[0]},${bright[1]},${bright[2]},0.95)`);
						grad.addColorStop(0.35, `rgba(${bright[0]},${bright[1]},${bright[2]},0.25)`);
						grad.addColorStop(1, `rgba(${bright[0]},${bright[1]},${bright[2]},0)`);
						ctx.fillStyle = grad;
						ctx.fillRect(cx - r * 2.2, cy - r * 2.2, r * 4.4, r * 4.4);
						ctx.fillStyle = `rgb(${bright[0]},${bright[1]},${bright[2]})`;
						ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
					} else {
						const v = 0.3 + rng() * 0.3;
						ctx.fillStyle = `rgba(${bright[0]},${bright[1]},${bright[2]},${v * 0.15})`;
						ctx.fillRect(col * cell, row * cell, cell, cell);
					}
				}
			}
			ctx.fillStyle = "rgba(0,0,0,0.18)";
			for (let y = 0; y < size; y += 2) ctx.fillRect(0, y, size, 1);
		},
	},
	{
		id: "ansi-quilt",
		render(ctx, size, value, _colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const ANSI: [number, number, number][] = [
				[170, 0, 0],
				[0, 170, 0],
				[170, 85, 0],
				[0, 0, 170],
				[170, 0, 170],
				[0, 170, 170],
				[170, 170, 170],
				[85, 85, 85],
				[255, 85, 85],
				[85, 255, 85],
				[255, 255, 85],
				[85, 85, 255],
				[255, 85, 255],
				[85, 255, 255],
				[255, 255, 255],
			];
			const gridN = size <= 32 ? 4 : 8;
			const cell = size / gridN;
			for (let row = 0; row < gridN; row++) {
				for (let col = 0; col < gridN; col++) {
					const idx = Math.floor(rng() * ANSI.length);
					const [r, g, b] = ANSI[idx];
					ctx.fillStyle = `rgb(${r},${g},${b})`;
					ctx.fillRect(col * cell, row * cell, cell, cell);
				}
			}
		},
	},
	{
		id: "teletext-mosaic",
		render(ctx, size, value, _colorScheme) {
			const hash = hashString(value);
			const bits = getBits(hash, 64);
			const CEEFAX: [number, number, number][] = [
				[255, 0, 0],
				[0, 255, 0],
				[255, 255, 0],
				[0, 0, 255],
				[255, 0, 255],
				[0, 255, 255],
				[255, 255, 255],
			];
			ctx.fillStyle = "#000050";
			ctx.fillRect(0, 0, size, size);
			const cols = size <= 32 ? 6 : 10;
			const rows = size <= 32 ? 6 : 9;
			const cw = size / cols;
			const ch = size / rows;
			for (let row = 0; row < rows; row++) {
				for (let col = 0; col < cols; col++) {
					const on = bits[(row * cols + col) % bits.length];
					if (on) {
						const ci = (row * cols + col) % CEEFAX.length;
						const [r, g, b] = CEEFAX[ci];
						const bw = cw / 2;
						const bh = ch / 3;
						ctx.fillStyle = `rgb(${r},${g},${b})`;
						for (let sy = 0; sy < 3; sy++) {
							for (let sx = 0; sx < 2; sx++) {
								const bit = (row * cols + col + sy * 2 + sx) % 2;
								if (bit) ctx.fillRect(col * cw + sx * bw, row * ch + sy * bh, bw - 1, bh - 1);
							}
						}
					}
				}
			}
		},
	},
	{
		id: "matrix-rain",
		render(ctx, size, value, _colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const img = ctx.createImageData(size, size);
			const cols = size <= 32 ? 8 : 16;
			const colW = size / cols;
			const heads: number[] = Array.from({ length: cols }, () => Math.floor(rng() * size));
			for (let x = 0; x < size; x++) {
				const col = Math.floor(x / colW);
				const head = heads[col];
				for (let y = 0; y < size; y++) {
					const dist = (head - y + size) % size;
					let brightness = 0;
					if (dist === 0) brightness = 255;
					else if (dist < size * 0.25) brightness = Math.floor(200 * (1 - dist / (size * 0.25)));
					else brightness = Math.floor(20 * (1 - dist / size));
					setPixel(img, y * size + x, 0, brightness, 0);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "raster-bars",
		render(ctx, size, value, _colorScheme) {
			const hash = hashString(value);
			const hue = deriveHue(hash);
			const rng = mulberry32(hash[0]);
			const offset = rng() * Math.PI * 2;
			const img = ctx.createImageData(size, size);
			for (let y = 0; y < size; y++) {
				const t = y / size;
				const h1 = (hue + Math.sin(t * Math.PI * 4 + offset) * 60) % 360;
				const h2 = (hue + 120 + Math.sin(t * Math.PI * 6 + offset + 1) * 40) % 360;
				const blend = (Math.sin(t * Math.PI * 3 + offset * 0.7) + 1) / 2;
				const bh = (h1 * (1 - blend) + h2 * blend + 360) % 360;
				const l = 40 + Math.sin(t * Math.PI * 8 + offset) * 20;
				const [r, g, b] = hsl(bh, 90, l);
				for (let x = 0; x < size; x++) {
					setPixel(img, y * size + x, r, g, b);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
];
