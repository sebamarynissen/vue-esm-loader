// # utils.js
import qs from 'node:querystring';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

export function stringifyRequest(req) {
	return JSON.stringify(req);
}

const ignore = [
	'id',
	'index',
	'src',
	'type',
];
export function attrsToQuery(attrs, langFallback) {
	let query = ``;
	for (let [name, value] of Object.entries(attrs)) {
		if (!ignore.includes(name)) {
			query += `&${qs.escape(name)}=${value ? qs.escape(String(value)) : ``}`;
		}
	}
	if (langFallback && !('lang' in attrs)) {
		query += `&lang=${langFallback}`;
	}
	return query;
}
