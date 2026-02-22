const BASE_URL = "https://api.balldontlie.io/v1";

export type PlayerInfo = {
	id: number;
	first_name: string;
	last_name: string;
	position: string;
	height: string;
	weight: string;
	team: {
		full_name: string;
		abbreviation: string;
		conference: string;
		division: string;
	};
};

export type SeasonAverages = {
	games_played: number;
	min: string;
	pts: number;
	reb: number;
	ast: number;
	stl: number;
	blk: number;
	fg_pct: number;
	fg3_pct: number;
	ft_pct: number;
	turnover: number;
	fgm: number;
	fga: number;
	fg3m: number;
	fg3a: number;
	ftm: number;
	fta: number;
	oreb: number;
	dreb: number;
	pf: number;
};

export type PlayerWithStats = {
	player: PlayerInfo;
	stats: SeasonAverages | null;
};

async function apiFetch<T>(path: string, apiKey?: string): Promise<T> {
	const headers: Record<string, string> = {
		Accept: "application/json",
	};
	if (apiKey) {
		headers["Authorization"] = apiKey;
	}
	const res = await fetch(`${BASE_URL}${path}`, { headers });
	if (!res.ok) {
		throw new Error(`balldontlie API error: ${res.status} ${res.statusText}`);
	}
	return res.json() as Promise<T>;
}

export async function searchPlayers(
	query: string,
	apiKey?: string,
): Promise<PlayerInfo[]> {
	const data = await apiFetch<{ data: PlayerInfo[] }>(
		`/players?search=${encodeURIComponent(query)}`,
		apiKey,
	);
	return data.data;
}

export async function getPlayerById(
	id: number,
	apiKey?: string,
): Promise<PlayerInfo> {
	const data = await apiFetch<{ data: PlayerInfo }>(`/players/${id}`, apiKey);
	return data.data;
}

export async function getSeasonAverages(
	playerId: number,
	season?: number,
	apiKey?: string,
): Promise<SeasonAverages | null> {
	const seasonParam = season ? `&season=${season}` : "";
	const data = await apiFetch<{ data: SeasonAverages[] }>(
		`/season_averages?player_ids[]=${playerId}${seasonParam}`,
		apiKey,
	);
	return data.data[0] ?? null;
}

export async function findPlayerWithStats(
	name: string,
	season?: number,
	apiKey?: string,
): Promise<PlayerWithStats | null> {
	const players = await searchPlayers(name, apiKey);
	if (players.length === 0) return null;

	// Best match: exact full name, otherwise first result
	const match =
		players.find(
			(p) =>
				`${p.first_name} ${p.last_name}`.toLowerCase() ===
				name.toLowerCase(),
		) ?? players[0];

	const stats = await getSeasonAverages(match.id, season, apiKey);
	return { player: match, stats };
}

/** Format a PlayerWithStats into the shape our components expect. */
export function formatPlayerData(pw: PlayerWithStats) {
	const { player, stats } = pw;
	return {
		name: `${player.first_name} ${player.last_name}`,
		team: player.team.full_name,
		position: player.position || "N/A",
		height: player.height || undefined,
		weight: player.weight ? `${player.weight} lbs` : undefined,
		stats: stats
			? {
					ppg: round(stats.pts),
					rpg: round(stats.reb),
					apg: round(stats.ast),
					spg: round(stats.stl),
					bpg: round(stats.blk),
					fg_pct: round(stats.fg_pct * 100),
					fg3_pct: round(stats.fg3_pct * 100),
					ft_pct: round(stats.ft_pct * 100),
					gp: stats.games_played,
					mpg: parseFloat(stats.min) || 0,
				}
			: undefined,
	};
}

function round(n: number): number {
	return Math.round(n * 10) / 10;
}
