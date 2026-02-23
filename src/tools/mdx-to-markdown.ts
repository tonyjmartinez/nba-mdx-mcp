/**
 * Converts NBA Blog MDX content to clean, structured markdown for AI agents.
 *
 * Each visualization component (<PlayerCompare>, <StatHighlight>, etc.) is
 * rendered as a labelled markdown block with tables and ASCII bar indicators
 * so that Claude and other AI assistants can display the stats visually.
 */

export function mdxToAgentMarkdown(mdxSource: string): string {
	// ── Extract frontmatter ───────────────────────────────────────────────────
	let title = "";
	let date = "";
	let author = "NBA Blog Studio";
	let description = "";

	let body = mdxSource.replace(/^---\n([\s\S]*?)\n---\n?/, (_, fm: string) => {
		title = extractStr(fm, "title") ?? "";
		date = extractStr(fm, "date") ?? "";
		author = extractStr(fm, "author") ?? "NBA Blog Studio";
		description = extractStr(fm, "description") ?? "";
		return "";
	});

	// ── Header ────────────────────────────────────────────────────────────────
	const lines: string[] = [];

	if (title) lines.push(`# ${title}`, "");
	if (author || date) lines.push(`_By ${author}${date ? ` · ${date}` : ""}_`, "");
	if (description) lines.push(`> ${description}`, "");
	lines.push("", "---", "");

	// ── Agent rendering note ──────────────────────────────────────────────────
	lines.push(
		"> **Rendering note for AI assistants:** This NBA article contains structured",
		"> statistical data. Sections marked with 📊 are visualization blocks — please",
		"> render them as comparison tables with visual bar indicators (e.g. `████░░░░`)",
		"> so readers can clearly see relative differences between players.",
		"",
		"---",
		"",
	);

	// ── Remove HeroImage (header is already above) ────────────────────────────
	body = body.replace(/<HeroImage\b[\s\S]*?\/>\n?/g, "");

	// ── Convert components ────────────────────────────────────────────────────
	body = convertComponents(body);

	lines.push(body.trim(), "");
	return lines.join("\n");
}

// ── Component converters ──────────────────────────────────────────────────────

