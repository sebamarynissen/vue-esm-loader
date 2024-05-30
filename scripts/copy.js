import fs from 'node:fs';
import path from 'node:path';

const files = [
	'README.md',
	'LICENSE',
];

for (let file of files) {
	fs.copyFileSync(
		path.resolve(import.meta.dirname, '..', file),
		path.resolve(import.meta.dirname, '../packages/vue-esm-loader', file),
	);
	console.log(`Copied ${file}`);
}
