// # compiler.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// # resolveCompiler()
let cached;
export function resolveCompiler() {

	// If we already resolved the compiler before, do nothing obviously.
	if (cached) return cached;

	// If we want to keep support for Vue < 2.7, we have to request 
	// `vue-template-compiler` here.
	return (cached = {
		compiler: require('vue/compiler-sfc'),
		templateCompiler: undefined,
	});

}
