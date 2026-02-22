import type { CSSProperties } from "react";
import { PlayerCard } from "./PlayerCard.js";
import { Bar } from "./Bar.js";
import { ShootingSplits } from "./ShootingSplits.js";

export type PlayerData = {
	name: string;
	team: string;
	position: string;
	height?: string;
	weight?: string;
	stats?: {
		ppg?: number;
		rpg?: number;
		apg?: number;
		spg?: number;
		bpg?: number;
		fg_pct?: number;
		fg3_pct?: number;
		ft_pct?: number;
	};
};

export type PlayerCompareProps = {
	player1: PlayerData;
	player2: PlayerData;
	season?: string;
};

const STAT_KEYS = ["ppg", "rpg", "apg", "spg", "bpg", "fg_pct", "fg3_pct", "ft_pct"] as const;
type StatKey = typeof STAT_KEYS[number];

const STAT_LABELS: Record<StatKey, string> = {
	ppg: "PPG", rpg: "RPG", apg: "APG", spg: "SPG",
	bpg: "BPG", fg_pct: "FG%", fg3_pct: "3P%", ft_pct: "FT%",
};

const MAX_VALS: Record<StatKey, number> = {
	ppg: 35, rpg: 15, apg: 12, spg: 3,
	bpg: 4, fg_pct: 70, fg3_pct: 50, ft_pct: 100,
};

const SHOOTING_KEYS: StatKey[] = ["fg_pct", "fg3_pct", "ft_pct"];
const P1_COLOR = "#ff2d78";
const P2_COLOR = "#00e5ff";

export function PlayerCompare({ player1, player2, season }: PlayerCompareProps) {
	const s1 = player1.stats ?? {};
	const s2 = player2.stats ?? {};
	const activeKeys = STAT_KEYS.filter((k) => s1[k] != null || s2[k] != null);
	const hasShootingSplits = SHOOTING_KEYS.some((k) => s1[k] != null || s2[k] != null);

	const rootStyle: CSSProperties = {
		fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
		background: "#0f172a",
		color: "#e2e8f0",
		padding: 14,
		borderRadius: 12,
	};

	return (
		<section style={rootStyle} aria-label={`${player1.name} vs ${player2.name} comparison`}>
			{/* Player header cards */}
			<div style={{ display: "grid", gridTemplateColumns: "1fr 44px 1fr", gap: 8, marginBottom: 12, alignItems: "stretch" }}>
				<PlayerCard name={player1.name} team={player1.team} position={player1.position} height={player1.height} weight={player1.weight} color={P1_COLOR} />
				<div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
					<span style={{ fontSize: "1rem", fontWeight: 900, color: "#64748b" }} aria-hidden="true">VS</span>
				</div>
				<PlayerCard name={player2.name} team={player2.team} position={player2.position} height={player2.height} weight={player2.weight} color={P2_COLOR} />
			</div>

			{/* Season label */}
			{season && (
				<div style={{ textAlign: "center", fontSize: "0.8rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
					{season} Season
				</div>
			)}

			{/* Stat comparison bars */}
			<div style={{ background: "#1e293b", borderRadius: 10, padding: "12px 14px" }} role="table" aria-label="Statistical comparison">
				<div role="row" style={{ display: "none" }}>
					<span role="columnheader">Stat</span>
					<span role="columnheader">{player1.name}</span>
					<span role="columnheader">{player2.name}</span>
				</div>
				{activeKeys.length === 0 ? (
					<div style={{ textAlign: "center", color: "#94a3b8", padding: "36px 0", fontSize: "0.9rem" }}>
						No stats available
					</div>
				) : (
					activeKeys.map((k) => {
						const max = Math.max(MAX_VALS[k] ?? 100, s1[k] ?? 0, s2[k] ?? 0);
						const v1 = s1[k];
						const v2 = s2[k];
						return (
							<div key={k} role="row" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
								<div role="rowheader" style={{ width: 36, fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600, textAlign: "right", flexShrink: 0 }}>
									{STAT_LABELS[k]}
								</div>
								<div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
									<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
										<Bar value={v1} max={max} color={P1_COLOR} label={`${player1.name} ${STAT_LABELS[k]}: ${v1 ?? "N/A"}`} />
										<div style={{ fontSize: "0.82rem", color: "#cbd5e1", minWidth: 34 }}>
											{v1 != null ? v1.toFixed(1) : "\u2014"}
										</div>
									</div>
									<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
										<Bar value={v2} max={max} color={P2_COLOR} label={`${player2.name} ${STAT_LABELS[k]}: ${v2 ?? "N/A"}`} />
										<div style={{ fontSize: "0.82rem", color: "#cbd5e1", minWidth: 34 }}>
											{v2 != null ? v2.toFixed(1) : "\u2014"}
										</div>
									</div>
								</div>
							</div>
						);
					})
				)}
			</div>

			{/* Shooting splits */}
			{hasShootingSplits && (
				<ShootingSplits
					player1Name={player1.name}
					player2Name={player2.name}
					player1FgPct={s1.fg_pct}
					player1Fg3Pct={s1.fg3_pct}
					player1FtPct={s1.ft_pct}
					player2FgPct={s2.fg_pct}
					player2Fg3Pct={s2.fg3_pct}
					player2FtPct={s2.ft_pct}
					player1Color={P1_COLOR}
					player2Color={P2_COLOR}
				/>
			)}

			{/* Legend */}
			<div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 12 }}>
				{[{ name: player1.name, color: P1_COLOR }, { name: player2.name, color: P2_COLOR }].map(({ name, color }) => (
					<div key={name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.85rem", color: "#cbd5e1" }}>
						<div style={{ width: 9, height: 9, borderRadius: 2, background: color, flexShrink: 0 }} aria-hidden="true" />
						{name}
					</div>
				))}
			</div>
		</section>
	);
}
