// # compiler.js
import { createRequire } from 'node:module';
import { major, minor } from './vue-version.js';
const require = createRequire(import.meta.url);

// # resolveCompiler()
let cached;
export function resolveCompiler() {

	// If we already resolved the compiler before, do nothing obviously.
	if (cached) return cached;

	// Check 2.7.
	if (major === 2 && Number(minor) < 7) {
		return (cached = {
			compiler: require('@vue/component-compiler-utils'),
			templateCompiler: () => loadTemplateCompiler(),
		});
	}

	// If we want to keep support for Vue < 2.7, we have to request 
	// `vue-template-compiler` here.
	return (cached = {
		compiler: getSFCCompiler(),
		templateCompiler: undefined,
	});

}

let templateCompiler;
function loadTemplateCompiler() {
	if (templateCompiler) return templateCompiler;
	return (templateCompiler = require('vue-template-compiler'));
}

// Vue 3.2.13+ ships the SFC compiler directly under the vue package, but we 
// have to support versions below that as well.
function getSFCCompiler() {
	try {
		return require('vue/compiler-sfc');
	} catch {
		try {
			return require('@vue/compiler-sfc');
		} catch (e) {
			throw new Error(`vue-esm-loader requires @vue/compiler-sfc to be present in the dependencies! Please install vue >=3.2.13`);
		}
	}
}
