// # setup-jsdom.js
import setup from 'jsdom-global';
setup();

// Vue needs an SVGElement, which JSDOM does not support apparently.
globalThis.SVGElement = class SVGElement {};
