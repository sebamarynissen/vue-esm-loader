import { fileURLToPath } from 'node:url';
import cp from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
const __dirname = fileURLToPath(new URL('.', import.meta.url));

for (let name of fs.readdirSync(__dirname)) {
	let handle = path.join(__dirname, name);
	let stats = fs.statSync(handle);
	if (!stats.isDirectory()) continue;
	let result = run(handle);
	process.stdout.write(result);
}

function run(dir) {
	let command = `npx mocha .`;
	return cp.execSync(command, {
		cwd: dir,
	});
}
