import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	searchPlayers,
	findPlayerWithStats,
	formatPlayerData,
} from "../api/balldontlie.js";

export function registerPlayerStatsTools(server: McpServer) {
	// ── get_player_stats ────────────────────────────────────────────────────
	server.tool(
		"get_player_stats",
		"Fetch a player's season stats from the NBA. Returns formatted data ready to be used as component props in MDX blog posts.",
		{
			player_name: z.string().describe("Player's full name (e.g. 'LeBron James')"),
			season: z.number().optional().describe("Season year (e.g. 2024 for the 2024-25 season). Omit for current season."),
		},
		async ({ player_name, season }) => {
			const result = await findPlayerWithStats(player_name, season);
			if (!result) {
				return {
					content: [
						{ type: "text" as const, text: `Could not find player "${player_name}". Try searching first with search_players.` },
					],
				};
			}

			const formatted = formatPlayerData(result);
			const markdown = formatPlayerMarkdown(formatted, season);
			return {
				content: [
					{ type: "text" as const, text: markdown },
					{ type: "text" as const, text: JSON.stringify(formatted, null, 2) },
				],
			};
		},
	);

	// ── compare_players ─────────────────────────────────────────────────────
	server.tool(
		"compare_players",
		"Fetch stats for two players and return data formatted for the PlayerCompare component. The returned JSON can be directly used as PlayerCompare props in MDX.",
		{
			player1_name: z.string().describe("First player's full name"),
			player2_name: z.string().describe("Second player's full name"),
			season: z.number().optional().describe("Season year. Omit for current season."),
		},
		async ({ player1_name, player2_name, season }) => {
			const [p1Result, p2Result] = await Promise.all([
				findPlayerWithStats(player1_name, season),
				findPlayerWithStats(player2_name, season),
			]);

			if (!p1Result) {
				return { content: [{ type: "text" as const, text: `Could not find player "${player1_name}".` }] };
			}
			if (!p2Result) {
				return { content: [{ type: "text" as const, text: `Could not find player "${player2_name}".` }] };
			}

			const player1 = formatPlayerData(p1Result);
			const player2 = formatPlayerData(p2Result);
			const seasonLabel = season ? `${season}-${String(season + 1).slice(2)}` : undefined;

			const data = { player1, player2, season: seasonLabel };
			const markdown = formatComparisonMarkdown(player1, player2, seasonLabel);

			return {
				content: [
					{ type: "text" as const, text: markdown },
					{ type: "text" as const, text: JSON.stringify(data, null, 2) },
				],
			};
		},
	);

	// ── search_players ──────────────────────────────────────────────────────
	server.tool(
		"search_players",
		"Search for NBA players by name. Use this to find the correct player before fetching stats.",
		{
			query: z.string().describe("Search query (e.g. 'curry', 'lebron')"),
		},
		async ({ query }) => {
			const players = await searchPlayers(query);
			if (players.length === 0) {
				return { content: [{ type: "text" as const, text: `No players found matching "${query}".` }] };
			}

			const text = players
				.slice(0, 10)
				.map(
					(p) =>
						`- **${p.first_name} ${p.last_name}** — ${p.team.full_name} (${p.position || "N/A"})`,
				)
				.join("\n");

			return { content: [{ type: "text" as const, text: `## Search Results\n\n${text}` }] };
		},
	);
}

// ── Markdown formatters ───────────────────────────────────────────────────────

type FormattedPlayer = ReturnType<typeof formatPlayerData>;

function formatPlayerMarkdown(p: FormattedPlayer, season?: number): string {
	const seasonLabel = season ? `${season}-${String(season + 1).slice(2)}` : "Current";
	let md = `## ${p.name}\n\n`;
	md += `**${p.team}** | ${p.position}`;
	if (p.height) md += ` | ${p.height}`;
	if (p.weight) md += ` | ${p.weight}`;
	md += `\n\n**${seasonLabel} Season Stats:**\n\n`;

	if (p.stats) {
		md += `| Stat | Value |\n|---|---|\n`;
		const s = p.stats;
		if (s.ppg != null) md += `| PPG | ${s.ppg} |\n`;
		if (s.rpg != null) md += `| RPG | ${s.rpg} |\n`;
		if (s.apg != null) md += `| APG | ${s.apg} |\n`;
		if (s.spg != null) md += `| SPG | ${s.spg} |\n`;
		if (s.bpg != null) md += `| BPG | ${s.bpg} |\n`;
		if (s.fg_pct != null) md += `| FG% | ${s.fg_pct}% |\n`;
		if (s.fg3_pct != null) md += `| 3P% | ${s.fg3_pct}% |\n`;
		if (s.ft_pct != null) md += `| FT% | ${s.ft_pct}% |\n`;
		if (s.gp != null) md += `| Games | ${s.gp} |\n`;
		if (s.mpg != null) md += `| MPG | ${s.mpg} |\n`;
	} else {
		md += `No stats available for this season.\n`;
	}

	return md;
}

function formatComparisonMarkdown(p1: FormattedPlayer, p2: FormattedPlayer, season?: string): string {
	const heading = season
		? `## ${p1.name} vs ${p2.name} \u2014 ${season} Season`
		: `## ${p1.name} vs ${p2.name}`;

	let md = `${heading}\n\n`;
	md += `| | **${p1.name}** | **${p2.name}** |\n|---|---|---|\n`;
	md += `| Team | ${p1.team} | ${p2.team} |\n`;
	md += `| Position | ${p1.position} | ${p2.position} |\n`;

	const s1 = p1.stats;
	const s2 = p2.stats;
	if (s1 || s2) {
		const fmt = (v: number | undefined) => (v != null ? String(v) : "\u2014");
		md += `| PPG | ${fmt(s1?.ppg)} | ${fmt(s2?.ppg)} |\n`;
		md += `| RPG | ${fmt(s1?.rpg)} | ${fmt(s2?.rpg)} |\n`;
		md += `| APG | ${fmt(s1?.apg)} | ${fmt(s2?.apg)} |\n`;
		md += `| FG% | ${fmt(s1?.fg_pct)} | ${fmt(s2?.fg_pct)} |\n`;
		md += `| 3P% | ${fmt(s1?.fg3_pct)} | ${fmt(s2?.fg3_pct)} |\n`;
		md += `| FT% | ${fmt(s1?.ft_pct)} | ${fmt(s2?.ft_pct)} |\n`;
	}

	return md;
}