function convertComponents(text: string): string {
	// QuoteBlock (has children between tags)
	text = text.replace(
		/<QuoteBlock([\s\S]*?)>([\s\S]*?)<\/QuoteBlock>/g,
		(_, attrs: string, children: string) => {
			const attribution = extractAttr(attrs, "attribution") ?? "";
			return [
				"",
				`> *"${children.trim()}"*`,
				`>`,
				`> — *${attribution}*`,
				"",
			].join("\n");
		},
	);

	// StatHighlight
	text = text.replace(/<StatHighlight([\s\S]*?)\/>/g, (_, attrs: string) => {
		const value = extractAttr(attrs, "value") ?? "";
		const label = extractAttr(attrs, "label") ?? "";
		const player = extractAttr(attrs, "playerName") ?? "";
		return [
			"",
			`📊 **STAT: ${player ? player + " — " : ""}${value}**`,
			`> ${label}`,
			"",
		].join("\n");
	});

	// PlayerCompare
	text = text.replace(/<PlayerCompare([\s\S]*?)\/>/g, (_, attrs: string) => {
		const season = extractAttr(attrs, "season") ?? "";
		const p1 = extractPlayerObj(attrs, "player1");
		const p2 = extractPlayerObj(attrs, "player2");

		if (!p1 || !p2) return "";

		const statDefs: [string, string, string][] = [
			["PPG", "ppg", ""],
			["RPG", "rpg", ""],
			["APG", "apg", ""],
			["SPG", "spg", ""],
			["BPG", "bpg", ""],
			["FG%", "fg_pct", "%"],
			["3P%", "fg3_pct", "%"],
			["FT%", "ft_pct", "%"],
		];

		const rows = statDefs
			.filter(([, key]) => p1.stats[key] !== undefined || p2.stats[key] !== undefined)
			.map(([label, key, suffix]) => {
				const v1 = p1.stats[key];
				const v2 = p2.stats[key];
				const max = Math.max(v1 ?? 0, v2 ?? 0);
				const v1s = v1 !== undefined ? `${v1}${suffix} ${renderBar(v1, max)}` : "—";
				const v2s = v2 !== undefined ? `${v2}${suffix} ${renderBar(v2, max)}` : "—";
				return `| ${label} | ${v1s} | ${v2s} |`;
			});

		const col1 = `${p1.name} (${p1.team})`;
		const col2 = `${p2.name} (${p2.team})`;

		return [
			"",
			`📊 **PLAYER COMPARISON${season ? ` — ${season}` : ""}**`,
			"",
			`| Stat | ${col1} | ${col2} |`,
			`|------|${"-".repeat(col1.length + 2)}|${"-".repeat(col2.length + 2)}|`,
			...rows,
			"",
		].join("\n");
	});

	// PlayerCard
	text = text.replace(/<PlayerCard([\s\S]*?)\/>/g, (_, attrs: string) => {
		const name = extractAttr(attrs, "name") ?? "";
		const team = extractAttr(attrs, "team") ?? "";
		const position = extractAttr(attrs, "position") ?? "";
		const height = extractAttr(attrs, "height");
		const weight = extractAttr(attrs, "weight");
		const rows = [
			`| Team | ${team} |`,
			`| Position | ${position} |`,
			height ? `| Height | ${height} |` : "",
			weight ? `| Weight | ${weight} |` : "",
		].filter(Boolean);

		return [
			"",
			`📊 **PLAYER: ${name}**`,
			"",
			"| | |",
			"|---|---|",
			...rows,
			"",
		].join("\n");
	});

	// ShootingSplits
	text = text.replace(/<ShootingSplits([\s\S]*?)\/>/g, (_, attrs: string) => {
		const p1Name = extractAttr(attrs, "player1Name") ?? "Player 1";
		const p2Name = extractAttr(attrs, "player2Name") ?? "Player 2";
		const p1Fg = extractNumAttr(attrs, "player1FgPct");
		const p1Fg3 = extractNumAttr(attrs, "player1Fg3Pct");
		const p1Ft = extractNumAttr(attrs, "player1FtPct");
		const p2Fg = extractNumAttr(attrs, "player2FgPct");
		const p2Fg3 = extractNumAttr(attrs, "player2Fg3Pct");
		const p2Ft = extractNumAttr(attrs, "player2FtPct");

		const splits: [string, number | undefined, number | undefined][] = [
			["FG%", p1Fg, p2Fg],
			["3P%", p1Fg3, p2Fg3],
			["FT%", p1Ft, p2Ft],
		];

		const rows = splits.map(([label, v1, v2]) => {
			const max = Math.max(v1 ?? 0, v2 ?? 0);
			const v1s = v1 !== undefined ? `${v1}% ${renderBar(v1, max)}` : "—";
			const v2s = v2 !== undefined ? `${v2}% ${renderBar(v2, max)}` : "—";
			return `| ${label} | ${v1s} | ${v2s} |`;
		});

		return [
			"",
			"📊 **SHOOTING SPLITS**",
			"",
			`| Split | ${p1Name} | ${p2Name} |`,
			"|-------|-----------|-----------|",
			...rows,
			"",
		].join("\n");
	});

	// LeaderboardTable
	text = text.replace(/<LeaderboardTable([\s\S]*?)\/>/g, (_, attrs: string) => {
		const title = extractAttr(attrs, "title") ?? "Rankings";
		const statLabel = extractAttr(attrs, "statLabel") ?? "Value";
		const entries = extractEntriesArray(attrs);

		const maxVal = Math.max(...entries.map((e) => e.value));
		const rows = entries.map((e) => {
			const medal = e.rank === 1 ? "🥇" : e.rank === 2 ? "🥈" : e.rank === 3 ? "🥉" : `${e.rank}.`;
			const bar = renderBar(e.value, maxVal);
			return `| ${medal} | ${e.name} | ${e.team} | ${e.value} ${bar} |`;
		});

		return [
			"",
			`📊 **${title.toUpperCase()}**`,
			"",
			`| Rank | Player | Team | ${statLabel} |`,
			"|------|--------|------|------|",
			...rows,
			"",
		].join("\n");
	});

	// Bar (standalone)
	text = text.replace(/<Bar([\s\S]*?)\/>/g, (_, attrs: string) => {
		const value = extractNumAttr(attrs, "value");
		const max = extractNumAttr(attrs, "max") ?? 100;
		const label = extractAttr(attrs, "label") ?? "";
		if (value === undefined) return "";
		return `\n📊 **${label || "Stat"}:** ${value} ${renderBar(value, max)}\n`;
	});

	// DonutChart (standalone)
	text = text.replace(/<DonutChart([\s\S]*?)\/>/g, (_, attrs: string) => {
		const pct = extractNumAttr(attrs, "pct");
		const label = extractAttr(attrs, "label") ?? "";
		if (pct === undefined) return "";
		return `\n📊 **${label}:** ${pct}% ${renderBar(pct, 100)}\n`;
	});

	return text;
}

