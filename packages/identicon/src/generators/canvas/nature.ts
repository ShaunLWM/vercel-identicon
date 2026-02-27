import { setPixel } from "../../core/color";
import { getColors } from "../../core/color-schemes";
import { hashString, mulberry32 } from "../../core/hash";
import type { CanvasGenerator } from "../../types";

export const natureGenerators: CanvasGenerator[] = [
	{
		id: "agate-slice",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [c1, c2] = getColors(hash, colorScheme);
			const cx = size / 2,
				cy = size / 2;
			const rings = 5 + (hash[0] % 4);
			const harmonics = Array.from({ length: 4 }, () => ({
				freq: 2 + Math.floor(rng() * 6),
				amp: 0.02 + rng() * 0.08,
				phase: rng() * Math.PI * 2,
			}));
			const img = ctx.createImageData(size, size);
			for (let py = 0; py < size; py++) {
				for (let px = 0; px < size; px++) {
					const dx = px - cx,
						dy = py - cy;
					const baseDist = Math.sqrt(dx * dx + dy * dy) / (size * 0.5);
					const angle = Math.atan2(dy, dx);
					const wobble = harmonics.reduce(
						(s, h) => s + h.amp * Math.sin(h.freq * angle + h.phase),
						0,
					);
					const d = Math.max(0, Math.min(1, baseDist + wobble));
					const ring = Math.floor(d * rings) % 2;
					const [r, g, b] = ring === 0 ? c1 : c2;
					setPixel(img, py * size + px, r, g, b);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "phyllotaxis",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const _rng = mulberry32(hash[0]);
			const [c1, c2] = getColors(hash, colorScheme);
			const golden = 137.508 * (Math.PI / 180);
			const count = 600 + (hash[0] % 400);
			const dotR = Math.max(1, size / 120);
			ctx.fillStyle = `rgb(${c2[0]},${c2[1]},${c2[2]})`;
			ctx.fillRect(0, 0, size, size);
			ctx.fillStyle = `rgb(${c1[0]},${c1[1]},${c1[2]})`;
			const scale = (size * 0.46) / Math.sqrt(count);
			for (let i = 0; i < count; i++) {
				const r = scale * Math.sqrt(i);
				const theta = i * golden;
				const x = size / 2 + r * Math.cos(theta);
				const y = size / 2 + r * Math.sin(theta);
				ctx.beginPath();
				ctx.arc(x, y, dotR, 0, Math.PI * 2);
				ctx.fill();
			}
		},
	},
	{
		id: "cymatics",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const [c1, c2] = getColors(hash, colorScheme);
			const m = 1 + (hash[0] % 5),
				n = 1 + (hash[1] % 5);
			const img = ctx.createImageData(size, size);
			for (let py = 0; py < size; py++) {
				for (let px = 0; px < size; px++) {
					const x = px / size,
						y = py / size;
					const v = Math.cos(m * Math.PI * x) * Math.cos(n * Math.PI * y);
					const on = v > 0;
					const [r, g, b] = on ? c1 : c2;
					setPixel(img, py * size + px, r, g, b);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "fingerprint",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [c1, c2] = getColors(hash, colorScheme);
			const cx = size * (0.4 + rng() * 0.2),
				cy = size * (0.4 + rng() * 0.2);
			const spacing = size / (12 + (hash[0] % 8));
			const twist = 0.3 + rng() * 0.7;
			const img = ctx.createImageData(size, size);
			for (let py = 0; py < size; py++) {
				for (let px = 0; px < size; px++) {
					const dx = px - cx,
						dy = py - cy;
					const dist = Math.sqrt(dx * dx + dy * dy);
					const angle = Math.atan2(dy, dx);
					const v = Math.sin(((dist + angle * twist * 2) * Math.PI * 2) / spacing);
					const on = v > 0;
					const [r, g, b] = on ? c1 : c2;
					setPixel(img, py * size + px, r, g, b);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "tree-rings",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [c1, c2] = getColors(hash, colorScheme);
			const cx = size * (0.35 + rng() * 0.3),
				cy = size * (0.35 + rng() * 0.3);
			const rings = 8 + (hash[0] % 8);
			const harmonics = Array.from({ length: 3 }, () => ({
				freq: 2 + Math.floor(rng() * 4),
				amp: 0.03 + rng() * 0.07,
				phase: rng() * Math.PI * 2,
			}));
			const img = ctx.createImageData(size, size);
			for (let py = 0; py < size; py++) {
				for (let px = 0; px < size; px++) {
					const dx = px - cx,
						dy = py - cy;
					const angle = Math.atan2(dy, dx);
					const baseDist = Math.sqrt(dx * dx + dy * dy) / (size * 0.7);
					const wobble = harmonics.reduce(
						(s, h) => s + h.amp * Math.sin(h.freq * angle + h.phase),
						0,
					);
					const d = Math.max(0, baseDist + wobble);
					const ring = Math.floor(d * rings) % 2;
					const [r, g, b] = ring === 0 ? c1 : c2;
					setPixel(img, py * size + px, r, g, b);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "coral-growth",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [c1, c2] = getColors(hash, colorScheme);
			const grid = new Uint8Array(size * size);
			const cx = Math.floor(size / 2),
				cy = Math.floor(size / 2);
			grid[cy * size + cx] = 1;
			const count = 250 + (hash[0] % 250);
			const dirs = [
				[0, 1],
				[0, -1],
				[1, 0],
				[-1, 0],
			];
			for (let p = 0; p < count; p++) {
				let x = Math.floor(rng() * size),
					y = Math.floor(rng() * size);
				for (let s = 0; s < 2000; s++) {
					const [dx, dy] = dirs[Math.floor(rng() * 4)];
					x = Math.max(0, Math.min(size - 1, x + dx));
					y = Math.max(0, Math.min(size - 1, y + dy));
					let adj = false;
					for (const [ndx, ndy] of dirs) {
						const nx = x + ndx,
							ny = y + ndy;
						if (nx >= 0 && nx < size && ny >= 0 && ny < size && grid[ny * size + nx]) {
							adj = true;
							break;
						}
					}
					if (adj) {
						grid[y * size + x] = 1;
						break;
					}
				}
			}
			const img = ctx.createImageData(size, size);
			for (let i = 0; i < size * size; i++) {
				const [r, g, b] = grid[i] ? c1 : c2;
				setPixel(img, i, r, g, b);
			}
			ctx.putImageData(img, 0, 0);
		},
	},
];
