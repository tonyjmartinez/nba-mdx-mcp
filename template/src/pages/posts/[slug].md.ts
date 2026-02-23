import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";

/**
 * /posts/{slug}.md — Cloudflare AI agents markdown version of each blog post.
 *
 * Converts the MDX source (with NBA visualization components) into structured
 * markdown that AI assistants like Claude can read and render. Each component
 * block is converted to a markdown table with ASCII bar indicators so that the
 * relative magnitude of statistics is immediately visible in plain text.
 */

export const getStaticPaths: GetStaticPaths = async () => {
	const posts = await getCollection("posts");
	return posts.map((post: any) => ({
		params: { slug: post.slug },
		props: { post },
	}));
};

export const GET: APIRoute = async ({ props }) => {
	const { post } = props as { post: CollectionEntry<"posts"> };
	const markdown = postToAgentMarkdown(post);
	return new Response(markdown, {
		headers: { "Content-Type": "text/markdown; charset=utf-8" },
	});
};

// ── MDX → agent markdown conversion ──────────────────────────────────────────

function postToAgentMarkdown(post: CollectionEntry<"posts">): string {
	const { title, date, author, description, tags } = post.data;
	const body = post.body; // raw MDX body without frontmatter

	const lines: string[] = [];

	// Header
	lines.push(`# ${title}`, "");
	lines.push(`_By ${author} · ${date}_`, "");
	if (description) lines.push(`> ${description}`, "");
	else if (tags.length > 0) lines.push(`> Tags: ${tags.join(", ")}`, "");
	lines.push("", "---", "");

	// Rendering note for AI assistants
	lines.push(
		"> **Rendering note for AI assistants:** This NBA article contains structured",
		"> statistical data. Sections marked with 📊 are visualization blocks — please",
		"> render them as comparison tables with visual bar indicators (e.g. `████░░░░`)",
		"> so readers can clearly see relative differences between players.",
		"",
		"---",
		"",
	);

	lines.push(convertMdxBody(body).trim(), "");
	return lines.join("\n");
}

