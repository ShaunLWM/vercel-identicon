import { deriveHue, oklchToRgb, setPixel } from "../../core/color";
import { getColors } from "../../core/color-schemes";
import { getBits, hashString, mulberry32 } from "../../core/hash";
import type { CanvasGenerator } from "../../types";

export const algorithmicGenerators: CanvasGenerator[] = [
	{
		id: "game-of-life",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [c1, c2] = getColors(hash, colorScheme);
			const cols = 40,
				rows = 40;
			let grid = Array.from({ length: rows }, () =>
				Array.from({ length: cols }, () => (rng() < 0.35 ? 1 : 0)),
			);
			const next = (g: number[][]): number[][] =>
				g.map((row, y) =>
					row.map((cell, x) => {
						let n = 0;
						for (let dy = -1; dy <= 1; dy++)
							for (let dx = -1; dx <= 1; dx++)
								if (dy !== 0 || dx !== 0) n += g[(y + dy + rows) % rows][(x + dx + cols) % cols];
						return n === 3 || (cell === 1 && n === 2) ? 1 : 0;
					}),
				);
			for (let i = 0; i < 8; i++) grid = next(grid);
			const cw = size / cols,
				ch = size / rows;
			const img = ctx.createImageData(size, size);
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const cell = grid[Math.floor(y / ch)][Math.floor(x / cw)];
					const [r, g, b] = cell ? c1 : c2;
					setPixel(img, y * size + x, r, g, b);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "maze",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [c1, c2] = getColors(hash, colorScheme);
			const cs = hash[0] % 2 === 0 ? 3 : 2;
			const cols = Math.floor(size / cs),
				rows = Math.floor(size / cs);
			const hWalls = Array.from({ length: rows + 1 }, () => new Uint8Array(cols).fill(1));
			const vWalls = Array.from({ length: rows }, () => new Uint8Array(cols + 1).fill(1));
			const visited = Array.from({ length: rows }, () => new Uint8Array(cols));
			const stack: [number, number][] = [[0, 0]];
			visited[0][0] = 1;
			while (stack.length) {
				const [cy, cx] = stack[stack.length - 1];
				const dirs = [
					[0, 1],
					[0, -1],
					[1, 0],
					[-1, 0],
				].filter(([dy, dx]) => {
					const ny = cy + dy,
						nx = cx + dx;
					return ny >= 0 && ny < rows && nx >= 0 && nx < cols && !visited[ny][nx];
				});
				if (!dirs.length) {
					stack.pop();
					continue;
				}
				const [dy, dx] = dirs[Math.floor(rng() * dirs.length)];
				const ny = cy + dy,
					nx = cx + dx;
				if (dy === 0) vWalls[cy][cx + (dx > 0 ? 1 : 0)] = 0;
				else hWalls[cy + (dy > 0 ? 1 : 0)][cx] = 0;
				visited[ny][nx] = 1;
				stack.push([ny, nx]);
			}
			const img = ctx.createImageData(size, size);
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const row = Math.floor(y / cs),
						col = Math.floor(x / cs);
					const ly = y % cs,
						lx = x % cs;
					const isWall =
						(ly === 0 && hWalls[Math.min(row, rows)][Math.min(col, cols - 1)]) ||
						(lx === 0 && vWalls[Math.min(row, rows - 1)][Math.min(col, cols)]);
					const [r, g, b] = isWall ? c2 : c1;
					setPixel(img, y * size + x, r, g, b);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "pixel-sprite",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [c1, c2] = getColors(hash, colorScheme);
			const grid = hash[0] % 2 === 0 ? 8 : 10;
			const half = Math.ceil(grid / 2);
			const cells: number[][] = Array.from({ length: grid }, () => Array(grid).fill(0));
			for (let y = 0; y < grid; y++)
				for (let x = 0; x < half; x++) {
					const on = rng() < 0.45 ? 1 : 0;
					cells[y][x] = on;
					cells[y][grid - 1 - x] = on;
				}
			const cw = size / grid,
				ch = size / grid;
			const img = ctx.createImageData(size, size);
			for (let py = 0; py < size; py++) {
				for (let px = 0; px < size; px++) {
					const cell = cells[Math.floor(py / ch)][Math.floor(px / cw)];
					const [r, g, b] = cell ? c1 : c2;
					setPixel(img, py * size + px, r, g, b);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "demoscene-fire",
		render(ctx, size, value, _colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const hue = deriveHue(hash);
			const w = size,
				h = size;
			const buf = new Float32Array(w * h);
			for (let x = 0; x < w; x++) {
				buf[(h - 1) * w + x] = 0.8 + rng() * 0.2;
				buf[(h - 2) * w + x] = 0.6 + rng() * 0.4;
			}
			for (let y = h - 3; y >= 0; y--) {
				for (let x = 0; x < w; x++) {
					const below = buf[(y + 1) * w + x];
					const bl = buf[(y + 1) * w + ((x - 1 + w) % w)];
					const br = buf[(y + 1) * w + ((x + 1) % w)];
					const bb = buf[Math.min(y + 2, h - 1) * w + x];
					buf[y * w + x] = Math.max(0, (below + bl + br + bb) / 4 - 0.015);
				}
			}
			const img = ctx.createImageData(w, h);
			for (let i = 0; i < w * h; i++) {
				const t = buf[i];
				let r: number, g: number, b: number;
				if (t < 0.5) {
					const [r2, g2, b2] = oklchToRgb(0.4 + t * 0.6, 0.3, hue);
					r = Math.round(r2 * t * 2);
					g = Math.round(g2 * t * 2);
					b = Math.round(b2 * t * 2);
				} else {
					const tt = (t - 0.5) * 2;
					const [r2, g2, b2] = oklchToRgb(0.7 + tt * 0.3, 0.3 * (1 - tt), hue);
					r = Math.round(r2 * (1 - tt) + 255 * tt);
					g = Math.round(g2 * (1 - tt) + 255 * tt);
					b = Math.round(b2 * (1 - tt) + 255 * tt);
				}
				setPixel(img, i, r, g, b);
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "sierpinski",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [c1, c2] = getColors(hash, colorScheme);
			const img = ctx.createImageData(size, size);
			const [r2, g2, b2] = c2;
			for (let i = 0; i < size * size; i++) setPixel(img, i, r2, g2, b2);
			const vx = [size * 0.5, 0, size - 1];
			const vy = [0, size - 1, size - 1];
			let px = rng() * size,
				py = rng() * size;
			for (let i = 0; i < 50000; i++) {
				const v = Math.floor(rng() * 3);
				px = (px + vx[v]) / 2;
				py = (py + vy[v]) / 2;
				if (i > 20) {
					const ix = Math.round(px),
						iy = Math.round(py);
					if (ix >= 0 && ix < size && iy >= 0 && iy < size)
						setPixel(img, iy * size + ix, c1[0], c1[1], c1[2]);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "mandelbrot-slice",
		render(ctx, size, value, _colorScheme) {
			const hash = hashString(value);
			const hue = deriveHue(hash);
			const cx = -0.5 + ((hash[0] % 1000) / 1000 - 0.5) * 1.5;
			const cy = ((hash[1] % 1000) / 1000 - 0.5) * 1.2;
			const zoom = 0.5 + ((hash[0] % 500) / 500) * 2;
			const img = ctx.createImageData(size, size);
			for (let py = 0; py < size; py++) {
				for (let px = 0; px < size; px++) {
					const x0 = cx + ((px / size - 0.5) * 3) / zoom;
					const y0 = cy + ((py / size - 0.5) * 3) / zoom;
					let x = 0,
						y = 0,
						iter = 0;
					while (x * x + y * y <= 4 && iter < 32) {
						const xt = x * x - y * y + x0;
						y = 2 * x * y + y0;
						x = xt;
						iter++;
					}
					const t = iter / 32;
					const [r, g, b] = oklchToRgb(0.3 + t * 0.6, 0.25, (hue + t * 180) % 360);
					setPixel(img, py * size + px, r, g, b);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "perlin-terrain",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const rng = mulberry32(hash[0]);
			const [c1, c2] = getColors(hash, colorScheme);
			const offsets = Array.from({ length: 4 }, () => rng() * 1000);
			const freq = [1, 2, 4, 8];
			const amp = [0.5, 0.25, 0.125, 0.0625];
			const img = ctx.createImageData(size, size);
			for (let py = 0; py < size; py++) {
				for (let px = 0; px < size; px++) {
					let h = 0;
					for (let l = 0; l < 4; l++)
						h += amp[l] * Math.sin((px / size) * freq[l] * Math.PI * 2 + offsets[l]);
					h = (h + 1) / 2;
					const ground = (1 - h) * size;
					const [r, g, b] = py > ground ? c2 : c1;
					setPixel(img, py * size + px, r, g, b);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "truchet-tiles",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const [c1, c2] = getColors(hash, colorScheme);
			const bits = getBits(hash, 64);
			const tileSize = Math.floor(size / 8);
			const cols = Math.floor(size / tileSize);
			const rows = Math.floor(size / tileSize);
			const bg = `rgb(${c2[0]},${c2[1]},${c2[2]})`;
			const fg = `rgb(${c1[0]},${c1[1]},${c1[2]})`;
			ctx.fillStyle = bg;
			ctx.fillRect(0, 0, size, size);
			ctx.strokeStyle = fg;
			ctx.lineWidth = Math.max(1, tileSize * 0.18);
			ctx.lineCap = "round";
			for (let row = 0; row < rows; row++) {
				for (let col = 0; col < cols; col++) {
					const bit = bits[(row * cols + col) % 64];
					const x = col * tileSize,
						y = row * tileSize;
					ctx.beginPath();
					if (bit === 0) {
						ctx.arc(x, y, tileSize / 2, 0, Math.PI / 2);
						ctx.moveTo(x + tileSize, y + tileSize / 2);
						ctx.arc(x + tileSize, y + tileSize, tileSize / 2, Math.PI, Math.PI * 1.5);
					} else {
						ctx.arc(x + tileSize, y, tileSize / 2, Math.PI / 2, Math.PI);
						ctx.moveTo(x, y + tileSize / 2);
						ctx.arc(x, y + tileSize, tileSize / 2, Math.PI * 1.5, 0);
					}
					ctx.stroke();
				}
			}
		},
	},
	{
		id: "rule-30",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const [c1, c2] = getColors(hash, colorScheme);
			const img = ctx.createImageData(size, size);
			const mid = Math.floor(size / 2);
			const rowsTop = new Uint8Array(size * mid);
			const rowsBot = new Uint8Array(size * mid);
			const seedTop = new Uint8Array(size);
			const seedBot = new Uint8Array(size);
			seedTop[mid] = 1;
			for (let x = 0; x < size; x++) seedBot[x] = (hash[1] >> (x % 32)) & 1;
			const step = (row: Uint8Array): Uint8Array => {
				const next = new Uint8Array(size);
				for (let x = 0; x < size; x++) {
					const l = row[(x - 1 + size) % size],
						c = row[x],
						r = row[(x + 1) % size];
					next[x] = (l ^ (c | r)) & 1;
				}
				return next;
			};
			let cur = seedTop;
			for (let y = 0; y < mid; y++) {
				rowsTop.set(cur, y * size);
				cur = step(cur);
			}
			cur = seedBot;
			for (let y = 0; y < mid; y++) {
				rowsBot.set(cur, y * size);
				cur = step(cur);
			}
			for (let py = 0; py < size; py++) {
				for (let px = 0; px < size; px++) {
					const bt = py < mid ? rowsTop[py * size + px] : rowsBot[(size - 1 - py) * size + px];
					const bb =
						py < mid ? rowsBot[(mid - 1 - py) * size + px] : rowsTop[(py - mid) * size + px];
					const on = (bt | bb) & 1;
					const [r, g, b] = on ? c1 : c2;
					setPixel(img, py * size + px, r, g, b);
				}
			}
			ctx.putImageData(img, 0, 0);
		},
	},
	{
		id: "dragon-curve",
		render(ctx, size, value, colorScheme) {
			const hash = hashString(value);
			const [c1, c2] = getColors(hash, colorScheme);
			const iters = 12;
			let turns = [1];
			for (let i = 1; i < iters; i++) {
				const mid = [...turns].reverse().map((t) => -t);
				turns = [...turns, 1, ...mid];
			}
			let x = 0,
				y = 0,
				dir = 0;
			const pts: [number, number][] = [[0, 0]];
			const dx = [1, 0, -1, 0],
				dy = [0, 1, 0, -1];
			for (const t of turns) {
				dir = (dir + (t > 0 ? 1 : 3)) % 4;
				x += dx[dir];
				y += dy[dir];
				pts.push([x, y]);
			}
			const xs = pts.map((p) => p[0]),
				ys = pts.map((p) => p[1]);
			const minX = Math.min(...xs),
				maxX = Math.max(...xs);
			const minY = Math.min(...ys),
				maxY = Math.max(...ys);
			const pad = size * 0.1;
			const scaleX = (size - pad * 2) / (maxX - minX || 1);
			const scaleY = (size - pad * 2) / (maxY - minY || 1);
			const sc = Math.min(scaleX, scaleY);
			const offX = pad + (size - pad * 2 - (maxX - minX) * sc) / 2;
			const offY = pad + (size - pad * 2 - (maxY - minY) * sc) / 2;
			ctx.fillStyle = `rgb(${c2[0]},${c2[1]},${c2[2]})`;
			ctx.fillRect(0, 0, size, size);
			ctx.strokeStyle = `rgb(${c1[0]},${c1[1]},${c1[2]})`;
			ctx.lineWidth = Math.max(0.5, size / 256);
			ctx.lineJoin = "round";
			ctx.beginPath();
			for (let i = 0; i < pts.length; i++) {
				const px = (pts[i][0] - minX) * sc + offX;
				const py = (pts[i][1] - minY) * sc + offY;
				if (i === 0) ctx.moveTo(px, py);
				else ctx.lineTo(px, py);
			}
			ctx.stroke();
		},
	},
];
