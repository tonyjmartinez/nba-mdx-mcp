import type { CSSProperties } from "react";

export type StatHighlightProps = {
	/** The stat value to highlight (e.g. "26.4 PPG") */
	value: string;
	/** Short description or context (e.g. "League-leading scorer") */
	label: string;
	/** Player name for attribution */
	playerName?: string;
	/** Accent color. Defaults to cyan (#00e5ff). */
	color?: string;
};

export function StatHighlight({
	value,
	label,
	playerName,
	color = "#00e5ff",
}: StatHighlightProps) {
	const figureStyle: CSSProperties = {
		margin: "16px 0",
		padding: "16px 20px",
		background: "#1e293b",
		borderLeft: `4px solid ${color}`,
		borderRadius: "0 10px 10px 0",
	};

	const valueStyle: CSSProperties = {
		fontSize: "1.8rem",
		fontWeight: 800,
		color,
		lineHeight: 1.2,
		marginBottom: 4,
	};

	const labelStyle: CSSProperties = {
		fontSize: "0.9rem",
		color: "#94a3b8",
		lineHeight: 1.4,
	};

	return (
		<figure style={figureStyle} role="img" aria-label={`${playerName ? `${playerName}: ` : ""}${value} — ${label}`}>
			<div style={valueStyle}>{value}</div>
			<figcaption style={labelStyle}>
				{playerName && (
					<strong style={{ color: "#e2e8f0" }}>{playerName}</strong>
				)}
				{playerName ? " \u2014 " : ""}
				{label}
			</figcaption>
		</figure>
	);
}
