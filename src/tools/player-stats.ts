import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Player stats tools have been removed. NBA data is no longer fetched from an
// external API. Instead, Claude uses its own knowledge of player statistics
// and bakes literal values into MDX component props.
export function registerPlayerStatsTools(_server: McpServer) {
	// no-op: tools removed in favour of Claude's built-in knowledge
}
