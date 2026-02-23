/**
 * Minimal GitHub REST API client using fetch.
 * No external dependencies — safe for Cloudflare Workers.
 */

const GH = "https://api.github.com";

function headers(token: string) {
	return {
		Authorization: `Bearer ${token}`,
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
		"Content-Type": "application/json",
		"User-Agent": "nba-blog-studio-mcp/1.0",
	};
}

async function ghFetch(token: string, method: string, path: string, body?: unknown) {
	const res = await fetch(`${GH}${path}`, {
		method,
		headers: headers(token),
		body: body ? JSON.stringify(body) : undefined,
	});
	if (!res.ok) {
		const text = await res.text().catch(() => res.statusText);
		throw new Error(`GitHub API ${method} ${path} → ${res.status}: ${text}`);
	}
	if (res.status === 204) return null;
	return res.json() as Promise<unknown>;
}

// ── Repo info ─────────────────────────────────────────────────────────────────

export interface RepoInfo {
	default_branch: string;
	/** true when the repo has no commits yet */
	empty: boolean;
}

export async function getRepoInfo(token: string, owner: string, repo: string): Promise<RepoInfo> {
	const data = (await ghFetch(token, "GET", `/repos/${owner}/${repo}`)) as {
		default_branch: string;
	};
	// Check if the repo has commits by fetching the default branch ref
	try {
		await ghFetch(token, "GET", `/repos/${owner}/${repo}/git/ref/heads/${data.default_branch}`);
		return { default_branch: data.default_branch, empty: false };
	} catch {
		return { default_branch: data.default_branch, empty: true };
	}
}

// ── Single-file create/update (Contents API) ─────────────────────────────────

export async function getFileSha(
	token: string,
	owner: string,
	repo: string,
	path: string,
	branch: string,
): Promise<string | null> {
	try {
		const data = (await ghFetch(
			token,
			"GET",
			`/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
		)) as { sha: string };
		return data.sha;
	} catch {
		return null;
	}
}

export async function upsertFile(
	token: string,
	owner: string,
	repo: string,
	path: string,
	content: string,
	message: string,
	branch: string,
): Promise<void> {
	const sha = await getFileSha(token, owner, repo, path, branch);
	const body: Record<string, unknown> = {
		message,
		content: btoa(unescape(encodeURIComponent(content))), // utf-8 → base64
		branch,
	};
	if (sha) body.sha = sha;
	await ghFetch(token, "PUT", `/repos/${owner}/${repo}/contents/${path}`, body);
}

// ── Batch commit (Trees API) — used for initial repo setup ───────────────────

/**
 * Push many files in a single commit using the Git Trees API.
 * Works on both empty repos (no parent commit) and repos with history.
 */
export async function pushBatchCommit(
	token: string,
	owner: string,
	repo: string,
	branch: string,
	files: Record<string, string>,
	message: string,
	isEmptyRepo: boolean,
): Promise<void> {
	// 1. Create blobs for every file
	const treeItems: Array<{ path: string; mode: string; type: string; sha: string }> = [];

	for (const [filePath, content] of Object.entries(files)) {
		const blob = (await ghFetch(token, "POST", `/repos/${owner}/${repo}/git/blobs`, {
			content: btoa(unescape(encodeURIComponent(content))),
			encoding: "base64",
		})) as { sha: string };

		treeItems.push({
			path: filePath,
			mode: "100644",
			type: "blob",
			sha: blob.sha,
		});
	}

	let parentSha: string | undefined;
	let baseTreeSha: string | undefined;

	if (!isEmptyRepo) {
		// 2a. Get the latest commit on the branch
		const ref = (await ghFetch(
			token,
			"GET",
			`/repos/${owner}/${repo}/git/ref/heads/${branch}`,
		)) as { object: { sha: string } };
		parentSha = ref.object.sha;

		// 2b. Get the base tree SHA
		const commit = (await ghFetch(
			token,
			"GET",
			`/repos/${owner}/${repo}/git/commits/${parentSha}`,
		)) as { tree: { sha: string } };
		baseTreeSha = commit.tree.sha;
	}

	// 3. Create a tree
	const treeBody: Record<string, unknown> = { tree: treeItems };
	if (baseTreeSha) treeBody.base_tree = baseTreeSha;

	const tree = (await ghFetch(token, "POST", `/repos/${owner}/${repo}/git/trees`, treeBody)) as {
		sha: string;
	};

	// 4. Create a commit
	const commitBody: Record<string, unknown> = {
		message,
		tree: tree.sha,
	};
	if (parentSha) commitBody.parents = [parentSha];
	else commitBody.parents = [];

	const commit = (await ghFetch(
		token,
		"POST",
		`/repos/${owner}/${repo}/git/commits`,
		commitBody,
	)) as { sha: string };

	// 5. Update or create the branch ref
	if (isEmptyRepo) {
		await ghFetch(token, "POST", `/repos/${owner}/${repo}/git/refs`, {
			ref: `refs/heads/${branch}`,
			sha: commit.sha,
		});
	} else {
		await ghFetch(token, "PATCH", `/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
			sha: commit.sha,
			force: false,
		});
	}
}
