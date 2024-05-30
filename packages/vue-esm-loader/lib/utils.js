// # utils.js
import qs from 'node:querystring';

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
