/**
 * Reads all files under template/ and writes them as a TypeScript export
 * so the scaffold_blog MCP tool can return them to Claude for writing to disk.
 *
 * Run: npm run build:scaffold
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const templateDir = join(root, "template");

// Directories to skip entirely
const SKIP_DIRS = new Set(["node_modules", "dist", ".astro", ".wrangler", ".git"]);

function readDirRecursive(dir) {
	const entries = [];
	for (const name of readdirSync(dir)) {
		if (SKIP_DIRS.has(name)) continue;
		const full = join(dir, name);
		const stat = statSync(full);
		if (stat.isDirectory()) {
			entries.push(...readDirRecursive(full));
		} else {
			entries.push(full);
		}
	}
	return entries;
}

function escapeForTemplateLiteral(content) {
	return content
		.replace(/\\/g, "\\\\")
		.replace(/`/g, "\\`")
		.replace(/\$\{/g, "\\${");
}

const files = readDirRecursive(templateDir);

let output = `// AUTO-GENERATED — do not edit by hand.
// Run \`npm run build:scaffold\` to regenerate.

export type TemplateFile = { path: string; content: string };

export const TEMPLATE_FILES: TemplateFile[] = [
`;

for (const full of files) {
	// Use forward slashes for the path regardless of OS
	const rel = relative(templateDir, full).replace(/\\/g, "/");
	const content = readFileSync(full, "utf-8");
	const escaped = escapeForTemplateLiteral(content);
	output += `  { path: ${JSON.stringify(rel)}, content: \`${escaped}\` },\n`;
}

output += `];\n`;

const outPath = join(root, "src", "tools", "scaffold-files.ts");
writeFileSync(outPath, output, "utf-8");
console.log(`Embedded ${files.length} template files → ${outPath}`);