// ── Attribute helpers ─────────────────────────────────────────────────────────

/** Extract a string prop: name="value" or name='value' */
function extractAttr(attrs: string, name: string): string | undefined {
	const m = attrs.match(new RegExp(`${name}=["']([^"']+)["']`));
	return m?.[1];
}

/** Extract a numeric prop: name={42.8} */
function extractNumAttr(attrs: string, name: string): number | undefined {
	const m = attrs.match(new RegExp(`${name}=\\{([\\d.]+)\\}`));
	return m ? parseFloat(m[1]) : undefined;
}

/** Extract a frontmatter string value: key: "value" */
function extractStr(fm: string, key: string): string | undefined {
	const m = fm.match(new RegExp(`${key}:\\s*["']([^"']+)["']`));
	return m?.[1];
}

// ── Object / array extractors ─────────────────────────────────────────────────

interface PlayerData {
	name: string;
	team: string;
	position?: string;
	stats: Record<string, number>;
}

/** Extract player1={{ ... }} or player2={{ ... }} from attrs */
function extractPlayerObj(attrs: string, playerProp: string): PlayerData | null {
	const startToken = `${playerProp}={{`;
	const startIdx = attrs.indexOf(startToken);
	if (startIdx === -1) return null;

	let i = startIdx + startToken.length;
	let depth = 1;
	while (i < attrs.length && depth > 0) {
		if (attrs[i] === "{") depth++;
		else if (attrs[i] === "}") depth--;
		i++;
	}

	const objStr = attrs.slice(startIdx + startToken.length, i - 1);

	const name = objStr.match(/name:\s*["']([^"']+)["']/)?.[1] ?? "";
	const team = objStr.match(/team:\s*["']([^"']+)["']/)?.[1] ?? "";
	const position = objStr.match(/position:\s*["']([^"']+)["']/)?.[1];

	// Extract the stats sub-object
	const statsBlock = objStr.match(/stats:\s*\{([^}]+)\}/)?.[1] ?? "";
	const stats: Record<string, number> = {};
	for (const m of statsBlock.matchAll(/(\w+):\s*([\d.]+)/g)) {
		stats[m[1]] = parseFloat(m[2]);
	}

	return { name, team, position, stats };
}

/** Extract entries={[{ rank, name, team, value }, ...]} */
function extractEntriesArray(
	attrs: string,
): { rank: number; name: string; team: string; value: number }[] {
	const startToken = "entries={[";
	const startIdx = attrs.indexOf(startToken);
	if (startIdx === -1) return [];

	let i = startIdx + startToken.length;
	let depth = 1;
	while (i < attrs.length && depth > 0) {
		if (attrs[i] === "[") depth++;
		else if (attrs[i] === "]") depth--;
		i++;
	}

	const arrStr = attrs.slice(startIdx + startToken.length, i - 1);
	const entries: { rank: number; name: string; team: string; value: number }[] = [];

	for (const objMatch of arrStr.matchAll(/\{([^}]+)\}/g)) {
		const obj = objMatch[1];
		const rank = parseInt(obj.match(/rank:\s*(\d+)/)?.[1] ?? "0", 10);
		const name = obj.match(/name:\s*["']([^"']+)["']/)?.[1] ?? "";
		const team = obj.match(/team:\s*["']([^"']+)["']/)?.[1] ?? "";
		const value = parseFloat(obj.match(/value:\s*([\d.]+)/)?.[1] ?? "0");
		entries.push({ rank, name, team, value });
	}

	return entries;
}

// ── ASCII bar renderer ────────────────────────────────────────────────────────

function renderBar(value: number, max: number, width = 10): string {
	if (max === 0) return "";
	const filled = Math.round((value / max) * width);
	const empty = width - filled;
	return `${"█".repeat(Math.max(0, filled))}${"░".repeat(Math.max(0, empty))}`;
}
