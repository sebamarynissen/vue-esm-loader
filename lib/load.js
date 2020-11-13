// # load.js
import path from 'path';
import { fileURLToPath, parse as parseURL } from 'url';
import qs from 'querystring';
import hash from 'hash-sum';
import compiler from 'vue-template-compiler';
import { parse, stringifyRequest, attrsToQuery } from './utils.js';
import selectBlock from './select.js';

// # load(buffer, ctx)
// This function is called when we're actually transforming the .vue file 
// source. We'll look at the queries here in the url to determine what we're 
// going to return. If we have to return the 
export default function load(buffer, ctx) {

	// Parse some meta info from the file url.
	const url = parseURL(ctx.url);
	const filePath = fileURLToPath(ctx.url);
	const sourceRoot = path.dirname(filePath);
	const filename = path.basename(filePath);
	const query = qs.parse(url.query || '');

	// Parse an SFC decriptor. We'll always need this, regardless of what 
	// we're about to do anyway.
	let source = String(buffer);
	let descriptor = parse({
		source,
		compiler,
		filename,
		sourceRoot,
	});

	// If we're requesting something specific, return early and use the 
	// selector function. It's here that we'll actually compile the template 
	// if required!
	if (query.type) {
		return selectBlock(
			descriptor,
			ctx,
			query,
		);
	}

	// Allright reaching this point means that we're processing the "main" vue 
	// component.
	let id = hash(filePath);
	let hasScoped = descriptor.styles.some(s => s.scoped);
	let hasFunctional = (
		descriptor.template &&
		descriptor.template.attrs.functional
	);

	// Add the code importing the template.
	let templateImport = `var render, staticRenderFns;`;
	if (descriptor.template) {
		let src;
		if (descriptor.template.src) {
			let id = descriptor.template.src;
			src = `${id}?vue`;
		} else {
			src = `./${filename}?vue&type=template`;
		}
		let query = attrsToQuery(descriptor.template.attrs);
		let req = stringifyRequest(src + query);
		templateImport = `import { render, staticRenderFns } from ${req};`;
	}

	// Add the code that is responsible for requiring the script.
	let scriptImport = `var script = {};`
	if (descriptor.script) {
		let src;
		if (descriptor.script.src) {
			src = descriptor.script.src;
		} else {
			src = `./${filename}?vue&type=script`;
		}
		let req = stringifyRequest(src);
		scriptImport = [
			`import script from ${req}`,
			`export * from ${req}`,
		].join('\n');
	}

	let code = `
${templateImport}
${scriptImport}

import normalizer from 'vue-esm-loader/normalizer';
var component = normalizer(
	script,
	render,
	staticRenderFns,
	${hasFunctional ? `true` : `false`},
	null,
	${hasScoped ? JSON.stringify(id) : `null`},
	null,
)
`.trim() + '\n';

	// Export at last.
	code += '\nexport default component.exports';
	return code;

}
