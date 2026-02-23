interface Env {
	MCP_OBJECT: DurableObjectNamespace;
	/** Anthropic API key — set via `wrangler secret put ANTHROPIC_API_KEY` */
	ANTHROPIC_API_KEY: string;
	/** Public base URL of this Worker, e.g. https://nba-mdx-mcp.example.workers.dev */
	WORKER_URL: string;
}

// Cloudflare Workers runtime globals
interface ExecutionContext {
	waitUntil(promise: Promise<any>): void;
	passThroughOnException(): void;
}

interface DurableObjectNamespace {
	newUniqueId(): DurableObjectId;
	idFromName(name: string): DurableObjectId;
	idFromString(id: string): DurableObjectId;
	get(id: DurableObjectId): DurableObjectStub;
}

interface DurableObjectId {
	toString(): string;
}

interface DurableObjectStub {
	fetch(request: Request): Promise<Response>;
}
