// # create-facade-3.js
import hash from 'hash-sum';
import path from 'node:path';
import { stringifyRequest, attrsToQuery } from './utils.js';
import { getDescriptor, setDescriptor } from './descriptor-cache.js';
import selectBlock from './select.js';

// # createFacade(opts)
// The generator for the facade module when working with Vue 3.
export default function createFacade(opts = {}) {
	
	// Parse an SFC descriptor in the v3 way.
	const { source, filename, filePath, query, ctx } = opts;
	const descriptor = getDescriptor(filePath, { source });

	// If we're loading a submodule from the facade module, we will return 
	// early and select the proper block. We don't build up the facade module 
	// in that case.
	let id = hash(filePath);
	if (query.get('type') !== null) {
		return selectBlock(descriptor, ctx, query, id);
	}

	// Add the code for the script.
	let propsToAttach = [];
	let scriptImport = `const script = {};`;
	let { script, scriptSetup } = descriptor;
	if (script || scriptSetup) {
		let src = script?.src || scriptSetup?.src || `./${filename}`;
		let attrsQuery = attrsToQuery((scriptSetup || script).attrs, 'js');
		let query = `?vue&type=script${attrsQuery}`;
		let req = stringifyRequest(src + query);
		scriptImport = `import script from ${req}\n`;
		scriptImport += `export * from ${req}`;
	}

	// Add the code for importing the template.
	let templateImport = ``;
	let renderFnName = 'render';
	if (descriptor.template) {

		// IMPORTANT! If we're loading the template from an external file, we 
		// have to store the descriptor in the cahce under that filename as well.
		// let src = descriptor.template.src || `./${filename}`;
		let src;
		if (descriptor.template.src) {
			let dir = path.dirname(filePath);
			let id = descriptor.template.src;
			let templatePath = path.resolve(dir, id);
			setDescriptor(templatePath, descriptor);
			src = `${id}`;
		} else {
			src = `./${filename}`;
		}
		let idQuery = `&id=${id}`;
		let attrsQuery = attrsToQuery(descriptor.template.attrs);
		let query = `?vue&type=template${idQuery}${attrsQuery}`;
		let req = stringifyRequest(src + query);
		templateImport = `import { ${renderFnName} } from ${req}`;
		propsToAttach.push([renderFnName, renderFnName]);
	}

	// Check if we have scoped styles.
	const hasScoped = descriptor.styles.some(s => s.scoped);
	if (hasScoped) {
		propsToAttach.push([`__scopeId`, `"data-v-${id}"`]);
	}

	// Concatenate the base code blcoks.
	let code = [templateImport, scriptImport]
		.filter(Boolean)
		.join('\n');

	// Finalize.
	if (Object.keys(propsToAttach).length === 0) {
		code += `\n\nconst __exports__ = script;`;
	} else {
		let props = propsToAttach.map(([key, val]) => `['${key}', ${val}]`);
		code += `\n\nimport exportHelper from 'vue-esm-loader/export-helper';`;
		code += `\nconst __exports__ = exportHelper(script, [${props}]);`;
	}
	code += `\n\nexport default __exports__;`;
	return code;

}
