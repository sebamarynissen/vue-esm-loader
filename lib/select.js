import compile from './compile-template.js';

// # select(descriptor, ctx, query)
// The function that is responsible for returning the correct block. Note that 
// it's here that we're
export default function select(
	descriptor,
	ctx,
	query,
) {

	// Handling the template? Cool, but let's first compile it then.
	if (query.type === 'template') {
		let tpl = compile(descriptor.template);
		return [
			tpl.code,
			`export { render, staticRenderFns };`,
		].join('\n');
	}

	// Return the script source "as is".
	if (query.type === 'script') {
		return descriptor.script.content;
	}

	// In all other cases we'll simply export an empty string.
	return `export default "";`;

}
