// # component-normalizer.js
// It's a pity that we can just import the component normalizer from 
// vue-loader as it is not recognized by Node as an esm module, even though it 
// uses export syntax!
export default function normalizeComponent(
	scriptExports,
	render,
	staticRenderFns,
	functionTemplate,
	injectStyles,
	scopeId,
	moduleIdentifier,
) {

	// Vue.extend constructor export interop.
	let options = typeof scriptExports === 'function'
		? scriptExports.options
		: scriptExports;

	// Render functions.
	if (render) {
		options.render = render;
		options.staticRenderFns = staticRenderFns;
		options._compiled = true;
	}

	// Handle functional templates.
	if (functionTemplate) {
		options.functional = true;
	}

	// ScopeId
	if (scopeId) {
		options._scopedId = 'data-v-' + scopeId;
	}

	// We're done!
	return {
		exports: scriptExports,
		options,
	};

}
