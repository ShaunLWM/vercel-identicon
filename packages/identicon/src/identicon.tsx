import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { isAnimatedVariant, renderToCanvas, startAnimation } from "./render";
import type { IdenticonProps } from "./types";

const DEFAULT_STYLE: React.CSSProperties = {
	borderRadius: "50%",
	imageRendering: "pixelated",
	transition: "transform 0.2s ease",
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
	const stopRef = useRef<(() => void) | null>(null);
	const animated = isAnimatedVariant(variant);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		renderToCanvas(canvas, { value, size, variant, colorScheme });
		return () => {
			stopRef.current?.();
			stopRef.current = null;
		};
	}, [value, size, variant, colorScheme]);

	const onMouseEnter = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		canvas.style.transform = "scale(1.1)";
		stopRef.current = startAnimation(canvas, { value, size, variant, colorScheme });
	}, [value, size, variant, colorScheme]);

	const onMouseLeave = useCallback(() => {
		const canvas = canvasRef.current;
		if (canvas) {
			canvas.style.transform = "";
			renderToCanvas(canvas, { value, size, variant, colorScheme });
		}
		stopRef.current?.();
		stopRef.current = null;
	}, [value, size, variant, colorScheme]);

	const mergedStyle = useMemo(
		() => ({
			...DEFAULT_STYLE,
			width: size,
			height: size,
			...(animated ? { cursor: "pointer" } : undefined),
			...style,
		}),
		[size, style, animated],
	);

	return (
		<canvas
			ref={canvasRef}
			className={className}
			style={mergedStyle}
			onMouseEnter={animated ? onMouseEnter : undefined}
			onMouseLeave={animated ? onMouseLeave : undefined}
		/>
	);
});
