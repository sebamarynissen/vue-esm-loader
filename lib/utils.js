// # utils.js
import qs from 'querystring';
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
