// # setup-jsdom.js
import { JSDOM } from 'jsdom';
const dom = new JSDOM('', {
	url: 'https://www.example.com',
});

const keys = [
	'document',
	'navigator',
	'window',
	'SVGElement',
	'Element',
];
Object.assign(globalThis, Object.fromEntries(
	keys.map(key => [key, dom.window[key]]),
));

// Vue needs an SVGElement, which JSDOM does not support apparently.
globalThis.SVGElement = class SVGElement {};
