import { deriveHue, hsl, setPixel } from "../../core/color";
import { getBits, hashString, mulberry32 } from "../../core/hash";
import type { CanvasGenerator } from "../../types";

export const retroGenerators: CanvasGenerator[] = [
	{
		id: "crt-rgb",
		render(ctx, size, value, _colorScheme) {
			const hash = hashString(value);
			const _rng = mulberry32(hash[0]);
			const baseHue = hash[0] % 360;
			const img = ctx.createImageData(size, size);
			for (let y = 0; y < size; y++) {
				const scanDim = y % 2 === 0 ? 1.0 : 0.65;
				for (let x = 0; x < size; x++) {
					const t = x / size;
					const hueShift = t * 180;
					const [r, g, b] = hsl((baseHue + hueShift) % 360, 85, 50);
					const ch = x % 3;
					const pr = ch === 0 ? Math.min(255, r + 60) : Math.max(0, r - 40);
					const pg = ch === 1 ? Math.min(255, g + 60) : Math.max(0, g - 40);
					const pb = ch === 2 ? Math.min(255, b + 60) : Math.max(0, b - 40);
					setPixel(
						img,
						y * size + x,
						Math.round(pr * scanDim),
						Math.round(pg * scanDim),
						Math.round(pb * scanDim),
					);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "vhs-tracking",
		render(ctx, size, value, _colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const hue = deriveHue(hash);
			const img = ctx.createImageData(size, size);
			const bandH = size <= 32 ? 4 : 8;
			for (let y = 0; y < size; y++) {
				const band = Math.floor(y / bandH);
				const rowOffset = Math.floor((rng() - 0.5) * 6);
				const l = 35 + (band % 3) * 10;
				const [br, bg, bb] = hsl((hue + band * 15) % 360, 80, l);
				for (let x = 0; x < size; x++) {
					const sx = (x + rowOffset + size) % size;
					const rSep = sx < size - 2 ? 2 : 0;
					const bSep = sx > 2 ? -2 : 0;
					const ri = Math.min(size - 1, Math.max(0, sx + rSep));
					const bi = Math.min(size - 1, Math.max(0, sx + bSep));
					const noise = (rng() - 0.5) * 20;
					setPixel(
						img,
						y * size + x,
						Math.min(255, Math.max(0, br + noise + (ri !== sx ? 40 : 0))),
						Math.min(255, Math.max(0, bg + noise)),
						Math.min(255, Math.max(0, bb + noise + (bi !== sx ? 40 : 0))),
					);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "interlace",
		render(ctx, size, value, _colorScheme) {
			const hash = hashString(value);
			const hue = deriveHue(hash);
			const img = ctx.createImageData(size, size);
			for (let y = 0; y < size; y++) {
				const field = y % 2;
				const phase = field === 0 ? 0 : Math.PI;
				for (let x = 0; x < size; x++) {
					const t = (x / size + Math.sin((y / size) * Math.PI * 2 + phase) * 0.15 + 1) % 1;
					const h = (hue + t * 60 + phase * (180 / Math.PI)) % 360;
					const l = field === 0 ? 55 : 40;
					const [r, g, b] = hsl(h, 80, l);
					setPixel(img, y * size + x, r, g, b);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "dot-matrix-printer",
		render(ctx, size, value, _colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const hue = deriveHue(hash);
			const [ir, ig, ib] = hsl(hue, 70, 25);
			const [pr, pg, pb] = hsl((hue + 30) % 360, 20, 92);
			ctx.fillStyle = `rgb(${pr},${pg},${pb})`;
			ctx.fillRect(0, 0, size, size);
			const spacing = size <= 32 ? 3 : 5;
			const dotR = spacing * 0.35;
			for (let y = dotR; y < size; y += spacing) {
				for (let x = dotR; x < size; x += spacing) {
					const jx = (rng() - 0.5) * 0.8;
					const jy = (rng() - 0.5) * 0.8;
					const alpha = 0.6 + rng() * 0.4;
					ctx.beginPath();
					ctx.arc(x + jx, y + jy, dotR * (0.7 + rng() * 0.5), 0, Math.PI * 2);
					ctx.fillStyle = `rgba(${ir},${ig},${ib},${alpha})`;
					ctx.fill();
				}
			}
		},
	},
	{
		id: "thermal-print",
		render(ctx, size, value, _colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const img = ctx.createImageData(size, size);
			for (let y = 0; y < size; y++) {
				const t = y / size;
				for (let x = 0; x < size; x++) {
					const noise = (rng() - 0.5) * 30;
					const base = t * 200 + noise;
					const v = Math.min(255, Math.max(0, Math.round(base)));
					const warm = Math.max(0, Math.round(v * 0.85));
					setPixel(img, y * size + x, 245 - v, 235 - warm, 220 - Math.round(v * 1.1));
				}
			}
			ctx.putImageData(img, 0, 0);
			ctx.fillStyle = "rgba(0,0,0,0.08)";
			for (let y = 0; y < size; y += 2) ctx.fillRect(0, y, size, 1);
		},
	},
	{
		id: "lcd-segments",
		render(ctx, size, value, _colorScheme) {
			const hash = hashString(value);
			const bits = getBits(hash, 64);
			const bgColor = "#b8c470";
			const onColor = "#2d3a0e";
			const offColor = "#aab860";
			ctx.fillStyle = bgColor;
			ctx.fillRect(0, 0, size, size);
			const cols = size <= 32 ? 4 : 8;
			const rows = size <= 32 ? 4 : 8;
			const cw = size / cols;
			const ch = size / rows;
			const pad = cw * 0.1;
			for (let row = 0; row < rows; row++) {
				for (let col = 0; col < cols; col++) {
					const on = bits[(row * cols + col) % bits.length];
					ctx.fillStyle = on ? onColor : offColor;
					ctx.fillRect(col * cw + pad, row * ch + pad, cw - pad * 2, ch - pad * 2);
				}
			}
		},
	},
	{
		id: "glitch-bands",
		render(ctx, size, value, _colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const hue = deriveHue(hash);
			const sliceH = size <= 32 ? 2 : 4;
			const numSlices = Math.ceil(size / sliceH);
			const img = ctx.createImageData(size, size);
			for (let si = 0; si < numSlices; si++) {
				rng(); // consume rng slot for deterministic second-pass shifts
				const h = (hue + si * 15) % 360;
				const l = 30 + (si % 4) * 12;
				const [r, g, b] = hsl(h, 85, l);
				for (let dy = 0; dy < sliceH; dy++) {
					const y = si * sliceH + dy;
					if (y >= size) break;
					for (let x = 0; x < size; x++) {
						setPixel(img, y * size + x, r, g, b);
					}
				}
			}
			ctx.putImageData(img, 0, 0);
			for (let si = 0; si < numSlices; si++) {
				if (rng() < 0.3) {
					const shift = Math.floor((rng() - 0.5) * size * 0.25);
					const y = si * sliceH;
					const h = sliceH * (Math.min(numSlices - 1, si + 1) - si);
					const clampedH = Math.min(h, size - y);
					if (Math.abs(shift) > 2 && clampedH > 0) {
						const slice = ctx.getImageData(0, y, size, clampedH);
						ctx.putImageData(slice, shift, y);
						ctx.putImageData(slice, shift - size, y);
					}
				}
			}
		},
	},
	{
		id: "dithered-scanlines",
		render(ctx, size, value, _colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const hue = deriveHue(hash);
			const angle = rng() * Math.PI * 2;
			const BAYER = [
				[0, 8, 2, 10],
				[12, 4, 14, 6],
				[3, 11, 1, 9],
				[15, 7, 13, 5],
			];
			const [r1, g1, b1] = hsl(hue, 90, 55);
			const [r2, g2, b2] = hsl((hue + 180) % 360, 90, 30);
			const img = ctx.createImageData(size, size);
			for (let y = 0; y < size; y++) {
				const scanDim = y % 2 === 0 ? 1.0 : 0.7;
				for (let x = 0; x < size; x++) {
					const t = Math.max(
						0,
						Math.min(
							1,
							(x / size - 0.5) * Math.cos(angle) + (y / size - 0.5) * Math.sin(angle) + 0.5,
						),
					);
					const threshold = BAYER[y % 4][x % 4] / 16;
					const pick = t > threshold;
					const r = Math.round((pick ? r1 : r2) * scanDim);
					const g = Math.round((pick ? g1 : g2) * scanDim);
					const b = Math.round((pick ? b1 : b2) * scanDim);
					setPixel(img, y * size + x, r, g, b);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "woodcut",
		render(ctx, size, value, _colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const hue = deriveHue(hash);
			const [wr, wg, wb] = hsl((hue + 25) % 360, 50, 80);
			const [ir, ig, ib] = hsl(hue, 60, 20);
			ctx.fillStyle = `rgb(${wr},${wg},${wb})`;
			ctx.fillRect(0, 0, size, size);
			const angle = rng() * Math.PI * 0.5 - Math.PI * 0.25;
			const spacing = size <= 32 ? 3 : 5;
			const numLines = Math.ceil((size * 2) / spacing);
			ctx.save();
			ctx.translate(size / 2, size / 2);
			ctx.rotate(angle);
			for (let i = -numLines / 2; i < numLines / 2; i++) {
				const y = i * spacing;
				const t = i / numLines + 0.5;
				const thick = 0.5 + Math.sin(t * Math.PI) * (spacing * 0.5) * (0.5 + rng() * 0.5);
				ctx.beginPath();
				ctx.moveTo(-size, y);
				ctx.lineTo(size, y);
				ctx.lineWidth = thick;
				ctx.strokeStyle = `rgb(${ir},${ig},${ib})`;
				ctx.stroke();
			}
			ctx.restore();
		},
	},
];
