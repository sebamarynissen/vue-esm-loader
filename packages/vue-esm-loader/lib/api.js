// # api.js
import module from 'node:module';

// # register(options)
// Provides a programmatic api for registering the loader. This is useful if you 
// want to specify some options because it allows you to do `register(options)` 
// instead of needing to know the api of module.register(). This is also how tsx 
// registers their loader. Nice pattern!
export function register(options) {
	module.register('./esm-loader.js', {
		parentURL: import.meta.url,
		data: options,
	});
}
