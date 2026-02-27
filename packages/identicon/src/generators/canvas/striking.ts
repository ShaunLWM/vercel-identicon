import { deriveHue, hsl, setPixel } from "../../core/color";
import { getColors } from "../../core/color-schemes";
import { hashString, mulberry32 } from "../../core/hash";
import type { CanvasGenerator } from "../../types";

export const strikingGenerators: CanvasGenerator[] = [
	{
		id: "chromatic-aberration",
		render(ctx, size, value, _colorScheme) {
			const hash = hashString(value);
			const _rng = mulberry32(hash[0]);
			const shapeType = hash[0] % 3;
			const cx = size / 2;
			const cy = size / 2;
			const r = size * 0.35;
			const offsets: [number, number][] = [
				[-3, -1],
				[0, 2],
				[3, -1],
			];
			const channels: [number, number, number][] = [
				[255, 0, 0],
				[0, 255, 0],
				[0, 0, 255],
			];
			ctx.fillStyle = "#0a0a0f";
			ctx.fillRect(0, 0, size, size);
			ctx.globalCompositeOperation = "screen";
			for (let c = 0; c < 3; c++) {
				const [dx, dy] = offsets[c];
				const [cr, cg, cb] = channels[c];
				ctx.save();
				ctx.translate(dx, dy);
				ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
				ctx.beginPath();
				if (shapeType === 0) {
					ctx.arc(cx, cy, r, 0, Math.PI * 2);
				} else if (shapeType === 1) {
					ctx.moveTo(cx, cy - r);
					ctx.lineTo(cx + r * Math.cos(Math.PI / 6), cy + r * 0.5);
					ctx.lineTo(cx - r * Math.cos(Math.PI / 6), cy + r * 0.5);
					ctx.closePath();
				} else {
					const rr = r * 0.2;
					ctx.roundRect(cx - r, cy - r, r * 2, r * 2, rr);
				}
				ctx.fill();
				ctx.restore();
			}
			ctx.globalCompositeOperation = "source-over";
		},
	},
	{
		id: "voronoi-glass",
		render(ctx, size, value, _colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const PALETTE: [number, number, number][] = [
				[255, 50, 80],
				[50, 200, 255],
				[255, 200, 0],
				[120, 255, 80],
				[200, 80, 255],
				[255, 120, 40],
				[0, 220, 180],
				[255, 40, 200],
			];
			const numSeeds = 8;
			const seeds: [number, number, number][] = Array.from({ length: numSeeds }, (_, i) => [
				rng() * size,
				rng() * size,
				i % PALETTE.length,
			]);
			const img = ctx.createImageData(size, size);
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					let minD = Infinity;
					let minI = 0;
					let secondD = Infinity;
					for (let s = 0; s < seeds.length; s++) {
						const dx = x - seeds[s][0];
						const dy = y - seeds[s][1];
						const d = dx * dx + dy * dy;
						if (d < minD) {
							secondD = minD;
							minD = d;
							minI = s;
						} else if (d < secondD) secondD = d;
					}
					const border = Math.sqrt(secondD) - Math.sqrt(minD) < 2;
					if (border) {
						setPixel(img, y * size + x, 10, 10, 15);
					} else {
						const [r, g, b] = PALETTE[seeds[minI][2]];
						setPixel(img, y * size + x, r, g, b);
					}
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "supershape",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [c1, c2] = getColors(hash, colorScheme);
			const m = 2 + (hash[0] % 7);
			const n1 = 0.3 + rng() * 4;
			const n2 = 0.3 + rng() * 4;
			const n3 = 0.3 + rng() * 4;
			const a = 1,
				b = 1;
			const img = ctx.createImageData(size, size);
			const scale = size * 0.45;
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const px = (x - size / 2) / scale;
					const py = (y - size / 2) / scale;
					const phi = Math.atan2(py, px);
					const t1 = Math.abs(Math.cos((m * phi) / 4) / a);
					const t2 = Math.abs(Math.sin((m * phi) / 4) / b);
					const r = (t1 ** n2 + t2 ** n3) ** (-1 / n1);
					const pd = Math.sqrt(px * px + py * py);
					const inside = pd <= r;
					const [r0, g0, b0] = inside ? c1 : c2;
					setPixel(img, y * size + x, r0, g0, b0);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "plasma",
		render(ctx, size, value, _colorScheme) {
			const hash = hashString(value);
			const hue = deriveHue(hash);
			const rng = mulberry32(hash[0]);
			const f1 = 1 + rng() * 3;
			const f2 = 1 + rng() * 3;
			const f3 = 1 + rng() * 3;
			const f4 = 1 + rng() * 3;
			const img = ctx.createImageData(size, size);
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const nx = x / size,
						ny = y / size;
					const v =
						Math.sin(nx * f1 * Math.PI * 2) +
						Math.sin(ny * f2 * Math.PI * 2) +
						Math.sin((nx + ny) * f3 * Math.PI) +
						Math.sin(Math.sqrt(nx * nx + ny * ny) * f4 * Math.PI * 2);
					const t = (v + 4) / 8;
					const h = (hue + t * 180) % 360;
					const l = 40 + t * 30;
					const [r, g, b] = hsl(h, 90, l);
					setPixel(img, y * size + x, r, g, b);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "op-art",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [c1, c2] = getColors(hash, colorScheme);
			const cx = size / 2 + (rng() - 0.5) * size * 0.15;
			const cy = size / 2 + (rng() - 0.5) * size * 0.15;
			const freq = 4 + (hash[0] % 5);
			const img = ctx.createImageData(size, size);
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const dx = x - cx,
						dy = y - cy;
					const d = Math.sqrt(dx * dx + dy * dy);
					const wave = Math.sin((d * freq * Math.PI) / size);
					const pick = wave > 0;
					const [r, g, b] = pick ? c1 : c2;
					setPixel(img, y * size + x, r, g, b);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "kaleidoscope",
		render(ctx, size, value, _colorScheme) {
			const hash = hashString(value);
			const hue = deriveHue(hash);
			const rng = mulberry32(hash[0]);
			const folds = [4, 6, 8][hash[0] % 3];
			const img = ctx.createImageData(size, size);
			const cx = size / 2,
				cy = size / 2;
			const offset = rng() * Math.PI;
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const dx = x - cx,
						dy = y - cy;
					let phi = (Math.atan2(dy, dx) + offset + Math.PI * 2) % (Math.PI * 2);
					const sector = (Math.PI * 2) / folds;
					phi = phi % sector;
					if (phi > sector / 2) phi = sector - phi;
					const r = Math.sqrt(dx * dx + dy * dy);
					const t = r / (size * 0.5);
					const h = (hue + phi * (180 / Math.PI) * (360 / sector) * 0.5) % 360;
					const l = 35 + Math.sin(t * Math.PI * 3 + phi * folds) * 20;
					const [pr, pg, pb] = hsl(h, 85, l);
					setPixel(img, y * size + x, pr, pg, pb);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "gradient-bands",
		render(ctx, size, value, _colorScheme) {
			const hash = hashString(value);
			const hue = deriveHue(hash);
			const rng = mulberry32(hash[0]);
			const angle = rng() * Math.PI * 2;
			const numBands = 4 + (hash[0] % 2);
			const palette: [number, number, number][] = Array.from({ length: numBands }, (_, i) => {
				const h = (hue + i * (360 / numBands)) % 360;
				return hsl(h, 85, 40 + i * (20 / numBands));
			});
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
					const band = Math.min(numBands - 1, Math.floor(t * numBands));
					const [r, g, b] = palette[band];
					setPixel(img, y * size + x, r, g, b);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "interference",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [c1, c2] = getColors(hash, colorScheme);
			const cx1 = size * (0.25 + rng() * 0.2);
			const cy1 = size * (0.25 + rng() * 0.2);
			const cx2 = size * (0.55 + rng() * 0.2);
			const cy2 = size * (0.55 + rng() * 0.2);
			const freq = 5 + rng() * 5;
			const img = ctx.createImageData(size, size);
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const d1 = Math.sqrt((x - cx1) ** 2 + (y - cy1) ** 2);
					const d2 = Math.sqrt((x - cx2) ** 2 + (y - cy2) ** 2);
					const w1 = Math.sin((d1 * freq * Math.PI) / size);
					const w2 = Math.sin((d2 * freq * Math.PI) / size);
					const combined = (w1 + w2 + 2) / 4;
					const [r1, g1, b1] = c1;
					const [r2, g2, b2] = c2;
					const r = Math.round(r1 * combined + r2 * (1 - combined));
					const g = Math.round(g1 * combined + g2 * (1 - combined));
					const b = Math.round(b1 * combined + b2 * (1 - combined));
					setPixel(img, y * size + x, r, g, b);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
];
