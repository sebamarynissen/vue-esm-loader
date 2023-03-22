// # load.js
import path from 'node:path';
import { fileURLToPath, parse as parseURL } from 'node:url';
import qs from 'node:querystring';
import hash from 'hash-sum';
import { stringifyRequest, attrsToQuery } from './utils.js';
import selectBlock from './select.js';
import { resolveCompiler } from './compiler.js';

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

	// Parse an SFC descriptor. We'll always need this, regardless of what 
	// we're about to do anyway.
	const { compiler, templateCompiler } = resolveCompiler();
	let source = String(buffer);
	let descriptor = compiler.parse({
		source,
		filename,
		sourceRoot,
		...templateCompiler && { compiler: templateCompiler() },
	});

	// If we're loading something from the facade module, we will return early 
	// and simply return the appropriate contents. Note that WE DO NOT compile 
	// the template yet here! That's the responsibility of the `transform()` 
	// function later on! This function is only responsible for returning the 
	// correct *source*!
	if (query.type) {
		return selectBlock(
			descriptor,
			ctx,
			query,
		);
	}

	// Allright, reaching this point means that we're processing the facade vue 
	// component. Let's generate the transform code for this now.
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
	let scriptImport = `var script = {};`;
	let { script, scriptSetup } = descriptor;
	if (script || scriptSetup) {
		let src;
		if (script && script.src) {
			src = script.src;
		} else if (scriptSetup && scriptSetup.src) {
			src = scriptSetup.src;
		} else {
			src = `./${filename}`;
		}
		let attrsQuery = attrsToQuery((scriptSetup || script).attrs, 'js');
		let query = `?vue&type=script${attrsQuery}`;
		let req = stringifyRequest(src + query);
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
