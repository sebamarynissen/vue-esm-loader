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

// Apparently Node 22 has a `navigator` global, so we can't just blindly copy it 
// anymore.
if (!('navigator' in globalThis)) {
	globalThis.navigator = dom.window.navigator;
} else {
	Object.assign(globalThis.navigator, dom.window.navigator);
}
