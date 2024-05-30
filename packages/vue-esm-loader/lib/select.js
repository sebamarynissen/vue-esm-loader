// # select(descriptor, ctx, query)
import resolveScript from './resolve-script.js';

// The function that is responsible for returning the correct block. Note that 
// it's here that we're
export default function select(
	descriptor,
	ctx,
	query,
	scopeId,
) {

	// Are we handling the template block? Return its code here.
	if (query.get('type') === 'template') {
		return descriptor.template.content;
	}

	// Return the script source "as is".
	if (query.get('type') === 'script') {
		let script = resolveScript(descriptor, ctx, query, scopeId);
		return script.content;
	}

	// In all other cases we'll simply export an empty string.
	return `export default "";`;

}
