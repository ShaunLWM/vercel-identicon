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

export const organicDitherGenerators: CanvasGenerator[] = [
	{
		id: "atkinson-blob",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [rgb1, rgb2] = getColors(hash, colorScheme);
			const cx0 = size * (0.2 + rng() * 0.6);
			const cy0 = size * (0.2 + rng() * 0.6);
			const cx1 = size * (0.2 + rng() * 0.6);
			const cy1 = size * (0.2 + rng() * 0.6);
			const gray = new Float32Array(size * size);
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const d0 = Math.hypot(x - cx0, y - cy0) / (size * 0.6);
					const d1 = Math.hypot(x - cx1, y - cy1) / (size * 0.7);
					gray[y * size + x] = Math.max(0, Math.min(1, 1 - Math.min(d0, d1 * 0.8)));
				}
			}
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
		id: "halftone-field",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [rgb1, rgb2] = getColors(hash, colorScheme);
			ctx.fillStyle = `rgb(${rgb2[0]},${rgb2[1]},${rgb2[2]})`;
			ctx.fillRect(0, 0, size, size);
			const gridN = size <= 32 ? 6 : 10;
			const cell = size / gridN;
			const maxR = cell * 0.48;
			const cx0 = rng() * size;
			const cy0 = rng() * size;
			const cx1 = rng() * size;
			const cy1 = rng() * size;
			ctx.fillStyle = `rgb(${rgb1[0]},${rgb1[1]},${rgb1[2]})`;
			for (let row = 0; row < gridN; row++) {
				for (let col = 0; col < gridN; col++) {
					const px = col * cell + cell / 2;
					const py = row * cell + cell / 2;
					const d0 = Math.hypot(px - cx0, py - cy0) / size;
					const d1 = Math.hypot(px - cx1, py - cy1) / size;
					const lum = Math.max(0.1, Math.min(1, 1 - (d0 * 0.6 + d1 * 0.5)));
					const r = maxR * lum;
					ctx.beginPath();
					ctx.arc(px, py, Math.max(0.5, r), 0, Math.PI * 2);
					ctx.fill();
				}
			}
		},
	},
	{
		id: "cross-hatch",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [rgb1, rgb2] = getColors(hash, colorScheme);
			ctx.fillStyle = `rgb(${rgb2[0]},${rgb2[1]},${rgb2[2]})`;
			ctx.fillRect(0, 0, size, size);
			const cx = rng() * size;
			const cy = rng() * size;
			const angle1 = ((hash[0] % 4) * 45 * Math.PI) / 180;
			const angle2 = angle1 + Math.PI / 4;
			const spacing = size <= 32 ? 2.5 : 3;
			ctx.strokeStyle = `rgb(${rgb1[0]},${rgb1[1]},${rgb1[2]})`;
			ctx.lineWidth = size <= 32 ? 0.7 : 1;
			function drawHatch(angle: number, alpha: number) {
				ctx.globalAlpha = alpha;
				const cos = Math.cos(angle);
				const sin = Math.sin(angle);
				for (let off = -size * 1.5; off < size * 2.5; off += spacing) {
					ctx.beginPath();
					let started = false;
					for (let t = -size; t < size * 2; t += 1) {
						const x = cos * t - sin * off;
						const y = sin * t + cos * off;
						if (x < -1 || x > size + 1 || y < -1 || y > size + 1) continue;
						const d = Math.hypot(x - cx, y - cy) / size;
						if (d < 0.7) {
							if (!started) {
								ctx.moveTo(x, y);
								started = true;
							} else {
								ctx.lineTo(x, y);
							}
						}
					}
					if (started) ctx.stroke();
				}
			}
			drawHatch(angle1, 0.9);
			drawHatch(angle2, 0.45);
			ctx.globalAlpha = 1;
		},
	},
	{
		id: "spiral-dither",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [rgb1, rgb2] = getColors(hash, colorScheme);
			const ocx = size * (0.3 + rng() * 0.4);
			const ocy = size * (0.3 + rng() * 0.4);
			const twist = 2 + rng() * 4;
			const img = ctx.createImageData(size, size);
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const dx = x - ocx;
					const dy = y - ocy;
					const dist = Math.hypot(dx, dy) / size;
					const a = Math.atan2(dy, dx);
					const spiral = (((a / (Math.PI * 2) + dist * twist) % 1) + 1) % 1;
					const t = Math.max(0, Math.min(1, 1 - dist * 1.3));
					const pick = t > spiral ? rgb1 : rgb2;
					setPixel(img, y * size + x, pick[0], pick[1], pick[2]);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "blue-noise-dither",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [rgb1, rgb2] = getColors(hash, colorScheme);
			const cx = size * (0.2 + rng() * 0.6);
			const cy = size * (0.2 + rng() * 0.6);
			const angle = rng() * Math.PI * 2;
			const img = ctx.createImageData(size, size);
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const d = Math.hypot(x - cx, y - cy) / (size * 0.7);
					const sweep =
						(x / size - 0.5) * Math.cos(angle) + (y / size - 0.5) * Math.sin(angle) + 0.5;
					const lum = Math.max(0, Math.min(1, (1 - d) * 0.6 + sweep * 0.4));
					const pick = lum > pixelHash(x, y, hash[0]) ? rgb1 : rgb2;
					setPixel(img, y * size + x, pick[0], pick[1], pick[2]);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
];
