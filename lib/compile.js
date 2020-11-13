// # compile.js
import utils from '@vue/component-compiler-utils';
import compiler from 'vue-template-compiler';
import compileTemplate from './compile-template.js';
const { parse } = utils;

// # compile(source)
// The function that does the actual heavy lifting of compiling a Vue SFC into 
// usable JavaScript.
export default function compile(source) {

	// Parse the different blocks.
	let descriptor = parse({
		source,
		compiler,
		needMap: false,
	});

	// Compile the template.
	let tpl = compileTemplate(descriptor.template, {
		compiler,
	});
	console.log(tpl);

	return `export default function() {}`;

};
