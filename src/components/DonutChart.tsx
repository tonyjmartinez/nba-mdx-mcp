import type { CSSProperties } from "react";

const SIZE = 120;
const RADIUS = 42;
const CX = SIZE / 2;
const CY = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const STROKE_WIDTH = 13;

export type DonutChartProps = {
	/** Percentage value (0-100) */
	pct: number | undefined;
	/** Fill color */
	color: string;
	/** Label displayed below the chart */
	label: string;
};

export function DonutChart({ pct, color, label }: DonutChartProps) {
	const safePct = pct ?? 0;
	const filled = (safePct / 100) * CIRCUMFERENCE;
	const textColor = color === "#ff2d78" ? "#ff80bc" : "#80f3ff";

	const wrapStyle: CSSProperties = {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		gap: 6,
	};

	const svgWrap: CSSProperties = {
		position: "relative",
		width: SIZE,
		height: SIZE,
	};

	const centerStyle: CSSProperties = {
		position: "absolute",
		top: 0,
		left: 0,
		width: "100%",
		height: "100%",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	};

	const labelStyle: CSSProperties = {
		fontSize: "0.8rem",
		color: "#94a3b8",
		textAlign: "center",
		maxWidth: SIZE,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	};

	return (
		<figure style={wrapStyle} role="img" aria-label={`${label}: ${pct != null ? `${pct.toFixed(1)}%` : "N/A"}`}>
			<div style={svgWrap}>
				<svg
					width={SIZE}
					height={SIZE}
					viewBox={`0 0 ${SIZE} ${SIZE}`}
					style={{ transform: "rotate(-90deg)", display: "block" }}
					aria-hidden="true"
				>
					<circle
						cx={CX} cy={CY} r={RADIUS}
						fill="none" stroke="#0f172a" strokeWidth={STROKE_WIDTH}
					/>
					<circle
						cx={CX} cy={CY} r={RADIUS}
						fill="none"
						stroke={pct != null ? color : "#1e293b"}
						strokeWidth={STROKE_WIDTH}
						strokeLinecap="round"
						strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
					/>
				</svg>
				<div style={centerStyle}>
					<span style={{ fontSize: "1rem", fontWeight: 700, color: textColor }}>
						{pct != null ? `${pct.toFixed(1)}%` : "\u2014"}
					</span>
				</div>
			</div>
			<figcaption style={labelStyle}>{label}</figcaption>
		</figure>
	);
}
