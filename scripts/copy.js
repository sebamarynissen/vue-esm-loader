import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dirname = path.dirname(fileURLToPath(import.meta.url));

const files = [
	'README.md',
	'LICENSE',
];

for (let file of files) {
	fs.copyFileSync(
		path.resolve(dirname, '..', file),
		path.resolve(dirname, '../packages/vue-esm-loader', file),
	);
	console.log(`Copied ${file}`);
}
