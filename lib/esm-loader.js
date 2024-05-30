// # esm-loader.js
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import hash from 'hash-sum';
import transformMain from './transform-main.js';
import compileTemplate from './compile-template.js';
import resolveScript from './resolve-script.js';
import { getDescriptor } from './descriptor-cache.js';

// # load(req, ctx, nextLoad)
export async function load(req, ctx, nextLoad) {

	// Check if the file matches the .vue extension - though we need to support 
	// more extensions later on with the initialize hook.
	let url = new URL(req);
	let query = url.searchParams;
	if (!url.pathname.endsWith('.vue') && !query.has('vue')) {
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
		return wrap(transformMain(source, { url }));
	}

	// If we reach this point, it means we have to return the source code for 
	// the template, the script, or even a custom block. Note that we ignore 
	// styles on Node, they make no sense in Node obviously.
	const filePath = fileURLToPath(req);
	const filename = path.basename(filePath);
	const descriptor = getDescriptor(filename, { source });
	const scopeId = hash(filePath);
	source = selectBlock(descriptor, query, scopeId);

	// We're not done yet. If we're dealing with the template, we still have to 
	// compile it.
	if (query.get('type') === 'template') {
		source = await compileTemplate(source, { url });
	}

	// Return at last.
	return {
		source,
		format: 'module',
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
