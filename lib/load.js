// # load.js
import path from 'node:path';
import { fileURLToPath, parse as parseURL } from 'node:url';
import qs from 'node:querystring';
import { major } from './vue-version.js';
import v2 from './create-facade-2.js';
import v3 from './create-facade-3.js';

// # load(buffer, ctx)
// This function is called when we're actually transforming the .vue file 
// source. We'll look at the queries here in the url to determine what we're 
// going to return. If we have to return the 
export default function load(buffer, ctx) {

	// Parse some meta info from the file url.
	const url = parseURL(ctx.url);
	const filePath = fileURLToPath(ctx.url);
	const sourceRoot = path.dirname(filePath);
	const filename = path.basename(filePath);
	const query = qs.parse(url.query || '');

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
