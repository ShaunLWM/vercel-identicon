import { useCallback, useRef } from "react";
import type { ColorScheme } from "vercel-identicon";
import { Identicon, isAnimatedVariant, renderToCanvas, startAnimation } from "vercel-identicon";

type Category = {
	name: string;
	color: string;
	ids: string[];
};

const CATEGORIES: Category[] = [
	{
		name: "Bayer Dithering",
		color: "#c084fc",
		ids: [
			"bayer-2x2",
			"bayer-4x4",
			"bayer-4x4-hsl-triadic",
			"bayer-4x4-oklch-mono",
			"bayer-4x4-1-5x",
			"bayer-4x4-2x",
			"bayer-8x8",
		],
	},
	{
		name: "Error Diffusion",
		color: "#c084fc",
		ids: ["floyd-steinberg", "atkinson", "jarvis-judice-ninke", "sierra", "stucki"],
	},
	{
		name: "Pattern Dithering",
		color: "#c084fc",
		ids: [
			"white-noise",
			"blue-noise",
			"halftone-dots",
			"diagonal-line",
			"horizontal-line",
			"spiral",
			"radial",
			"checkerboard",
			"cross",
			"diamond",
		],
	},
	{
		name: "Organic Dithering",
		color: "#c084fc",
		ids: ["atkinson-blob", "halftone-field", "cross-hatch", "spiral-dither", "blue-noise-dither"],
	},
	{
		name: "Terminal",
		color: "#4ade80",
		ids: ["phosphor-grid", "ansi-quilt", "teletext-mosaic", "matrix-rain", "raster-bars"],
	},
	{
		name: "Retro",
		color: "#4ade80",
		ids: [
			"crt-rgb",
			"vhs-tracking",
			"interlace",
			"dot-matrix-printer",
			"thermal-print",
			"lcd-segments",
			"glitch-bands",
			"dithered-scanlines",
			"woodcut",
		],
	},
	{
		name: "Visually Striking",
		color: "#fb7185",
		ids: [
			"chromatic-aberration",
			"voronoi-glass",
			"supershape",
			"plasma",
			"op-art",
			"kaleidoscope",
			"gradient-bands",
			"interference",
		],
	},
	{
		name: "Algorithmic",
		color: "#4ade80",
		ids: [
			"game-of-life",
			"maze",
			"pixel-sprite",
			"demoscene-fire",
			"sierpinski",
			"mandelbrot-slice",
			"perlin-terrain",
			"truchet-tiles",
			"rule-30",
			"dragon-curve",
		],
	},
	{
		name: "Generative",
		color: "#2dd4bf",
		ids: [
			"reaction-diffusion",
			"ascii-matrix",
			"barcode",
			"flow-field",
			"lissajous",
			"topographic-contours",
		],
	},
	{
		name: "Nature & Science",
		color: "#2dd4bf",
		ids: ["agate-slice", "phyllotaxis", "cymatics", "fingerprint", "tree-rings", "coral-growth"],
	},
	{
		name: "Textile & Craft",
		color: "#2dd4bf",
		ids: [
			"quilt-block",
			"sashiko-stitch",
			"woven-fabric",
			"kintsugi-crack",
			"ikat-bleed",
			"tartan",
		],
	},
	{
		name: "Math & Generative Art",
		color: "#2dd4bf",
		ids: ["clifford-attractor", "hilbert-curve", "spiral-galaxy", "sound-ring", "erosion-canyon"],
	},
	{
		name: "WebGL \u2014 Scenes",
		color: "#fb7185",
		ids: [
			"aurora-bands",
			"layered-ridges",
			"ink-drop",
			"bokeh",
			"silk-fold",
			"prism-split",
			"angular-gradient",
			"faceted-gem",
			"tide-pool",
			"eclipse",
		],
	},
	{
		name: "WebGL \u2014 Art Movements",
		color: "#fb7185",
		ids: [
			"rothko-fields",
			"mondrian-grid",
			"albers-squares",
			"lewitt-lines",
			"riley-waves",
			"kandinsky-circles",
			"klee-tiles",
			"escher-tessellation",
			"pollock-drip",
			"malevich-suprematism",
			"delaunay-discs",
			"agnes-martin-grid",
		],
	},
	{
		name: "WebGL \u2014 Effects",
		color: "#fb7185",
		ids: [
			"neon-glow",
			"caustics",
			"metaballs",
			"julia-set",
			"voronoi-crystal",
			"electric-plasma",
			"liquid-marble",
			"stained-glass",
			"topographic-map",
			"circuit-board",
			"fractal-coral",
			"galaxy-spiral",
			"bayer-4x4-animated",
			"ink-in-water",
			"supercell",
			"warp-fabric",
			"gradient-orb",
		],
	},
];

