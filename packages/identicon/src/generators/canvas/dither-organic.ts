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
			const cx0 = (0.3 + rng() * 0.4) * size;
			const cy0 = (0.3 + rng() * 0.4) * size;
			const cx1 = (0.3 + rng() * 0.4) * size;
			const cy1 = (0.3 + rng() * 0.4) * size;
			const gray = new Float32Array(size * size);
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const d0 = Math.sqrt((x - cx0) ** 2 + (y - cy0) ** 2) / size;
					const d1 = Math.sqrt((x - cx1) ** 2 + (y - cy1) ** 2) / size;
					gray[y * size + x] = Math.max(0, Math.min(1, 1 - Math.min(d0, d1) * 2));
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
			const angle = rng() * Math.PI * 2;
			const gridSize = Math.max(4, Math.floor(size / 16));
			ctx.fillStyle = `rgb(${rgb2[0]},${rgb2[1]},${rgb2[2]})`;
			ctx.fillRect(0, 0, size, size);
			ctx.fillStyle = `rgb(${rgb1[0]},${rgb1[1]},${rgb1[2]})`;
			for (let gy = 0; gy <= size; gy += gridSize) {
				for (let gx = 0; gx <= size; gx += gridSize) {
					const cx = gx + gridSize / 2;
					const cy = gy + gridSize / 2;
					const t = Math.max(
						0,
						Math.min(
							1,
							(cx / size - 0.5) * Math.cos(angle) + (cy / size - 0.5) * Math.sin(angle) + 0.5,
						),
					);
					const r = t * gridSize * 0.5;
					if (r < 0.5) continue;
					ctx.beginPath();
					ctx.arc(cx, cy, r, 0, Math.PI * 2);
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
			const angle = rng() * Math.PI * 2;
			const spacing = Math.max(2, Math.floor(size / 24));
			ctx.fillStyle = `rgb(${rgb2[0]},${rgb2[1]},${rgb2[2]})`;
			ctx.fillRect(0, 0, size, size);
			ctx.strokeStyle = `rgb(${rgb1[0]},${rgb1[1]},${rgb1[2]})`;
			ctx.lineWidth = 1;
			const angles = [Math.PI / 4, -Math.PI / 4];
			for (const a of angles) {
				const cos = Math.cos(a),
					sin = Math.sin(a);
				for (let i = -size; i < size * 2; i += spacing) {
					const t = Math.max(0, Math.min(1, (i / size - 0.5) * Math.cos(angle) + 0.5));
					if (t < 0.5) continue;
					const px = i * cos - 0 * sin;
					const py = i * sin + 0 * cos;
					ctx.beginPath();
					ctx.moveTo(px - sin * size * 2, py + cos * size * 2);
					ctx.lineTo(px + sin * size * 2, py - cos * size * 2);
					ctx.stroke();
				}
			}
		},
	},
	{
		id: "spiral-dither",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [rgb1, rgb2] = getColors(hash, colorScheme);
			const ocx = (0.3 + rng() * 0.4) * size;
			const ocy = (0.3 + rng() * 0.4) * size;
			const twist = 3 + rng() * 5;
			const img = ctx.createImageData(size, size);
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const dx = (x - ocx) / size;
					const dy = (y - ocy) / size;
					const a = Math.atan2(dy, dx);
					const dist = Math.sqrt(dx * dx + dy * dy);
					const spiral = (((a / (Math.PI * 2) + dist * twist) % 1) + 1) % 1;
					const t = Math.max(0, Math.min(1, 1 - dist * 1.5));
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
			const angle = rng() * Math.PI * 2;
			const ocx = (0.3 + rng() * 0.4) * size;
			const ocy = (0.3 + rng() * 0.4) * size;
			const seed = hash[1];
			const img = ctx.createImageData(size, size);
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const sweep = Math.max(
						0,
						Math.min(
							1,
							(x / size - 0.5) * Math.cos(angle) + (y / size - 0.5) * Math.sin(angle) + 0.5,
						),
					);
					const dx = (x - ocx) / size,
						dy = (y - ocy) / size;
					const radial = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) * 2);
					const t = Math.max(0, Math.min(1, (sweep + radial) / 2));
					const pick = t > pixelHash(x, y, seed) ? rgb1 : rgb2;
					setPixel(img, y * size + x, pick[0], pick[1], pick[2]);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
];
