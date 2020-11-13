// # utils.js
// IMPORTANT! We obviously make use of Vue template compiler, but the problem 
// is that when working with jsdom we can't require vue **before** setting up 
// jsdom. The problem is that vue-template-compiler actually *does* require 
// vue, but only for checking its version. Hence we should circumvent this.
import qs from 'querystring';
import compiler from 'vue-template-compiler/build.js';

export * from './compiler-utils.js';
export { compiler };

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
