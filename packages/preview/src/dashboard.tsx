import type { ColorScheme } from "vercel-identicon";
import { Identicon } from "vercel-identicon";

type Status = "ready" | "building" | "error";

const VARIANTS: Record<string, string> = {
	evilrabbit: "spiral-dither",
	rauno: "bayer-4x4",
	guillermo: "voronoi-glass",
	henry: "halftone-dots",
	wits: "checkerboard",
	mitul: "diamond",
	josh: "radial",
	mamuso: "op-art",
	mery: "chromatic-aberration",
	shu: "plasma",
	william: "kaleidoscope",
	tomo: "phyllotaxis",
};

const DEPLOYMENTS: {
	user: string;
	branch: string;
	message: string;
	status: Status;
	time: string;
}[] = [
	{
		user: "evilrabbit",
		branch: "main",
		message: "fix: resolve hydration mismatch",
		status: "ready",
		time: "2m ago",
	},
	{
		user: "rauno",
		branch: "feat/motion",
		message: "add spring animation to nav",
		status: "ready",
		time: "5m ago",
	},
	{
		user: "guillermo",
		branch: "main",
		message: "update dependencies",
		status: "building",
		time: "8m ago",
	},
	{
		user: "henry",
		branch: "v0/chat",
		message: "streaming response UI",
		status: "ready",
		time: "12m ago",
	},
	{
		user: "wits",
		branch: "main",
		message: "perf: optimize bundle size",
		status: "ready",
		time: "18m ago",
	},
	{
		user: "mitul",
		branch: "feat/workflows",
		message: "add cron trigger step",
		status: "error",
		time: "22m ago",
	},
	{
		user: "josh",
		branch: "ai-gateway",
		message: "rate limiting middleware",
		status: "ready",
		time: "30m ago",
	},
	{
		user: "mamuso",
		branch: "main",
		message: "design system tokens update",
		status: "ready",
		time: "35m ago",
	},
	{
		user: "mery",
		branch: "feat/dash",
		message: "usage chart component",
		status: "ready",
		time: "41m ago",
	},
	{
		user: "shu",
		branch: "main",
		message: "infra: edge config cache",
		status: "ready",
		time: "48m ago",
	},
];

const ACTIVITY: { user: string; action: string; time: string }[] = [
	{ user: "william", action: "commented on PR #4821", time: "3m" },
	{ user: "tomo", action: "approved deployment to production", time: "7m" },
	{ user: "evilrabbit", action: "merged branch feat/identicons", time: "15m" },
	{ user: "rauno", action: "opened PR #4823", time: "20m" },
	{ user: "guillermo", action: "transferred domain vercel.com", time: "1h" },
];

const STATUS_COLOR: Record<Status, string> = {
	ready: "#50e3c2",
	building: "#f5a623",
	error: "#ee0000",
};

const AVATAR_STYLE: React.CSSProperties = { borderRadius: "50%", flexShrink: 0 };

function Avatar({
	user,
	size,
	colorScheme,
}: {
	user: string;
	size: number;
	colorScheme: ColorScheme;
}) {
	return (
		<Identicon
			value={user}
			size={size}
			variant={VARIANTS[user] ?? "bayer-4x4"}
			colorScheme={colorScheme}
			style={AVATAR_STYLE}
		/>
	);
}

export function Dashboard({ colorScheme }: { colorScheme: ColorScheme }) {
	return (
		<div style={{ padding: "24px 16px 48px" }}>
			<section>
				<SectionTitle>Deployments</SectionTitle>
				{DEPLOYMENTS.map((d, i) => (
					<div
						key={d.user + d.time}
						className="row-in"
						style={{
							animationDelay: `${i * 40}ms`,
							display: "flex",
							alignItems: "center",
							gap: 10,
							padding: "8px 6px",
							borderBottom: "1px solid #1c1c1f",
							borderRadius: 4,
							cursor: "default",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = "#111113";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "transparent";
						}}
					>
						<Avatar user={d.user} size={32} colorScheme={colorScheme} />
						<div style={{ flex: 1, minWidth: 0 }}>
							<div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
								<span style={{ fontWeight: 600, fontSize: 12, color: "#fafafa" }}>{d.user}</span>
								<span style={{ fontSize: 11, color: "#3f3f46" }}>/</span>
								<span style={{ fontSize: 11, color: "#a1a1aa" }}>{d.branch}</span>
							</div>
							<div
								style={{
									fontSize: 11,
									color: "#52525b",
									marginTop: 1,
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
								}}
							>
								{d.message}
							</div>
						</div>
						<div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
							<span
								style={{
									width: 6,
									height: 6,
									borderRadius: "50%",
									background: STATUS_COLOR[d.status],
									boxShadow: `0 0 5px ${STATUS_COLOR[d.status]}44`,
								}}
							/>
							<span style={{ fontSize: 11, color: "#52525b", whiteSpace: "nowrap" }}>{d.time}</span>
						</div>
					</div>
				))}
			</section>

			<section style={{ marginTop: 28 }}>
				<SectionTitle>Team Activity</SectionTitle>
				{ACTIVITY.map((a, i) => (
					<div
						key={a.user + a.action}
						className="row-in"
						style={{
							animationDelay: `${(DEPLOYMENTS.length + i) * 40}ms`,
							display: "flex",
							alignItems: "center",
							gap: 10,
							padding: "7px 6px",
							borderBottom: "1px solid #1c1c1f",
							borderRadius: 4,
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = "#111113";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "transparent";
						}}
					>
						<Avatar user={a.user} size={28} colorScheme={colorScheme} />
						<div style={{ flex: 1, minWidth: 0, fontSize: 11, color: "#a1a1aa" }}>
							<span style={{ fontWeight: 600, color: "#fafafa" }}>{a.user}</span> {a.action}
						</div>
						<span style={{ fontSize: 10, color: "#52525b", flexShrink: 0 }}>{a.time}</span>
					</div>
				))}
			</section>
		</div>
	);
}

function SectionTitle({ children }: { children: React.ReactNode }) {
	return (
		<h2
			style={{
				fontSize: 11,
				fontWeight: 500,
				letterSpacing: "0.08em",
				color: "#71717a",
				marginBottom: 8,
				textTransform: "uppercase",
			}}
		>
			{children}
		</h2>
	);
}
