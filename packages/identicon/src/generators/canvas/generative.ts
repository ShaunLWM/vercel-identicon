import { deriveHue, oklchToRgb, setPixel } from "../../core/color";
import { getColors } from "../../core/color-schemes";
import { hashString, mulberry32 } from "../../core/hash";
import type { CanvasGenerator } from "../../types";

export const generativeGenerators: CanvasGenerator[] = [
	{
		id: "reaction-diffusion",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [c1, c2] = getColors(hash, colorScheme);
			const f = 0.055,
				k = 0.062,
				Da = 1.0,
				Db = 0.5;
			const dt = 1;
			const n = size;
			let A = new Float32Array(n * n).fill(1);
			let B = new Float32Array(n * n).fill(0);
			const spots = 5 + (hash[0] % 5);
			for (let s = 0; s < spots; s++) {
				const sx = Math.floor(rng() * n),
					sy = Math.floor(rng() * n);
				for (let dy = -4; dy <= 4; dy++)
					for (let dx = -4; dx <= 4; dx++) {
						const nx = (sx + dx + n) % n,
							ny = (sy + dy + n) % n;
						B[ny * n + nx] = 1;
					}
			}
			const laplace = (buf: Float32Array, i: number, x: number, y: number): number => {
				const l = buf[y * n + ((x - 1 + n) % n)],
					r = buf[y * n + ((x + 1) % n)];
				const u = buf[((y - 1 + n) % n) * n + x],
					d = buf[((y + 1) % n) * n + x];
				return l + r + u + d - 4 * buf[i];
			};
			for (let iter = 0; iter < 200; iter++) {
				const nA = new Float32Array(n * n),
					nB = new Float32Array(n * n);
				for (let y = 0; y < n; y++)
					for (let x = 0; x < n; x++) {
						const i = y * n + x;
						const a = A[i],
							b = B[i],
							abb = a * b * b;
						nA[i] = Math.max(
							0,
							Math.min(1, a + (Da * laplace(A, i, x, y) - abb + f * (1 - a)) * dt),
						);
						nB[i] = Math.max(
							0,
							Math.min(1, b + (Db * laplace(B, i, x, y) + abb - (k + f) * b) * dt),
						);
					}
				A = nA;
				B = nB;
			}
			const img = ctx.createImageData(n, n);
			for (let i = 0; i < n * n; i++) {
				const t = Math.max(0, Math.min(1, A[i] - B[i]));
				const r = Math.round(c2[0] + (c1[0] - c2[0]) * t);
				const g = Math.round(c2[1] + (c1[1] - c2[1]) * t);
				const b = Math.round(c2[2] + (c1[2] - c2[2]) * t);
				setPixel(img, i, r, g, b);
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "ascii-matrix",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [c1, c2] = getColors(hash, colorScheme);
			ctx.fillStyle = `rgb(${c2[0]},${c2[1]},${c2[2]})`;
			ctx.fillRect(0, 0, size, size);
			const lineH = Math.max(4, Math.floor(size / 24));
			const blockW = Math.max(2, Math.floor(lineH * 0.6));
			ctx.fillStyle = `rgb(${c1[0]},${c1[1]},${c1[2]})`;
			const lines = Math.floor(size / lineH);
			for (let l = 0; l < lines; l++) {
				const indent = Math.floor(rng() * size * 0.3);
				const len = Math.floor(rng() * (size - indent) * 0.8 + size * 0.1);
				const y = l * lineH;
				let x = indent;
				while (x < indent + len && x < size) {
					const charW = blockW + Math.floor(rng() * 2);
					const charH = Math.floor(lineH * 0.7);
					if (rng() > 0.15) ctx.fillRect(x, y + Math.floor((lineH - charH) / 2), charW - 1, charH);
					x += charW + 1;
				}
			}
		},
	},
	{
		id: "barcode",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [c1, c2] = getColors(hash, colorScheme);
			ctx.fillStyle = `rgb(${c2[0]},${c2[1]},${c2[2]})`;
			ctx.fillRect(0, 0, size, size);
			let x = 0,
				toggle = false;
			while (x < size) {
				const w = 1 + rng() * 2.5;
				ctx.fillStyle = toggle
					? `rgb(${c1[0]},${c1[1]},${c1[2]})`
					: `rgb(${c2[0]},${c2[1]},${c2[2]})`;
				ctx.fillRect(Math.round(x), 0, Math.max(1, Math.round(w)), size);
				x += w;
				toggle = !toggle;
			}
		},
	},
	{
		id: "flow-field",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [c1, c2] = getColors(hash, colorScheme);
			ctx.fillStyle = `rgb(${c2[0]},${c2[1]},${c2[2]})`;
			ctx.fillRect(0, 0, size, size);
			const freq = 0.003 + rng() * 0.005;
			const angle = (x: number, y: number) =>
				Math.sin(x * freq + hash[0] * 0.0001) * Math.cos(y * freq + hash[1] * 0.0001) * Math.PI * 4;
			const count = 20 + Math.floor(rng() * 15);
			ctx.strokeStyle = `rgba(${c1[0]},${c1[1]},${c1[2]},0.6)`;
			ctx.lineWidth = Math.max(0.5, size / 200);
			ctx.lineCap = "round";
			for (let p = 0; p < count; p++) {
				let px = rng() * size,
					py = rng() * size;
				ctx.beginPath();
				ctx.moveTo(px, py);
				for (let s = 0; s < 120; s++) {
					const a = angle(px, py);
					px += Math.cos(a) * 2;
					py += Math.sin(a) * 2;
					if (px < 0 || px > size || py < 0 || py > size) break;
					ctx.lineTo(px, py);
				}
				ctx.stroke();
			}
		},
	},
	{
		id: "lissajous",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const [c1, c2] = getColors(hash, colorScheme);
			const a = 1 + (hash[0] % 5),
				b = 1 + (hash[1] % 5);
			const delta = ((hash[0] % 8) * Math.PI) / 8;
			ctx.fillStyle = `rgb(${c2[0]},${c2[1]},${c2[2]})`;
			ctx.fillRect(0, 0, size, size);
			ctx.strokeStyle = `rgb(${c1[0]},${c1[1]},${c1[2]})`;
			ctx.lineWidth = Math.max(1, size / 128);
			ctx.lineJoin = "round";
			const pad = size * 0.1;
			const r = size / 2 - pad;
			ctx.beginPath();
			const steps = 2000;
			for (let i = 0; i <= steps; i++) {
				const t = (i / steps) * Math.PI * 2;
				const x = size / 2 + r * Math.sin(a * t + delta);
				const y = size / 2 + r * Math.sin(b * t);
				if (i === 0) ctx.moveTo(x, y);
				else ctx.lineTo(x, y);
			}
			ctx.stroke();
		},
	},
	{
		id: "topographic-contours",
		render(ctx, size, value, _colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const hue = deriveHue(hash);
			const offsets = Array.from({ length: 3 }, () => rng() * 100);
			const freq = [0.015, 0.03, 0.055];
			const amp = [1.0, 0.5, 0.25];
			const bands = 5;
			const img = ctx.createImageData(size, size);
			for (let py = 0; py < size; py++) {
				for (let px = 0; px < size; px++) {
					let h = 0;
					for (let l = 0; l < 3; l++)
						h +=
							amp[l] * (Math.sin(px * freq[l] + offsets[l]) * Math.cos(py * freq[l] + offsets[l]));
					h = (h / 1.75 + 1) / 2;
					const band = Math.floor(h * bands);
					const t = (band + 0.5) / bands;
					const L = 0.3 + t * 0.5;
					const [r, g, b] = oklchToRgb(L, 0.22, (hue + band * 30) % 360);
					setPixel(img, py * size + px, r, g, b);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
];
