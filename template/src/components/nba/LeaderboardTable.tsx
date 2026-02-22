import type { CSSProperties } from "react";

export type LeaderboardEntry = {
	rank: number;
	name: string;
	team: string;
	value: number;
};

export type LeaderboardTableProps = {
	/** Table title (e.g. "Points Per Game Leaders") */
	title: string;
	/** Column header for the stat value (e.g. "PPG") */
	statLabel: string;
	/** Array of ranked entries */
	entries: LeaderboardEntry[];
	/** Accent color for the #1 rank. Defaults to gold. */
	highlightColor?: string;
};

export function LeaderboardTable({
	title,
	statLabel,
	entries,
	highlightColor = "#fbbf24",
}: LeaderboardTableProps) {
	const sectionStyle: CSSProperties = {
		margin: "16px 0",
		background: "#1e293b",
		borderRadius: 10,
		overflow: "hidden",
	};

	const headingStyle: CSSProperties = {
		margin: 0,
		padding: "12px 14px",
		fontSize: "0.85rem",
		fontWeight: 700,
		color: "#e2e8f0",
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		borderBottom: "1px solid #334155",
	};

	const tableStyle: CSSProperties = {
		width: "100%",
		borderCollapse: "collapse",
		fontSize: "0.85rem",
		color: "#cbd5e1",
	};

	const thStyle: CSSProperties = {
		textAlign: "left",
		padding: "8px 14px",
		fontWeight: 600,
		color: "#94a3b8",
		borderBottom: "1px solid #334155",
	};

	const thRight: CSSProperties = { ...thStyle, textAlign: "right" };

	return (
		<section style={sectionStyle} aria-label={title}>
			<h4 style={headingStyle}>{title}</h4>
			<table style={tableStyle}>
				<thead>
					<tr>
						<th scope="col" style={{ ...thStyle, width: 40, textAlign: "center" }}>#</th>
						<th scope="col" style={thStyle}>Player</th>
						<th scope="col" style={{ ...thStyle, width: 100 }}>Team</th>
						<th scope="col" style={{ ...thRight, width: 70 }}>{statLabel}</th>
					</tr>
				</thead>
				<tbody>
					{entries.map((entry) => {
						const isFirst = entry.rank === 1;
						const rowStyle: CSSProperties = {
							borderBottom: "1px solid #1e293b",
							background: isFirst ? "rgba(251, 191, 36, 0.08)" : "transparent",
						};
						const cellStyle: CSSProperties = { padding: "8px 14px" };
						return (
							<tr key={`${entry.rank}-${entry.name}`} style={rowStyle}>
								<td style={{ ...cellStyle, textAlign: "center", fontWeight: 700, color: isFirst ? highlightColor : "#64748b" }}>
									{entry.rank}
								</td>
								<td style={{ ...cellStyle, fontWeight: isFirst ? 700 : 400, color: isFirst ? "#f1f5f9" : "#cbd5e1" }}>
									{entry.name}
								</td>
								<td style={{ ...cellStyle, color: "#94a3b8" }}>{entry.team}</td>
								<td style={{ ...cellStyle, textAlign: "right", fontWeight: 600, color: isFirst ? highlightColor : "#e2e8f0" }}>
									{entry.value.toFixed(1)}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</section>
	);
}
