// # utils.js
import qs from 'querystring';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export * from './compiler-utils.js';

export function stringifyRequest(req) {
	return JSON.stringify(req);
}

const ignore = [
	'id',
	'index',
	'src',
	'type',
];
export function attrsToQuery(attrs) {
	return Object.entries(attrs).reduce((mem, [name, value]) => {
		if (ignore.includes(name)) return mem;
		return mem + `&${qs.escape(name)}=${value ? qs.escape(value) : '' }`;
	}, '');
}

// IMPORTANT! We obviously need to make use of the Vue template compiler, but 
// the problem is that when working with jsdom, we can't require vue 
// **before** setting up jsdom because that would cause Vue to think that 
// there's no browser environment. The implication of this is that we can only 
// require the vue-template-compiler "just in time" because under the hoods it 
// loads Vue as well to do a version mismatch check. We circumvent this by 
// requiring it on the fly.
export function getCompiler() {
	return require('vue-template-compiler');
}
