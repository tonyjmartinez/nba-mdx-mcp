/**
 * Reads the Vite-built embed.html and writes it as a TypeScript string export
 * so the Cloudflare Worker can serve it at the /embed route.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const html = readFileSync(join(root, "dist-embed", "embed.html"), "utf-8");

const escaped = html
	.replace(/\\/g, "\\\\")
	.replace(/`/g, "\\`")
	.replace(/\$\{/g, "\\${");

const output = `// AUTO-GENERATED — do not edit by hand.
// Run \`npm run build:embed\` to regenerate.
export const embedPageHtml = \`${escaped}\`;
`;

const outPath = join(root, "src", "widgets", "embed-page-html.ts");
writeFileSync(outPath, output, "utf-8");
console.log(`Embedded embed.html → ${outPath}`);
