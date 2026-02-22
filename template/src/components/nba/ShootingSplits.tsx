import type { CSSProperties } from "react";
import { DonutChart } from "./DonutChart.js";

export type ShootingSplitsProps = {
	player1Name: string;
	player2Name: string;
	player1FgPct?: number;
	player1Fg3Pct?: number;
	player1FtPct?: number;
	player2FgPct?: number;
	player2Fg3Pct?: number;
	player2FtPct?: number;
	/** Which split to display: "fg_pct" | "fg3_pct" | "ft_pct". Defaults to "fg_pct". */
	selected?: "fg_pct" | "fg3_pct" | "ft_pct";
	player1Color?: string;
	player2Color?: string;
};

const P1_COLOR = "#ff2d78";
const P2_COLOR = "#00e5ff";

const LABELS: Record<string, string> = {
	fg_pct: "FG%",
	fg3_pct: "3P%",
	ft_pct: "FT%",
};

/**
 * SSR-friendly shooting splits display.
 * Shows all three splits as a table with donut charts for the selected stat.
 * No client-side interactivity — the `selected` prop controls which donuts render.
 */
export function ShootingSplits({
	player1Name,
	player2Name,
	player1FgPct,
	player1Fg3Pct,
	player1FtPct,
	player2FgPct,
	player2Fg3Pct,
	player2FtPct,
	selected = "fg_pct",
	player1Color = P1_COLOR,
	player2Color = P2_COLOR,
}: ShootingSplitsProps) {
	const splits = {
		fg_pct: { p1: player1FgPct, p2: player2FgPct },
		fg3_pct: { p1: player1Fg3Pct, p2: player2Fg3Pct },
		ft_pct: { p1: player1FtPct, p2: player2FtPct },
	};

	const sectionStyle: CSSProperties = {
		background: "#1e293b",
		borderRadius: 10,
		padding: "12px 14px",
		marginTop: 10,
	};

	const headingStyle: CSSProperties = {
		textAlign: "center",
		fontSize: "0.8rem",
		color: "#94a3b8",
		textTransform: "uppercase",
		letterSpacing: "0.1em",
		marginBottom: 10,
		margin: 0,
	};

	return (
		<section style={sectionStyle} aria-label="Shooting splits comparison">
			<h4 style={headingStyle}>Shooting Splits</h4>

			{/* Table showing all splits */}
			<table
				style={{
					width: "100%",
					borderCollapse: "collapse",
					fontSize: "0.82rem",
					color: "#cbd5e1",
					marginBottom: 14,
				}}
				role="table"
			>
				<thead>
					<tr>
						<th scope="col" style={{ textAlign: "left", padding: "4px 8px", color: "#94a3b8", fontWeight: 600 }}>Stat</th>
						<th scope="col" style={{ textAlign: "right", padding: "4px 8px", color: player1Color, fontWeight: 600 }}>{player1Name}</th>
						<th scope="col" style={{ textAlign: "right", padding: "4px 8px", color: player2Color, fontWeight: 600 }}>{player2Name}</th>
					</tr>
				</thead>
				<tbody>
					{(Object.keys(splits) as Array<keyof typeof splits>).map((key) => {
						const { p1, p2 } = splits[key];
						const isSelected = key === selected;
						return (
							<tr
								key={key}
								style={{
									background: isSelected ? "#334155" : "transparent",
									fontWeight: isSelected ? 600 : 400,
								}}
							>
								<td style={{ padding: "4px 8px" }}>{LABELS[key]}</td>
								<td style={{ textAlign: "right", padding: "4px 8px" }}>
									{p1 != null ? `${p1.toFixed(1)}%` : "\u2014"}
								</td>
								<td style={{ textAlign: "right", padding: "4px 8px" }}>
									{p2 != null ? `${p2.toFixed(1)}%` : "\u2014"}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>

			{/* Donut charts for the selected split */}
			<div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-start", padding: "0 8px" }}>
				<DonutChart
					pct={splits[selected].p1}
					color={player1Color}
					label={player1Name}
				/>
				<DonutChart
					pct={splits[selected].p2}
					color={player2Color}
					label={player2Name}
				/>
			</div>
		</section>
	);
}
