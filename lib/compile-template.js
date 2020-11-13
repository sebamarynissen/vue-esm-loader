// # compile-template.js
import { compileTemplate } from '@vue/component-compiler-utils';
import compiler from 'vue-template-compiler';

// # compile(block, opts)
// Compiles the template.
export default function compile(block, opts) {
	return compileTemplate({
		source: block.content,
		compiler,
	});
}
