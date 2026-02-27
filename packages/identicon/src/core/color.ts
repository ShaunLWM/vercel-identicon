export function hsl(h: number, s: number, l: number): [number, number, number] {
	s /= 100;
	l /= 100;
	const k = (n: number) => (n + h / 30) % 12;
	const a = s * Math.min(l, 1 - l);
	const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
	return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

export function oklchToRgb(L: number, C: number, H: number): [number, number, number] {
	const hRad = (H * Math.PI) / 180;
	const a = C * Math.cos(hRad);
	const b = C * Math.sin(hRad);
	const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
	const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
	const s_ = L - 0.0894841775 * a - 1.291485548 * b;
	const l = l_ * l_ * l_;
	const m = m_ * m_ * m_;
	const s = s_ * s_ * s_;
	const R = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
	const G = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
	const B = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
	const gamma = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
	return [
		Math.round(Math.max(0, Math.min(1, gamma(R))) * 255),
		Math.round(Math.max(0, Math.min(1, gamma(G))) * 255),
		Math.round(Math.max(0, Math.min(1, gamma(B))) * 255),
	];
}

export function deriveHue(hash: [number, number]): number {
	const bytes: number[] = [];
	for (let i = 0; i < 4; i++) {
		bytes.push((hash[0] >> (i * 8)) & 0xff);
		bytes.push((hash[1] >> (i * 8)) & 0xff);
	}
	return bytes.reduce((a, b) => a + b, 0) % 360;
}

export function setPixel(img: ImageData, i: number, r: number, g: number, b: number): void {
	const p = i * 4;
	img.data[p] = r;
	img.data[p + 1] = g;
	img.data[p + 2] = b;
	img.data[p + 3] = 255;
}
