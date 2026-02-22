interface Env {
	MCP_OBJECT: DurableObjectNamespace;
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
