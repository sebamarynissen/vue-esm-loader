// # loader.js
import { URL, pathToFileURL } from 'url';
import load from './load.js';
const extensions = /\.vue($|\?vue&(.*))/;
const baseURL = pathToFileURL(`${process.cwd()}`).href;

// # resolve()
// Ensures that `.vue` files get properly resolved by the node.js loader.
export function resolve(specifier, ctx, defaultResolve) {
	let { parentURL = baseURL } = ctx;
	if (extensions.test(specifier)) {
		return {
			url: new URL(specifier, parentURL).href,
		};
	}
	return defaultResolve(specifier, ctx, defaultResolve);
}

// # getFormat()
// Returns that `.vue` files are modules.
export function getFormat(url, ctx, defaultGetFormat) {
	if (extensions.test(url)) {
		return {
			format: 'module',
		};
	}
	return defaultGetFormat(url, ctx, defaultGetFormat);
}

// # transformSource()
// The function that will call the compiler function that will do the actual 
// heavy lifting for us.
export function transformSource(source, ctx, defaultTransformSource) {
	if (extensions.test(ctx.url)) {
		return {
			source: load(source, ctx),
		};
	}
	return defaultTransformSource(source, ctx, defaultTransformSource);
}
