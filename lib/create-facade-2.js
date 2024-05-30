// # create-facade-2.js
import hash from 'hash-sum';
import path from 'node:path';
import { stringifyRequest, attrsToQuery } from './utils.js';
import { getDescriptor, setDescriptor } from './descriptor-cache.js';

// # createFacade(opts)
// This function is called when we're actually transforming the .vue file 
// source. We'll look at the queries here in the url to determine what we're 
// going to return. If we have to return the 
export default function createFacade(opts = {}) {

	// Parse an SFC descriptor. We'll always need this, regardless of what 
	// we're about to do anyway.
	const { source, filename, filePath, sourceRoot } = opts;
	const descriptor = getDescriptor(filePath, {
		source,
		sourceRoot,
		version: 2,
	});

	// Allright, reaching this point means that we're processing the facade vue 
	// component. Let's generate the transform code for this now.
	let hasScoped = descriptor.styles.some(s => s.scoped);
	let hasFunctional = (
		descriptor.template &&
		descriptor.template.attrs.functional
	);

	// Add the code importing the template.
	const id = hash(filePath);
	let templateImport = `var render, staticRenderFns;`;
	if (descriptor.template) {

		// IMPORTANT! If we're loading the template from an external file, we 
		// have to store the desrciptor in the cache under that filename as well.
		let src, srcQuery;
		if (descriptor.template.src) {
			let dir = path.dirname(filePath);
			let templatePath = path.resolve(dir, descriptor.template.src);
			setDescriptor(templatePath, descriptor);
			let id = descriptor.template.src;
			src = `${id}`;
			srcQuery = '&src=true';
		} else {
			src = `./${filename}`;
			srcQuery = '';
		}
		let attrsQuery = attrsToQuery(descriptor.template.attrs);
		let query = `?vue&type=template${attrsQuery}${srcQuery}`;
		let req = stringifyRequest(src + query);
		templateImport = `import { render, staticRenderFns } from ${req};`;
	}

	// Add the code that is responsible for requiring the script.
	let scriptImport = `var script = {};`;
	let { script, scriptSetup } = descriptor;
	if (script || scriptSetup) {
		let src;
		let srcQuery = '&src=true';
		if (script && script.src) {
			src = script.src;
		} else if (scriptSetup && scriptSetup.src) {
			src = scriptSetup.src;
		} else {
			src = `./${filename}`;
			srcQuery = '';
		}
		let attrsQuery = attrsToQuery((scriptSetup || script).attrs, 'js');
		let query = `?vue&type=script${attrsQuery}${srcQuery}`;
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
