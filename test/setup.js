// # setup-jsdom.js
import jsdom from 'jsdom-global';
import { createRequire } from 'module';
jsdom(undefined, {
	pretendToBeVisual: true,
	url: 'http://localhost',
});

const require = createRequire(import.meta.url);
const Vue = require('vue');
Vue.config.productionTip = false;
Vue.config.devtools = false;
