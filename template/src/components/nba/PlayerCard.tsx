import type { CSSProperties } from "react";

export type PlayerCardProps = {
	name: string;
	team: string;
	position: string;
	height?: string;
	weight?: string;
	/** Accent color for the card header border */
	color?: string;
};

const P1_COLOR = "#ff2d78";

export function PlayerCard({
	name,
	team,
	position,
	height,
	weight,
	color = P1_COLOR,
}: PlayerCardProps) {
	const cardStyle: CSSProperties = {
		flex: 1,
		padding: "12px 10px",
		borderRadius: 10,
		background: "#1e293b",
		borderTop: `3px solid ${color}`,
	};

	const nameColor = color === P1_COLOR ? "#ff80bc" : "#80f3ff";

	return (
		<article style={cardStyle} aria-label={`${name} player card`}>
			<div
				style={{
					fontSize: "1.05rem",
					fontWeight: 700,
					color: nameColor,
					whiteSpace: "nowrap",
					overflow: "hidden",
					textOverflow: "ellipsis",
					marginBottom: 3,
				}}
			>
				{name}
			</div>
			<dl style={{ margin: 0, fontSize: "0.82rem", color: "#94a3b8", lineHeight: 1.5 }}>
				<div style={{ display: "flex", gap: 4 }}>
					<dt style={{ fontWeight: 600 }}>Team:</dt>
					<dd style={{ margin: 0 }}>{team}</dd>
				</div>
				<div style={{ display: "flex", gap: 4 }}>
					<dt style={{ fontWeight: 600 }}>Pos:</dt>
					<dd style={{ margin: 0 }}>{position}</dd>
				</div>
				{height && (
					<div style={{ display: "flex", gap: 4 }}>
						<dt style={{ fontWeight: 600 }}>Ht:</dt>
						<dd style={{ margin: 0 }}>
							{height}
							{weight ? ` \u00B7 ${weight}` : ""}
						</dd>
					</div>
				)}
			</dl>
		</article>
	);
}
