export default function createLoader(config) {
	return new Loader(config).hooks();
}

// # Loader
class Loader {

	// ## constructor(config)
	constructor(config) {
		this.stack = buildStack(config);
	}

	// ## handleStack(id, resource, ctx, defaultFunction)
	// Loops all functions in the given stack and returns the first one that 
	// returns something truthy.
	async handleStack(id, resource, ctx, defaultFunction) {

		// Our stack might still be building from the configuration objct, so 
		// make sure to await it.
		let stack = await this.stack;
		let fns = stack[id] || [];
		let options = { ...ctx };
		for (let fn of fns) {
			let result = await fn(resource, options);
			if (result) {
				return result;
			}
		}
		return defaultFunction(resource, ctx, defaultFunction);

	}

	// ## hooks()
	// This function returns an object containing all Node.js loader hooks as 
	// properties so that the loader entry file can re-export them. It's here 
	// that we can do some checks of the Node version in the future if we want.
	hooks() {
		const hook = id => (...args) => this.handleStack(id, ...args);
		return {
			resolve: hook('resolve'),
			getFormat: hook('format'),
			getSource: hook('fetch'),
			transformSource: hook('transform'),
		};
	}

}

// # buildStack(config)
// This function will build an object containing the function stacks for each 
// loader hook based on the given configuration.
async function buildStack(config = {}) {

	// Ensure that the hooks that were specified are an actual array.
	let hooks = arr(config.hooks);

	// Build up our stack now.
	let keys = ['resolve', 'format', 'fetch', 'transform'];
	let stack = keys.reduce((mem, key) => ((mem[key] = []), mem), {});
	for (let def of hooks) {
		
		// The default way of specifying hooks is by using an object.
		for (let key of keys) {
			let hook = stack[key];
			let fns = arr(def[key]);
			hook.push(...fns);
		}

	}
	return stack;

}

// # arr(obj)
// Helper function for ensuring an object is an array.
function arr(obj) {
	if (!obj) {
		return [];
	} else if (!Array.isArray(obj)) {
		return [obj];
	} else {
		return obj;
	}
}
