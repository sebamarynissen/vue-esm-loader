// # loader.js
import { URL, pathToFileURL, fileURLToPath } from 'url';
import fs from 'fs/promises';
import load from './load.js';
import compileTemplate from './compile-template.js';

const vueRegex = /\.vue($|\?vue&(.*))/;
const htmlRegex = /\.html\?vue/;
const templateRegex = /\.vue\?vue&type=template/;
const baseURL = pathToFileURL(`${process.cwd()}`).href;

// # test(url)
// The function that determines whether this url should be handled by the 
// loader.
function test(url) {
	return vueRegex.test(url) || htmlRegex.test(url);
}

// Export the object to be used with `createLoader`.
export default {

	// # resolve(specifier, ctx)
	// Ensures that `.vue` files get properly resolved by the node.js loader.
	resolve(specifier, ctx) {
		if (test(specifier)) {
			let { parentURL = baseURL } = ctx;
			return {
				url: new URL(specifier, parentURL).href,
			};
		}
	},

	// # format(url, ctx)
	// Returns that `.vue` files are to be considered as es modules, as well 
	// as `.html&vue` files.
	format(url, ctx) {
		if (test(url)) {
			return { format: 'module' };
		}
	},

	// # fetch(url, ctx)
	// This function is resopnsible for extracting the correct part of a 
	// `.vue` SFC based on the url. This function is functionally equivalent 
	// to vue-loader/lib/index.js. It's important to understand that the 
	// template compilation **does not** happen here! That's the 
	// responsibility of transformSource! This is so that we'd be able to play 
	// nice with other loaders.
	async fetch(url, ctx) {
		if (vueRegex.test(url)) {
			let path = fileURLToPath(url);
			let source = await fs.readFile(path);
			return {
				source: load(source, { url }),
			};
		}
	},

	// # transform(source, ctx)
	// The function that will actually do the source transformation of the 
	// html template.
	transform(source, ctx) {
		let { url } = ctx;
		if (templateRegex.test(url) || htmlRegex.test(url)) {
			let tpl = compileTemplate(source, ctx);
			return { source: tpl };
		}
	},

};
