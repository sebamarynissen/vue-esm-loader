// # descriptor-cache.js
import fs from 'node:fs';
import { resolveCompiler } from './compiler.js';
import vueVersion from './vue-version.js';

const cache = new Map();

// # getDescriptor(filename, opts)
// The descriptor cache is something we need to get <script setup> working 
// properly. The problem is that the bindings from script setup need to be 
// injected in the template, but that means we need to be able to load the 
// descriptor again **from within the template**. Hence we abstract away getting 
// the descriptor and cache them by filename.
export function getDescriptor(filename, opts = {}) {

	// Check the cache first.
	if (cache.has(filename)) {
		return cache.get(filename);
	}

	// If the source is somehow not known, it might be because loaders are 
	// running in different threads. Not sure if node does this, but let's be 
	// sure.
	const {
		source = fs.readFileSync(filename),
		version = vueVersion,
	} = opts;

	// Create the descriptor based on the version.
	if (version === 2) {
		const { sourceRoot } = opts;
		const { compiler, templateCompiler } = resolveCompiler();
		let descriptor = compiler.parse({
			source,
			filename,
			sourceRoot,
			...templateCompiler && { compiler: templateCompiler() },
		});
		cache.set(filename, descriptor);
		return descriptor;
	}

	// Vue 3 by default.
	const { compiler } = resolveCompiler();
	let { descriptor } = compiler.parse(source, { filename });
	cache.set(filename, descriptor);
	return descriptor;

}

// # setDescriptor(filename, descriptor)
export function setDescriptor(filename, descriptor) {
	cache.set(filename, descriptor);
}
