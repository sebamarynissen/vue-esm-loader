// # compile-template.js
import { compileTemplate } from '@vue/component-compiler-utils';
import compiler from 'vue-template-compiler';

// # compile(tpl, opts)
// Compiles the template.
export default function compile(tpl, opts) {
	let source = String(tpl);
	return compileTemplate({
		source,
		compiler,
	});
}
