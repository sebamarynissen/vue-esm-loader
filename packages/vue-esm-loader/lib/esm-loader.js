// # esm-loader.js
import { fileURLToPath } from 'node:url';
import hash from 'hash-sum';
import { createFilter } from '@rollup/pluginutils';
import transformMain from './transform-main.js';
import compileTemplate from './compile-template.js';
import resolveScript from './resolve-script.js';
import { getDescriptor } from './descriptor-cache.js';

// The default options, which might get overridden by `initialize`.
const defaultOptions = {
	include: /\.vue$/,
};
let options;

// # load(req, ctx, nextLoad)
export async function load(req, ctx, nextLoad) {

	// Check if the file matches the .vue extension - though we need to support 
	// more extensions later on with the initialize hook.
	const { filter } = options;
	let url = new URL(req);
	let query = url.searchParams;
	if (!filter(url.pathname, { url }) && !query.has('vue')) {
		return nextLoad(req, ctx, nextLoad);
	}

	// We only support esm in .vue files, so set format to module and then use 
	// the next loader hook in the chain to get the actual Vue source code. This 
	// will normally load the file from disk, but if another loader has been 
	// configured to load from https for example, it should work too.
	let { source } = await nextLoad(req, { format: 'module' }, nextLoad);

	// If no "vue" parameter is present in the url, it means we're dealing with 
	// the main file. Generate a facade for this.
	if (!query.has('vue')) {
		return await wrap(transformMain(source, { url }));
	}

	// If an `src` attribute was used for the template or the script, we don't 
	// have to parse a descriptor for it, but just load this "as is" with the 
	// default loading mechanism. Otherwise we have to find the right part.
	if (!query.has('src')) {
		const filePath = fileURLToPath(req);
		const descriptor = getDescriptor(filePath, { source });
		const scopeId = hash(filePath);
		source = selectBlock(descriptor, query, scopeId);
	}

	// We're not done yet. If we're dealing with the template, we still have to 
	// compile it.
	if (query.get('type') === 'template') {
		const filePath = fileURLToPath(req);
		const descriptor = getDescriptor(filePath, { source });
		source = await compileTemplate(
			source,
			descriptor,
			{ url },
		);
	}

	// Return at last.
	return await wrap(source);

}

// # initialize(customOptions)
// The initialze function allows the loader to accept options.
export async function initialize(customOptions) {
	const { include, exclude, ...rest } = {
		...defaultOptions,
		...customOptions,
	};
	options = {
		...rest,
		filter: createFilter(include, exclude),
	};
}

// # selectBlock(descriptor, query, scopeId)
// Picks the correct block from a descriptor based on the query.
function selectBlock(descriptor, query, scopeId) {

	// We only support selecting the template and the script for now.
	const type = query.get('type');
	if (type === 'template') {
		return descriptor.template.content;
	} else if (type === 'script') {
		let script = resolveScript(descriptor, query, scopeId);
		return script.content;
	}

	// In all other case, we'll simply export an empty string.
	return `export default "";`;

}

// # wrap(code)
// Wraps source code in an { source, format } object, which is what the Node.js 
// loader expects.
async function wrap(code) {
	return {
		source: await code,
		format: 'module',
	};
}
