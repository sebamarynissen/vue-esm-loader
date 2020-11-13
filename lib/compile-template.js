// # compile-template.js
import { parse as parseURL } from 'url';
import qs from 'querystring';
import { compileTemplate } from '@vue/component-compiler-utils';
import { compiler } from './utils.js';

// # compile(tpl, ctx)
// Compiles the template. Note that we still need to check a few things in the 
// url query, for example to know whether the template is functional.
export default function compile(tpl, ctx) {

	// Parse the query string from the url first and build the compiler 
	// options from it.
	let url = new parseURL(ctx.url);
	let query = qs.parse(url.query || '');
	let isFunctional = Boolean(query.functional);
	let compilerOptions = {};

	let source = String(tpl);
	let compiled = compileTemplate({
		source,
		compiler,
		compilerOptions,
		isFunctional,
	});

	// At last return the code.
	return [
		compiled.code,
		`export { render, staticRenderFns };`,
	].join('\n');

}
