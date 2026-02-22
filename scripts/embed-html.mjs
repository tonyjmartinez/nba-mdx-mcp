/**
 * Reads the Vite-built mcp-app.html and writes it as a TypeScript string export
 * so the Cloudflare Worker can serve it via registerAppResource.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const html = readFileSync(join(root, "dist-ui", "mcp-app.html"), "utf-8");

const escaped = html
	.replace(/\\/g, "\\\\")
	.replace(/`/g, "\\`")
	.replace(/\$\{/g, "\\${");

const output = `// AUTO-GENERATED — do not edit by hand.
// Run \`npm run build:ui\` to regenerate.
export const blogPreviewHtml = \`${escaped}\`;
`;

const outPath = join(root, "src", "widgets", "blog-preview-html.ts");
writeFileSync(outPath, output, "utf-8");
console.log(`Embedded mcp-app.html → ${outPath}`);
