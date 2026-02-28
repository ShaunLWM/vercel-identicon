import { startTransition, useState } from "react";
import type { ColorScheme } from "vercel-identicon";
import { Catalog } from "./catalog";
import { Dashboard } from "./dashboard";

const HSL_SCHEMES: ColorScheme[] = ["hsl-mono", "hsl-triadic", "hsl-complement", "hsl-analogous"];

const OKLCH_SCHEMES: ColorScheme[] = [
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
];

const SIZES = [32, 48, 64] as const;

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

const TOGGLE_GROUP: React.CSSProperties = {
	display: "flex",
	borderRadius: 6,
	overflow: "hidden",
	border: "1px solid #333",
};

function ToggleButton({
	active,
	onClick,
	children,
}: {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			style={{
				background: active ? "#333" : "#111",
				color: active ? "#fafafa" : "#71717a",
				border: "none",
				padding: "4px 10px",
				fontSize: 11,
				fontFamily: "inherit",
				cursor: "pointer",
				fontWeight: active ? 600 : 400,
				borderRight: "1px solid #333",
			}}
		>
			{children}
		</button>
	);
}

export function App() {
	const [colorScheme, setColorScheme] = useState<ColorScheme>("oklch-mono");
	const [username, setUsername] = useState("evilrabbit");
	const [size, setSize] = useState<(typeof SIZES)[number]>(48);
	const [selectedVariant, setSelectedVariant] = useState("bayer-4x4-oklch-mono");

	return (
		<div style={{ display: "flex", height: "100vh", background: "#000" }}>
			<div
				style={{
					width: 380,
					flexShrink: 0,
					borderRight: "1px solid #1c1c1f",
					overflowY: "auto",
				}}
			>
				<Dashboard colorScheme={colorScheme} selectedVariant={selectedVariant} />
			</div>
			<div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
				{/* Controls bar */}
				<div
					style={{
						flexShrink: 0,
						padding: "16px 28px",
						borderBottom: "1px solid #1c1c1f",
						display: "flex",
						flexDirection: "column",
						gap: 12,
					}}
				>
					<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
						<h1
							style={{
								fontSize: 14,
								fontWeight: 600,
								color: "#fafafa",
								letterSpacing: "-0.01em",
							}}
						>
							Vercel Identicon Prototypes
						</h1>
						<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
							<input
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="username"
								style={{
									background: "#111",
									border: "1px solid #333",
									borderRadius: 6,
									padding: "5px 10px",
									color: "#fafafa",
									fontSize: 12,
									fontFamily: "inherit",
									outline: "none",
									width: 140,
								}}
							/>
							<div style={TOGGLE_GROUP}>
								{SIZES.map((s) => (
									<ToggleButton key={s} active={size === s} onClick={() => setSize(s)}>
										{s}
									</ToggleButton>
								))}
							</div>
						</div>
					</div>
					<div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
						<span
							style={{
								fontSize: 10,
								color: "#52525b",
								textTransform: "uppercase",
								letterSpacing: "0.08em",
							}}
						>
							HSL
						</span>
						<div style={TOGGLE_GROUP}>
							{HSL_SCHEMES.map((cs) => (
								<ToggleButton
									key={cs}
									active={colorScheme === cs}
									onClick={() => startTransition(() => setColorScheme(cs))}
								>
									{cs.replace("hsl-", "")}
								</ToggleButton>
							))}
						</div>
						<span
							style={{
								fontSize: 10,
								color: "#52525b",
								textTransform: "uppercase",
								letterSpacing: "0.08em",
								marginLeft: 8,
							}}
						>
							OKLCH
						</span>
						<div style={{ ...TOGGLE_GROUP, flexWrap: "wrap" }}>
							{OKLCH_SCHEMES.map((cs) => (
								<ToggleButton
									key={cs}
									active={colorScheme === cs}
									onClick={() => startTransition(() => setColorScheme(cs))}
								>
									{cs.replace("oklch-", "")}
								</ToggleButton>
							))}
						</div>
					</div>
				</div>
				{/* Catalog */}
				<div style={{ flex: 1, overflowY: "auto" }}>
					<Catalog
						colorScheme={colorScheme}
						users={
							username ? [username, ...SAMPLE_USERS.filter((u) => u !== username)] : SAMPLE_USERS
						}
						size={size}
						onSelectVariant={setSelectedVariant}
						selectedVariant={selectedVariant}
					/>
				</div>
			</div>
		</div>
	);
}
