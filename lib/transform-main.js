// # main.js
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { major } from './vue-version.js';
import v2 from './create-facade-2.js';
import v3 from './create-facade-3.js';

// # transformMain(buffer, ctx)
// This function is called when we're actually transforming the .vue file 
// source. We'll look at the queries here in the url to determine what we're 
// going to return. If we have to return the 
export default function transformMain(buffer, ctx) {

	// Parse some meta info from the file url.
	const { url } = ctx;
	const filePath = fileURLToPath(String(url));
	const sourceRoot = path.dirname(filePath);
	const filename = path.basename(filePath);
	const query = url.searchParams;

	// Now generate the appropriate facade based on the version of Vue we're 
	// using.
	let source = String(buffer);
	let facade = major === 2 ? v2 : v3;
	return facade({
		source,
		sourceRoot,
		url,
		filePath,
		filename,
		query,
		ctx,
	});

}
