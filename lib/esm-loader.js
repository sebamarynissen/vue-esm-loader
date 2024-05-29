// # esm-loader.js
import loadVue from './load.js';
import compileTemplate from './compile-template.js';
import selectBlock from './select.js';
import { getDescriptor } from './descriptor-cache.js';

// # load(req, ctx, nextLoad)
export async function load(req, ctx, nextLoad) {

	// Check if the file matches the .vue extension - though we need to support 
	// more extensions later on with the initialize hook.
	let url = new URL(req);
	if (!url.pathname.endsWith('.vue')) {
		return nextLoad(req, ctx, nextLoad);
	}

	// We only support esm in .vue files, so set format to module and then use 
	// the next loader hook in the chain to get the actual Vue source code.
	let { source } = await nextLoad(req, { format: 'module' }, nextLoad);

	// If the search params have "vue" set, it means we're sub-importing 
	// something.
	if (url.searchParams.has('vue') && url.searchParams.has('type')) {
		let descriptor = getDescriptor(url.href, { source });
		source = selectBlock(descriptor, {}, url.searchParams, 'abc');
		if (url.searchParams.get('type') === 'template') {
			source = compileTemplate(source, { url: req }, descriptor.bindings);
		}
	} else {
		source = await loadVue(source, { url });
	}

	// Return at last.
	return {
		source,
		format: 'module',
	};

}
