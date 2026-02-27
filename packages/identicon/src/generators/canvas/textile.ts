import { setPixel } from "../../core/color";
import { getColors } from "../../core/color-schemes";
import { getBits, hashString, mulberry32 } from "../../core/hash";
import type { CanvasGenerator } from "../../types";

export const textileGenerators: CanvasGenerator[] = [
	{
		id: "quilt-block",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const [c1, c2] = getColors(hash, colorScheme);
			const bits = getBits(hash, 64);
			const grid = 8;
			const cs = size / grid;
			const img = ctx.createImageData(size, size);
			for (let row = 0; row < grid; row++) {
				for (let col = 0; col < grid; col++) {
					const bit = bits[(row * grid + col) % 64];
					for (let ly = 0; ly < cs; ly++) {
						for (let lx = 0; lx < cs; lx++) {
							const py = Math.floor(row * cs + ly),
								px = Math.floor(col * cs + lx);
							if (py >= size || px >= size) continue;
							const inTri = bit === 0 ? lx >= ly : lx + ly <= cs;
							const [r, g, b] = inTri ? c1 : c2;
							setPixel(img, py * size + px, r, g, b);
						}
					}
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "sashiko-stitch",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const [c1, c2] = getColors(hash, colorScheme);
			const pattern = hash[0] % 3;
			ctx.fillStyle = `rgb(${c2[0]},${c2[1]},${c2[2]})`;
			ctx.fillRect(0, 0, size, size);
			ctx.strokeStyle = `rgb(${c1[0]},${c1[1]},${c1[2]})`;
			ctx.lineWidth = Math.max(1, size / 96);
			const dash = Math.max(2, size / 32);
			ctx.setLineDash([dash, dash * 0.5]);
			const sp = Math.floor(size / 10);
			if (pattern === 0) {
				// asanoha: diagonal grid
				for (let i = -size; i < size * 2; i += sp) {
					ctx.beginPath();
					ctx.moveTo(i, 0);
					ctx.lineTo(i + size, size);
					ctx.stroke();
					ctx.beginPath();
					ctx.moveTo(i, 0);
					ctx.lineTo(i - size, size);
					ctx.stroke();
				}
			} else if (pattern === 1) {
				// seigaiha: overlapping arcs
				const r = sp;
				for (let row = 0; row * r < size + r; row++) {
					for (let col = -1; col * r < size + r; col++) {
						const x = col * r * 2 + (row % 2 ? r : 0),
							y = row * r;
						ctx.beginPath();
						ctx.arc(x, y, r, Math.PI, 0);
						ctx.stroke();
					}
				}
			} else {
				// yabane: chevrons
				for (let row = 0; row * sp < size + sp; row++) {
					ctx.beginPath();
					for (let x = 0; x <= size; x += sp) {
						const y = row * sp + (x % (sp * 2) < sp ? x % sp : sp - (x % sp));
						if (x === 0) ctx.moveTo(x, y);
						else ctx.lineTo(x, y);
					}
					ctx.stroke();
				}
			}
			ctx.setLineDash([]);
		},
	},
	{
		id: "woven-fabric",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const [c1, c2] = getColors(hash, colorScheme);
			const bits = getBits(hash, 64);
			const grid = 16;
			const cs = size / grid;
			const gap = Math.max(0.5, cs * 0.08);
			const img = ctx.createImageData(size, size);
			for (let row = 0; row < grid; row++) {
				for (let col = 0; col < grid; col++) {
					const over = bits[(row + col) % 64] === (row + col) % 2;
					for (let ly = 0; ly < cs; ly++) {
						for (let lx = 0; lx < cs; lx++) {
							const py = Math.floor(row * cs + ly),
								px = Math.floor(col * cs + lx);
							if (py >= size || px >= size) continue;
							const isGap = ly < gap || lx < gap;
							const [r, g, b] = isGap ? [20, 20, 20] : over ? c1 : c2;
							setPixel(img, py * size + px, r, g, b);
						}
					}
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "kintsugi-crack",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [c1, c2] = getColors(hash, colorScheme);
			ctx.fillStyle = `rgb(${c2[0]},${c2[1]},${c2[2]})`;
			ctx.fillRect(0, 0, size, size);
			const impactX = size * (0.3 + rng() * 0.4),
				impactY = size * (0.3 + rng() * 0.4);
			const cracks = 4 + (hash[0] % 4);
			ctx.strokeStyle = `rgb(${c1[0]},${c1[1]},${c1[2]})`;
			ctx.lineCap = "round";
			for (let c = 0; c < cracks; c++) {
				const baseAngle = (c / cracks) * Math.PI * 2 + rng() * 0.5;
				const len = size * (0.25 + rng() * 0.4);
				ctx.lineWidth = Math.max(1, (size / 80) * (1 - c * 0.1));
				ctx.beginPath();
				let x = impactX,
					y = impactY;
				ctx.moveTo(x, y);
				let angle = baseAngle;
				const steps = 8 + Math.floor(rng() * 6);
				for (let s = 0; s < steps; s++) {
					angle += (rng() - 0.5) * 0.5;
					const stepLen = (len / steps) * (0.6 + rng() * 0.8);
					x += Math.cos(angle) * stepLen;
					y += Math.sin(angle) * stepLen;
					ctx.lineTo(x, y);
					if (rng() < 0.3) {
						ctx.stroke();
						ctx.beginPath();
						ctx.moveTo(x, y);
						const branchAngle = angle + (rng() > 0.5 ? 0.5 : -0.5) * (0.4 + rng() * 0.4);
						const branchLen = stepLen * (0.3 + rng() * 0.4);
						ctx.lineWidth = Math.max(0.5, ctx.lineWidth * 0.6);
						ctx.lineTo(
							x + Math.cos(branchAngle) * branchLen,
							y + Math.sin(branchAngle) * branchLen,
						);
						ctx.stroke();
						ctx.lineWidth = Math.max(1, (size / 80) * (1 - c * 0.1));
						ctx.beginPath();
						ctx.moveTo(x, y);
					}
				}
				ctx.stroke();
			}
		},
	},
	{
		id: "ikat-bleed",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [c1, c2] = getColors(hash, colorScheme);
			const stripes = 6 + (hash[0] % 6);
			const sw = size / stripes;
			const img = ctx.createImageData(size, size);
			const noise = Array.from({ length: size * size }, () => rng() - 0.5);
			for (let py = 0; py < size; py++) {
				for (let px = 0; px < size; px++) {
					const noiseVal = noise[py * size + px] * sw * 0.6;
					const pos = (px + noiseVal + size * 10) % size;
					const stripe = Math.floor(pos / sw);
					const [r, g, b] = stripe % 2 === 0 ? c1 : c2;
					setPixel(img, py * size + px, r, g, b);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "tartan",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [c1, c2] = getColors(hash, colorScheme);
			const bandCount = 4 + (hash[0] % 4);
			const bandWidths = Array.from({ length: bandCount }, () =>
				Math.floor((size / bandCount) * (0.5 + rng())),
			);
			const total = bandWidths.reduce((a, b) => a + b, 0);
			const scale = size / total;
			const scaled = bandWidths.map((w) => Math.floor(w * scale));
			const bandMap = new Uint8Array(size);
			let x = 0;
			for (let i = 0; i < scaled.length; i++) {
				for (let j = 0; j < scaled[i] && x < size; j++, x++) bandMap[x] = i % 2;
			}
			for (; x < size; x++) bandMap[x] = (bandCount - 1) % 2;
			const img = ctx.createImageData(size, size);
			for (let py = 0; py < size; py++) {
				for (let px = 0; px < size; px++) {
					const xb = bandMap[px],
						yb = bandMap[py];
					const on = (xb ^ yb) === 0;
					const [r, g, b] = on ? c1 : c2;
					setPixel(img, py * size + px, r, g, b);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "clifford-attractor",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const [c1, c2] = getColors(hash, colorScheme);
			const a = -2 + ((hash[0] & 0xff) / 255) * 4;
			const b = -2 + (((hash[0] >> 8) & 0xff) / 255) * 4;
			const c = -2 + ((hash[1] & 0xff) / 255) * 4;
			const d = -2 + (((hash[1] >> 8) & 0xff) / 255) * 4;
			const density = new Float32Array(size * size);
			let px = 0,
				py = 0,
				maxD = 0;
			for (let i = 0; i < 200000; i++) {
				const nx = Math.sin(a * py) + c * Math.cos(a * px);
				const ny = Math.sin(b * px) + d * Math.cos(b * py);
				px = nx;
				py = ny;
				if (i > 100) {
					const ix = Math.floor(((px + 3) / 6) * size);
					const iy = Math.floor(((py + 3) / 6) * size);
					if (ix >= 0 && ix < size && iy >= 0 && iy < size) {
						density[iy * size + ix]++;
						if (density[iy * size + ix] > maxD) maxD = density[iy * size + ix];
					}
				}
			}
			const img = ctx.createImageData(size, size);
			for (let i = 0; i < size * size; i++) {
				const t = density[i] > 0 ? Math.log(density[i] + 1) / Math.log(maxD + 1) : 0;
				const r = Math.round(c2[0] + (c1[0] - c2[0]) * t);
				const g = Math.round(c2[1] + (c1[1] - c2[1]) * t);
				const b = Math.round(c2[2] + (c1[2] - c2[2]) * t);
				setPixel(img, i, r, g, b);
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "hilbert-curve",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const bits = getBits(hash, 64);
			const [c1, c2] = getColors(hash, colorScheme);
			const order = hash[0] % 2 === 0 ? 4 : 5;
			const n = 1 << order;
			const toXY = (idx: number): [number, number] => {
				let rx: number,
					ry: number,
					s = 1,
					x = 0,
					y = 0,
					t = idx;
				while (s < n) {
					rx = (t >> 1) & 1;
					ry = (t ^ rx) & 1;
					if (ry === 0) {
						if (rx === 1) {
							x = s - 1 - x;
							y = s - 1 - y;
						}
						const tmp = x;
						x = y;
						y = tmp;
					}
					x += s * rx;
					y += s * ry;
					t >>= 2;
					s <<= 1;
				}
				return [x, y];
			};
			const cs = size / n;
			const img = ctx.createImageData(size, size);
			for (let idx = 0; idx < n * n; idx++) {
				const bit = bits[idx % 64];
				const [gx, gy] = toXY(idx);
				for (let ly = 0; ly < cs; ly++) {
					for (let lx = 0; lx < cs; lx++) {
						const py = Math.floor(gy * cs + ly),
							px = Math.floor(gx * cs + lx);
						if (py < size && px < size) {
							const [r, g, b] = bit ? c1 : c2;
							setPixel(img, py * size + px, r, g, b);
						}
					}
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "spiral-galaxy",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [c1, c2] = getColors(hash, colorScheme);
			const arms = 2 + (hash[0] % 3);
			const twist = 2 + rng() * 3;
			const img = ctx.createImageData(size, size);
			const cx = size / 2,
				cy = size / 2;
			for (let py = 0; py < size; py++) {
				for (let px = 0; px < size; px++) {
					const dx = px - cx,
						dy = py - cy;
					const dist = Math.sqrt(dx * dx + dy * dy) / (size * 0.5);
					const angle = Math.atan2(dy, dx);
					let minDist = Infinity;
					for (let a = 0; a < arms; a++) {
						const armAngle = (a / arms) * Math.PI * 2 + dist * twist;
						const diff =
							((((angle - armAngle) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
						minDist = Math.min(minDist, Math.abs(diff));
					}
					const onArm = minDist < 0.3 + (1 - dist) * 0.4 || dist < 0.1;
					const [r, g, b] = onArm ? c1 : c2;
					setPixel(img, py * size + px, r, g, b);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "sound-ring",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [c1, c2] = getColors(hash, colorScheme);
			const samples = 64;
			const amps = Array.from({ length: samples }, () => rng());
			const innerR = size * 0.2,
				outerR = size * 0.42;
			const img = ctx.createImageData(size, size);
			const cx = size / 2,
				cy = size / 2;
			for (let py = 0; py < size; py++) {
				for (let px = 0; px < size; px++) {
					const dx = px - cx,
						dy = py - cy;
					const dist = Math.sqrt(dx * dx + dy * dy);
					const angle = ((Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2);
					const sampleIdx = Math.floor(angle * samples) % samples;
					const amp = amps[sampleIdx] * (outerR - innerR);
					const inRing = dist >= innerR && dist <= outerR + amp;
					const [r, g, b] = inRing ? c1 : c2;
					setPixel(img, py * size + px, r, g, b);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "erosion-canyon",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [c1, c2] = getColors(hash, colorScheme);
			const freq = [0.015, 0.03, 0.06];
			const amps = [0.35, 0.15, 0.07];
			const phases = Array.from({ length: 3 }, () => rng() * Math.PI * 2);
			const widthFreq = 0.02 + rng() * 0.02;
			const widthPhase = rng() * Math.PI * 2;
			const img = ctx.createImageData(size, size);
			for (let py = 0; py < size; py++) {
				const centerX =
					size / 2 +
					size *
						(amps[0] * Math.sin(py * freq[0] + phases[0]) +
							amps[1] * Math.sin(py * freq[1] + phases[1]) +
							amps[2] * Math.sin(py * freq[2] + phases[2]));
				const halfW = size * (0.05 + 0.08 * (0.5 + 0.5 * Math.sin(py * widthFreq + widthPhase)));
				for (let px = 0; px < size; px++) {
					const inCanyon = Math.abs(px - centerX) < halfW;
					const [r, g, b] = inCanyon ? c2 : c1;
					setPixel(img, py * size + px, r, g, b);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
];
