import type { ColorScheme } from "vercel-identicon";
import { Identicon } from "vercel-identicon";

type Category = { name: string; ids: string[] };

const CATEGORIES: Category[] = [
	{
		name: "Bayer Dithering",
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
		ids: ["floyd-steinberg", "atkinson", "jarvis-judice-ninke", "sierra", "stucki"],
	},
	{
		name: "Pattern Dithering",
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
		ids: ["atkinson-blob", "halftone-field", "cross-hatch", "spiral-dither", "blue-noise-dither"],
	},
	{
		name: "Terminal",
		ids: ["phosphor-grid", "ansi-quilt", "teletext-mosaic", "matrix-rain", "raster-bars"],
	},
	{
		name: "Retro",
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
		ids: ["agate-slice", "phyllotaxis", "cymatics", "fingerprint", "tree-rings", "coral-growth"],
	},
	{
		name: "Textile & Craft",
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
		ids: ["clifford-attractor", "hilbert-curve", "spiral-galaxy", "sound-ring", "erosion-canyon"],
	},
	{
		name: "WebGL \u2014 Scenes",
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
			"galaxy-spiral",
		],
	},
];

const CIRCLE_STYLE: React.CSSProperties = { borderRadius: "50%" };

const CARD_STYLE: React.CSSProperties = {
	marginBottom: 24,
	padding: "12px 12px 16px",
	background: "#111113",
	borderRadius: 10,
	border: "1px solid #1c1c1f",
	contentVisibility: "auto",
	containIntrinsicSize: "0 120px",
};

function formatName(id: string): string {
	return id
		.split("-")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}

export function Catalog({ colorScheme, users }: { colorScheme: ColorScheme; users: string[] }) {
	return (
		<div style={{ padding: "32px 28px 80px" }}>
			{CATEGORIES.map((cat) => (
				<section key={cat.name} style={{ marginBottom: 40 }}>
					<h2
						style={{
							fontSize: 11,
							fontWeight: 500,
							letterSpacing: "0.08em",
							color: "#71717a",
							marginBottom: 16,
							textTransform: "uppercase",
						}}
					>
						{cat.name}
					</h2>
					{cat.ids.map((id) => (
						<div key={id} style={CARD_STYLE}>
							<h3
								style={{
									fontSize: 13,
									fontWeight: 600,
									color: "#e4e4e7",
									marginBottom: 10,
								}}
							>
								{formatName(id)}
							</h3>
							<div
								style={{
									display: "flex",
									flexWrap: "wrap",
									gap: 10,
								}}
							>
								{users.map((user) => (
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
											size={36}
											variant={id}
											colorScheme={colorScheme}
											style={CIRCLE_STYLE}
										/>
										<span
											style={{
												fontSize: 9,
												color: "#52525b",
												maxWidth: 40,
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
					))}
				</section>
			))}
		</div>
	);
}
