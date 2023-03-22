// # compile-template.js
import { parse as parseURL } from 'node:url';
import qs from 'node:querystring';
import { resolveCompiler } from './compiler.js';
import { major } from './vue-version.js';

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

	const { compiler, templateCompiler } = resolveCompiler();
	let source = String(tpl);
	let compiled = compiler.compileTemplate({
		source,
		compilerOptions,
		isFunctional,
		...templateCompiler && { compiler: templateCompiler() },
		...query.id && { id: query.id },
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