function convertMdxBody(body: string): string {
	let text = body;

	// Remove HeroImage (header already rendered above)
	text = text.replace(/<HeroImage\b[\s\S]*?\/>\n?/g, "");

	// QuoteBlock
	text = text.replace(
		/<QuoteBlock([\s\S]*?)>([\s\S]*?)<\/QuoteBlock>/g,
		(_, attrs: string, children: string) => {
			const attribution = attr(attrs, "attribution") ?? "";
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
		const value = attr(attrs, "value") ?? "";
		const label = attr(attrs, "label") ?? "";
		const player = attr(attrs, "playerName") ?? "";
		return ["", `📊 **STAT: ${player ? player + " — " : ""}${value}**`, `> ${label}`, ""].join(
			"\n",
		);
	});

	// PlayerCompare
	text = text.replace(/<PlayerCompare([\s\S]*?)\/>/g, (_, attrs: string) => {
		const season = attr(attrs, "season") ?? "";
		const p1 = playerObj(attrs, "player1");
		const p2 = playerObj(attrs, "player2");
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
				const v1s = v1 !== undefined ? `${v1}${suffix} ${bar(v1, max)}` : "—";
				const v2s = v2 !== undefined ? `${v2}${suffix} ${bar(v2, max)}` : "—";
				return `| ${label} | ${v1s} | ${v2s} |`;
			});

		const c1 = `${p1.name} (${p1.team})`;
		const c2 = `${p2.name} (${p2.team})`;

		return [
			"",
			`📊 **PLAYER COMPARISON${season ? ` — ${season}` : ""}**`,
			"",
			`| Stat | ${c1} | ${c2} |`,
			`|------|${"-".repeat(c1.length + 2)}|${"-".repeat(c2.length + 2)}|`,
			...rows,
			"",
		].join("\n");
	});

	// PlayerCard
	text = text.replace(/<PlayerCard([\s\S]*?)\/>/g, (_, attrs: string) => {
		const name = attr(attrs, "name") ?? "";
		const team = attr(attrs, "team") ?? "";
		const position = attr(attrs, "position") ?? "";
		const height = attr(attrs, "height");
		const weight = attr(attrs, "weight");
		const rows = [
			`| Team | ${team} |`,
			`| Position | ${position} |`,
			height ? `| Height | ${height} |` : "",
			weight ? `| Weight | ${weight} |` : "",
		].filter(Boolean);

		return ["", `📊 **PLAYER: ${name}**`, "", "| | |", "|---|---|", ...rows, ""].join("\n");
	});

	// ShootingSplits
	text = text.replace(/<ShootingSplits([\s\S]*?)\/>/g, (_, attrs: string) => {
		const p1Name = attr(attrs, "player1Name") ?? "Player 1";
		const p2Name = attr(attrs, "player2Name") ?? "Player 2";
		const p1Fg = numAttr(attrs, "player1FgPct");
		const p1Fg3 = numAttr(attrs, "player1Fg3Pct");
		const p1Ft = numAttr(attrs, "player1FtPct");
		const p2Fg = numAttr(attrs, "player2FgPct");
		const p2Fg3 = numAttr(attrs, "player2Fg3Pct");
		const p2Ft = numAttr(attrs, "player2FtPct");

		const splits: [string, number | undefined, number | undefined][] = [
			["FG%", p1Fg, p2Fg],
			["3P%", p1Fg3, p2Fg3],
			["FT%", p1Ft, p2Ft],
		];

		const rows = splits.map(([label, v1, v2]) => {
			const max = Math.max(v1 ?? 0, v2 ?? 0);
			const v1s = v1 !== undefined ? `${v1}% ${bar(v1, max)}` : "—";
			const v2s = v2 !== undefined ? `${v2}% ${bar(v2, max)}` : "—";
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
		const title = attr(attrs, "title") ?? "Rankings";
		const statLabel = attr(attrs, "statLabel") ?? "Value";
		const entries = entriesArray(attrs);
		const maxVal = Math.max(...entries.map((e) => e.value));

		const rows = entries.map((e) => {
			const medal =
				e.rank === 1 ? "🥇" : e.rank === 2 ? "🥈" : e.rank === 3 ? "🥉" : `${e.rank}.`;
			return `| ${medal} | ${e.name} | ${e.team} | ${e.value} ${bar(e.value, maxVal)} |`;
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

	return text;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function attr(attrs: string, name: string): string | undefined {
	return attrs.match(new RegExp(`${name}=["']([^"']+)["']`))?.[1];
}

function numAttr(attrs: string, name: string): number | undefined {
	const m = attrs.match(new RegExp(`${name}=\\{([\\d.]+)\\}`));
	return m ? parseFloat(m[1]) : undefined;
}

function bar(value: number, max: number, width = 10): string {
	if (max === 0) return "";
	const filled = Math.round((value / max) * width);
	return "█".repeat(Math.max(0, filled)) + "░".repeat(Math.max(0, width - filled));
}

interface PlayerData {
	name: string;
	team: string;
	stats: Record<string, number>;
}

function playerObj(attrs: string, prop: string): PlayerData | null {
	const token = `${prop}={{`;
	const start = attrs.indexOf(token);
	if (start === -1) return null;

	let i = start + token.length;
	let depth = 1;
	while (i < attrs.length && depth > 0) {
		if (attrs[i] === "{") depth++;
		else if (attrs[i] === "}") depth--;
		i++;
	}

	const obj = attrs.slice(start + token.length, i - 1);
	const name = obj.match(/name:\s*["']([^"']+)["']/)?.[1] ?? "";
	const team = obj.match(/team:\s*["']([^"']+)["']/)?.[1] ?? "";
	const statsStr = obj.match(/stats:\s*\{([^}]+)\}/)?.[1] ?? "";
	const stats: Record<string, number> = {};
	for (const m of statsStr.matchAll(/(\w+):\s*([\d.]+)/g)) {
		stats[m[1]] = parseFloat(m[2]);
	}
	return { name, team, stats };
}

function entriesArray(attrs: string): { rank: number; name: string; team: string; value: number }[] {
	const token = "entries={[";
	const start = attrs.indexOf(token);
	if (start === -1) return [];

	let i = start + token.length;
	let depth = 1;
	while (i < attrs.length && depth > 0) {
		if (attrs[i] === "[") depth++;
		else if (attrs[i] === "]") depth--;
		i++;
	}

	const arr = attrs.slice(start + token.length, i - 1);
	return [...arr.matchAll(/\{([^}]+)\}/g)].map((m) => {
		const obj = m[1];
		return {
			rank: parseInt(obj.match(/rank:\s*(\d+)/)?.[1] ?? "0", 10),
			name: obj.match(/name:\s*["']([^"']+)["']/)?.[1] ?? "",
			team: obj.match(/team:\s*["']([^"']+)["']/)?.[1] ?? "",
			value: parseFloat(obj.match(/value:\s*([\d.]+)/)?.[1] ?? "0"),
		};
	});
}
