/**
 * /api/stats — Claude-powered NBA stats lookup.
 *
 * Accepts a component type + player names as query params, calls Claude to
 * fetch real stats from its training knowledge, and returns structured JSON
 * ready to hydrate the matching React component.
 *
 * Query params:
 *   component  — "player-compare" | "leaderboard" | "stat-highlight" | "player-card"
 *   player1    — first player name (player-compare, stat-highlight, player-card)
 *   player2    — second player name (player-compare)
 *   players    — comma-separated list (leaderboard)
 *   stat       — stat type for leaderboard (ppg|rpg|apg|fg_pct|fg3_pct)
 *   season     — season label, e.g. "2024-25"
 *   title      — custom table title (leaderboard)
 */

import Anthropic from "@anthropic-ai/sdk";

// ── Component-specific prompt builders ───────────────────────────────────────

function playerComparePrompt(p: URLSearchParams): string {
	const player1 = p.get("player1") ?? "Unknown";
	const player2 = p.get("player2") ?? "Unknown";
	const season = p.get("season") ?? "2024-25";
	return `You are an NBA statistics database. Return ONLY valid JSON, no markdown, no explanation.

Look up the ${season} season stats for ${player1} and ${player2}.

Return exactly this JSON structure (all numbers are plain floats, not strings):
{
  "player1": {
    "name": "${player1}",
    "team": "<full team name>",
    "position": "<PG|SG|SF|PF|C>",
    "height": "<e.g. 6'11\\">" ,
    "weight": "<e.g. 284 lbs>",
    "stats": {
      "ppg": <number>,
      "rpg": <number>,
      "apg": <number>,
      "spg": <number>,
      "bpg": <number>,
      "fg_pct": <number>,
      "fg3_pct": <number>,
      "ft_pct": <number>
    }
  },
  "player2": {
    "name": "${player2}",
    "team": "<full team name>",
    "position": "<PG|SG|SF|PF|C>",
    "height": "<e.g. 6'6\\">" ,
    "weight": "<e.g. 195 lbs>",
    "stats": {
      "ppg": <number>,
      "rpg": <number>,
      "apg": <number>,
      "spg": <number>,
      "bpg": <number>,
      "fg_pct": <number>,
      "fg3_pct": <number>,
      "ft_pct": <number>
    }
  },
  "season": "${season}"
}`;
}

function leaderboardPrompt(p: URLSearchParams): string {
	const stat = p.get("stat") ?? "ppg";
	const season = p.get("season") ?? "2024-25";
	const playersRaw = p.get("players");
	const title = p.get("title") ?? `${season} ${stat.toUpperCase()} Leaders`;

	const STAT_LABELS: Record<string, string> = {
		ppg: "PPG", rpg: "RPG", apg: "APG", spg: "SPG",
		bpg: "BPG", fg_pct: "FG%", fg3_pct: "3P%", ft_pct: "FT%",
	};
	const statLabel = STAT_LABELS[stat] ?? stat.toUpperCase();

	if (playersRaw) {
		const players = playersRaw.split(",").map((s) => s.trim());
		return `You are an NBA statistics database. Return ONLY valid JSON, no markdown.

Look up ${season} season ${statLabel} for these players: ${players.join(", ")}.
Rank them by ${statLabel} (descending).

Return exactly this JSON:
{
  "title": "${title}",
  "statLabel": "${statLabel}",
  "entries": [
    { "rank": 1, "name": "<player name>", "team": "<3-letter abbr>", "value": <number> },
    ...one entry per player...
  ]
}`;
	}

	return `You are an NBA statistics database. Return ONLY valid JSON, no markdown.

List the top 5 NBA players by ${statLabel} in the ${season} season.

Return exactly this JSON:
{
  "title": "${title}",
  "statLabel": "${statLabel}",
  "entries": [
    { "rank": 1, "name": "<player name>", "team": "<3-letter abbr>", "value": <number> },
    { "rank": 2, "name": "<player name>", "team": "<3-letter abbr>", "value": <number> },
    { "rank": 3, "name": "<player name>", "team": "<3-letter abbr>", "value": <number> },
    { "rank": 4, "name": "<player name>", "team": "<3-letter abbr>", "value": <number> },
    { "rank": 5, "name": "<player name>", "team": "<3-letter abbr>", "value": <number> }
  ]
}`;
}

function statHighlightPrompt(p: URLSearchParams): string {
	const player = p.get("player1") ?? p.get("player") ?? "Unknown";
	const stat = p.get("stat") ?? "ppg";
	const season = p.get("season") ?? "2024-25";
	return `You are an NBA statistics database. Return ONLY valid JSON, no markdown.

Look up the most impressive ${stat.toUpperCase()} stat for ${player} in the ${season} season.
Write a concise but compelling label explaining why this stat is notable.

Return exactly this JSON:
{
  "value": "<formatted value, e.g. '31.4 PPG'>",
  "label": "<one sentence of context, e.g. 'Led all guards in scoring for the second straight season'>",
  "playerName": "${player}",
  "color": "<a hex color that matches the player's team primary color>"
}`;
}

function playerCardPrompt(p: URLSearchParams): string {
	const player = p.get("player1") ?? p.get("player") ?? "Unknown";
	const season = p.get("season") ?? "2024-25";
	return `You are an NBA statistics database. Return ONLY valid JSON, no markdown.

Look up basic info for ${player} as of the ${season} season.

Return exactly this JSON:
{
  "name": "${player}",
  "team": "<full team name>",
  "position": "<PG|SG|SF|PF|C>",
  "height": "<e.g. 6'11\\">" ,
  "weight": "<e.g. 284 lbs>",
  "color": "<hex color matching team primary color>"
}`;
}

// ── Prompt router ─────────────────────────────────────────────────────────────

const PROMPT_BUILDERS: Record<string, (p: URLSearchParams) => string> = {
	"player-compare": playerComparePrompt,
	"leaderboard": leaderboardPrompt,
	"stat-highlight": statHighlightPrompt,
	"player-card": playerCardPrompt,
};

// ── Handler ───────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
};

export async function handleStatsRequest(
	request: Request,
	env: Env,
): Promise<Response> {
	if (request.method === "OPTIONS") {
		return new Response(null, { status: 204, headers: CORS_HEADERS });
	}

	const url = new URL(request.url);
	const component = url.searchParams.get("component");

	if (!component || !PROMPT_BUILDERS[component]) {
		return new Response(
			JSON.stringify({
				error: `Unknown component "${component}". Valid values: ${Object.keys(PROMPT_BUILDERS).join(", ")}`,
			}),
			{
				status: 400,
				headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
			},
		);
	}

	if (!env.ANTHROPIC_API_KEY) {
		return new Response(
			JSON.stringify({ error: "ANTHROPIC_API_KEY not configured on this Worker" }),
			{
				status: 503,
				headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
			},
		);
	}

	try {
		const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
		const prompt = PROMPT_BUILDERS[component](url.searchParams);

		const message = await client.messages.create({
			model: "claude-opus-4-6",
			max_tokens: 1024,
			messages: [{ role: "user", content: prompt }],
		});

		const raw = message.content[0]?.type === "text" ? message.content[0].text.trim() : "";

		// Strip potential markdown code fences
		const json = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

		const data = JSON.parse(json);

		return new Response(JSON.stringify(data), {
			headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return new Response(
			JSON.stringify({ error: "Stats lookup failed", detail: message }),
			{
				status: 500,
				headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
			},
		);
	}
}