function formatName(id: string): string {
	return id
		.split("-")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}

function VariantRow({
	id,
	users,
	colorScheme,
	size,
	onSelectVariant,
	isSelected,
}: {
	id: string;
	users: string[];
	colorScheme: ColorScheme;
	size: number;
	onSelectVariant: (v: string) => void;
	isSelected: boolean;
}) {
	const animated = isAnimatedVariant(id);
	const rowRef = useRef<HTMLDivElement>(null);
	const stopFnsRef = useRef<(() => void)[]>([]);

	const onMouseEnter = useCallback(() => {
		if (!animated || !rowRef.current) return;
		const canvases = rowRef.current.querySelectorAll<HTMLCanvasElement>("canvas");
		const stops: (() => void)[] = [];
		for (let i = 0; i < canvases.length; i++) {
			const canvas = canvases[i];
			const user = users[i];
			if (!user) continue;
			stops.push(startAnimation(canvas, { value: user, size, variant: id, colorScheme }));
		}
		stopFnsRef.current = stops;
	}, [animated, users, size, id, colorScheme]);

	const onMouseLeave = useCallback(() => {
		for (const stop of stopFnsRef.current) stop();
		stopFnsRef.current = [];
		if (!rowRef.current) return;
		const canvases = rowRef.current.querySelectorAll<HTMLCanvasElement>("canvas");
		for (let i = 0; i < canvases.length; i++) {
			const canvas = canvases[i];
			const user = users[i];
			if (!user) continue;
			renderToCanvas(canvas, { value: user, size, variant: id, colorScheme });
		}
	}, [users, size, id, colorScheme]);

	return (
		<div
			style={{
				marginBottom: 20,
				padding: "8px 0",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					marginBottom: 8,
				}}
			>
				<div>
					<h3
						style={{
							fontSize: 13,
							fontWeight: 600,
							color: "#e4e4e7",
						}}
					>
						{formatName(id)}
						{animated && (
							<span style={{ fontSize: 10, color: "#52525b", fontWeight: 400, marginLeft: 8 }}>
								animated
							</span>
						)}
					</h3>
				</div>
				<button
					type="button"
					onClick={() => onSelectVariant(id)}
					style={{
						background: isSelected ? "#333" : "#111",
						border: "1px solid #333",
						borderRadius: 6,
						padding: "3px 10px",
						fontSize: 11,
						color: isSelected ? "#fafafa" : "#71717a",
						fontFamily: "inherit",
						cursor: "pointer",
						fontWeight: isSelected ? 600 : 400,
					}}
				>
					{isSelected ? "Active" : "Preview"}
				</button>
			</div>
			<div
				ref={rowRef}
				onMouseEnter={animated ? onMouseEnter : undefined}
				onMouseLeave={animated ? onMouseLeave : undefined}
				style={{
					display: "grid",
					gridTemplateColumns: `repeat(6, ${size}px)`,
					gap: 10,
				}}
			>
				{users.slice(0, 6).map((user) => (
					<div
						key={user}
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 4,
						}}
					>
						<Identicon
							value={user}
							size={size}
							variant={id}
							colorScheme={colorScheme}
							style={{ borderRadius: "50%" }}
						/>
						<span
							style={{
								fontSize: 9,
								color: "#52525b",
								maxWidth: size + 8,
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
								textAlign: "center",
							}}
						>
							{user}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

export function Catalog({
	colorScheme,
	users,
	size,
	onSelectVariant,
	selectedVariant,
}: {
	colorScheme: ColorScheme;
	users: string[];
	size: number;
	onSelectVariant: (v: string) => void;
	selectedVariant: string;
}) {
	return (
		<div style={{ padding: "32px 28px 80px" }}>
			{CATEGORIES.map((cat) => (
				<section key={cat.name} style={{ marginBottom: 40 }}>
					<div
						style={{
							borderTop: `1px solid ${cat.color}33`,
							paddingTop: 12,
							marginBottom: 16,
						}}
					>
						<h2
							style={{
								fontSize: 11,
								fontWeight: 600,
								letterSpacing: "0.08em",
								color: cat.color,
								textTransform: "uppercase",
							}}
						>
							{cat.name}
						</h2>
					</div>
					{cat.ids.map((id) => (
						<VariantRow
							key={id}
							id={id}
							users={users}
							colorScheme={colorScheme}
							size={size}
							onSelectVariant={onSelectVariant}
							isSelected={selectedVariant === id}
						/>
					))}
				</section>
			))}
		</div>
	);
}
