import type { CSSProperties } from "react";

export type BarProps = {
	/** Stat value to display */
	value: number | undefined;
	/** Maximum value for scale (e.g. 35 for PPG) */
	max: number;
	/** Bar fill color */
	color: string;
	/** Accessible label for the bar */
	label?: string;
};

export function Bar({ value, max, color, label }: BarProps) {
	if (value == null) return <div style={{ flex: 1 }} />;
	const pct = Math.min((value / max) * 100, 100);

	const trackStyle: CSSProperties = {
		background: "#0f172a",
		borderRadius: 5,
		height: 10,
		flex: 1,
		overflow: "hidden",
	};

	const fillStyle: CSSProperties = {
		width: `${pct}%`,
		height: "100%",
		background: color,
		borderRadius: 5,
	};

	return (
		<div
			role="img"
			aria-label={label ?? `${value} out of ${max}`}
			style={trackStyle}
		>
			<div style={fillStyle} />
		</div>
	);
}
