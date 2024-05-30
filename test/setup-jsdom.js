// # setup-jsdom.js
import { JSDOM } from 'jsdom';
const dom = new JSDOM('', {
	url: 'https://www.example.com',
});

const keys = [
	'document',
	'window',
	'SVGElement',
	'Element',
	'HTMLBodyElement',
];
Object.assign(globalThis, Object.fromEntries(
	keys.map(key => [key, dom.window[key]]),
));
