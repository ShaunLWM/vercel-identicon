import { memo, useEffect, useMemo, useRef } from "react";
import { renderToCanvas } from "./render";
import type { IdenticonProps } from "./types";

const DEFAULT_STYLE: React.CSSProperties = {
	borderRadius: "50%",
	imageRendering: "pixelated",
};

export const Identicon = memo(function Identicon({
	value,
	size = 32,
	variant = "bayer-4x4-oklch-mono",
	colorScheme = "oklch-mono",
	className,
	style,
}: IdenticonProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		return renderToCanvas(canvas, { value, size, variant, colorScheme });
	}, [value, size, variant, colorScheme]);

	const mergedStyle = useMemo(
		() => ({ ...DEFAULT_STYLE, width: size, height: size, ...style }),
		[size, style],
	);

	return <canvas ref={canvasRef} className={className} style={mergedStyle} />;
});
