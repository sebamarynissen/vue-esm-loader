// # loader.js
import { URL, pathToFileURL, fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import load from './load.js';
import compileTemplate from './compile-template.js';

const vueFileRegex = /\.vue$/;
const htmlRegex = /\.html\?vue/;
const baseURL = pathToFileURL(`${process.cwd()}`).href;

// # test(url, ctx)
// The function that determines whether this url should be handled by the 
// loader.
function test(url, ctx) {
	if (htmlRegex.test(url)) return true;
	let { files = vueFileRegex } = ctx;
	files = [files].flat();
	return files.some(regex => regex.test(url));
}

// # resolveSpecifier()
function resolveSpecifier(specifier, ctx) {
	const { parentURL = baseURL } = ctx;
	const require = createRequire(parentURL);
	try {
		return require.resolve(specifier);
	} catch {
		return;
	}
}

// Export the object to be used with `createLoader`.
export default {

	// # resolve(specifier, ctx)
	// Ensures that `.vue` files get properly resolved by the node.js loader. 
	// For this we'll first use the native Node's resolve algorithm to get the 
	// filename which we'll test.
	resolve(specifier, ctx) {
		const file = resolveSpecifier(specifier, ctx);
		if (test(file, ctx)) {
			return {
				url: pathToFileURL(file).href,
			};
		}
	},

	// # format(req, ctx)
	// Returns that `.vue` files are to be considered as es modules, as well 
	// as `.html&vue` files.
	format(req, ctx) {
		let url = new URL(req);
		if (test(url.pathname, ctx)) {
			return { format: 'module' };
		}
	},

	// # fetch(req, ctx)
	// This function is resopnsible for extracting the correct part of a 
	// `.vue` SFC based on the url. This function is functionally equivalent 
	// to vue-loader/lib/index.js. It's important to understand that the 
	// template compilation **does not** happen here! That's the 
	// responsibility of transformSource! This is so that we'd be able to play 
	// nice with other loaders.
	async fetch(req, ctx) {
		let url = new URL(req);
		if (test(url.pathname, ctx)) {
			let path = fileURLToPath(url.href);
			let source = await fs.readFile(path);

			// Now look at the options if there's any preprocess function 
			// specified. This will allow us to use languages that *compile* to 
			// Vue - such as markdown for example.
			const { preprocess } = ctx;
			if (preprocess) {
				let result = await preprocess(source, { url: url.href });
				if (result) source = result;
			}

			// Now use the Vue facade.
			return {
				source: load(source, { url }),
			};

		}
	},

	// # transform(source, ctx)
	// The function that will actually do the source transformation of the 
	// html template.
	transform(source, ctx) {

		// Now first make sure that this is a sub block request. If not, nothing 
		// to transform here.
		let url = new URL(ctx.url);
		let query = url.searchParams;
		if (query.get('vue') === null) return;

		// If the file extension is "html", then or it's an inline template, 
		// transform here.
		if (query.get('type') === 'template' || htmlRegex.test(url.pathname)) {
			let tpl = compileTemplate(source, ctx);
			return { source: tpl };
		}

	},

};
