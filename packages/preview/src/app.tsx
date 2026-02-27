import { startTransition, useState } from "react";
import type { ColorScheme } from "vercel-identicon";
import { Catalog } from "./catalog";
import { Dashboard } from "./dashboard";

const COLOR_SCHEMES: ColorScheme[] = [
	"oklch-mono",
	"oklch-triadic",
	"oklch-golden",
	"oklch-complement",
	"oklch-analogous",
	"oklch-split",
	"oklch-tetrad",
	"oklch-warmcool",
	"oklch-vivid",
	"oklch-pastel",
	"oklch-cinema",
	"oklch-sunset",
	"oklch-earth",
	"hsl-triadic",
	"hsl-complement",
	"hsl-analogous",
	"hsl-mono",
];

const SAMPLE_USERS = [
	"evilrabbit",
	"rauno",
	"henry",
	"wits",
	"mitul",
	"josh",
	"mery",
	"guillermo",
	"shu",
	"mamuso",
	"william",
	"tomo",
];

export function App() {
	const [colorScheme, setColorScheme] = useState<ColorScheme>("oklch-mono");

	return (
		<div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
			<nav
				style={{
					background: "#09090bf0",
					backdropFilter: "blur(8px)",
					borderBottom: "1px solid #1c1c1f",
					padding: "10px 20px",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					flexShrink: 0,
					zIndex: 10,
				}}
			>
				<span
					style={{
						fontSize: 14,
						fontWeight: 600,
						color: "#a1a1aa",
						letterSpacing: "-0.01em",
					}}
				>
					vercel-identicon
				</span>
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<span style={{ fontSize: 11, color: "#52525b" }}>Color Scheme</span>
					<select
						value={colorScheme}
						onChange={(e) => {
							const v = e.target.value as ColorScheme;
							startTransition(() => setColorScheme(v));
						}}
						style={{
							background: "#18181b",
							border: "1px solid #27272a",
							borderRadius: 6,
							padding: "4px 8px",
							color: "#fafafa",
							fontSize: 12,
							fontFamily: "inherit",
							outline: "none",
						}}
					>
						{COLOR_SCHEMES.map((cs) => (
							<option key={cs} value={cs}>
								{cs}
							</option>
						))}
					</select>
				</div>
			</nav>
			<div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
				<div
					style={{
						width: 380,
						flexShrink: 0,
						borderRight: "1px solid #1c1c1f",
						overflowY: "auto",
					}}
				>
					<Dashboard colorScheme={colorScheme} />
				</div>
				<div style={{ flex: 1, overflowY: "auto" }}>
					<Catalog colorScheme={colorScheme} users={SAMPLE_USERS} />
				</div>
			</div>
		</div>
	);
}
