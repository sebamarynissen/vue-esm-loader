// # compile-template.js
import { fileURLToPath } from 'node:url';
import { resolveCompiler } from './compiler.js';
import { getDescriptor } from './descriptor-cache.js';
import resolveScript from './resolve-script.js';
import { major, minor } from './vue-version.js';

// # compile(tpl, ctx)
// Compiles the template. Note that we still need to check a few things in the 
// url query, for example to know whether the template is functional.
export default function compile(tpl, ctx) {

	// Parse the query string from the url first and build the compiler 
	// options from it.
	let url = new URL(ctx.url);
	let query = url.searchParams;
	let isFunctional = query.get('functional') !== null;
	let compilerOptions = {};

	// IMPORTANT! When using <script setup> in Vue 2.7, we have to explicitly 
	// inject the bindings into the template compiler. Therefore we need to 
	// lookup the dedcriptor in the cache if that's the case.
	let bindings;
	if (major === 2 && minor >= 7) {
		let filePath = fileURLToPath(String(url));
		let descriptor = getDescriptor(filePath);
		if (!descriptor) {
			console.warn([
				`[WARN] No descriptor found for file "${filePath}". This is likely because you're using an external template for which we couldn't find the corresponding .vue file. Exports from <script setup> might not be available. It is recommended to not use external templates in combination with <script setup>.`,
			].join('\n'));
		}
		if (descriptor.scriptSetup) {
			let script = resolveScript(descriptor);
			bindings = script.bindings;
		}
	}

	const { compiler, templateCompiler } = resolveCompiler();
	let source = String(tpl);
	let compiled = compiler.compileTemplate({
		source,
		compilerOptions,
		isFunctional,
		...templateCompiler && { compiler: templateCompiler() },
		...query.get('id') !== null && { id: query.get('id') },
		...bindings && { bindings },
	});

	// At last return the code. IMPORTANT! In v2 we have to add the exports 
	// ourselves*, but not in v3!
	if (major === 2) {
		return [
			compiled.code,
			`export { render, staticRenderFns };`,
		].join('\n');
	} else {
		return compiled.code;
	}

}
