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

// # resolve()
// Ensures that `.vue` files get properly resolved by the node.js loader.
export function resolve(specifier, ctx, defaultResolve) {
	let { parentURL = baseURL } = ctx;
	if (test(specifier)) {
		return {
			url: new URL(specifier, parentURL).href,
		};
	}
	return defaultResolve(specifier, ctx, defaultResolve);
}

// # getFormat()
// Returns that `.vue` files are modules, as well as `.html&vue` files.
export function getFormat(url, ctx, defaultGetFormat) {
	if (test(url)) {
		return {
			format: 'module',
		};
	}
	return defaultGetFormat(url, ctx, defaultGetFormat);
}

// # getSource(url, ctx, defaultGetSource)
// This function is responsible for extracting the correct part of a `.vue` 
// SFC based on the url. This function is functionally equal to vue-loader/lib/
// index.js. It's important to understand that the template compilation **does 
// not** happen here! That's the responsibility of transformSource! This is so 
// that we'd be able to play nice with other loaders.
export async function getSource(url, ctx, defaultGetSource) {
	if (vueRegex.test(url)) {
		let path = fileURLToPath(url);
		let source = await fs.readFile(path);
		return {
			source: load(source, { url }),
		};
	}

	// Let Node handle getting the source in all other cases. Potentially that 
	// other loaders will do it.
	return defaultGetSource(url, ctx, defaultGetSource);

}

// # transformSource(source, ctx, defaultTransformSource)
// This function sets up the functionality for transforming an actual vue.js 
// template into plain JavaScript.
export function transformSource(source, ctx, defaultTransformSource) {

	// Check if this is a Vue.js template and we need to handle it.
	let { url } = ctx;
	if (templateRegex.test(url) || htmlRegex.test(url)) {

		// Compile the template and export as plain JavaScript.
		let tpl = compileTemplate(source);
		let code = [
			tpl.code,
			`export { render, staticRenderFns };`,
		].join('\n');
		return {
			source: code,
		};

	}

	// Let Node handle all the rest. This means that if you register a 
	// typescript loader it should work as well.
	return defaultTransformSource(source, ctx, defaultTransformSource);

}
