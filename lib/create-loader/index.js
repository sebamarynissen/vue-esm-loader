export default function createLoader(config) {
	return new Loader(config).hooks();
}

// # handleStack(stack, resource, ctx, defaultFunction)
// Performs a middle-ware like check of all registered handlers (called the 
// "stack") and returns the first one that returns something truthy.
class Loader {

	// ## constructor(config)
	constructor(config) {
		this.stack = config;
	}

	// ## handleStack(stack, resource, ctx, defaultFunction)
	// Loops all functions in the given stack and returns the first one that 
	// returns something truthy.
	async handleStack(stack, resource, ctx, defaultFunction) {
		let fns = this.stack[stack];
		let options = { ...ctx };
		for (let fn of [fns]) {
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
