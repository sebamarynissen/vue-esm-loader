// # setup-jsdom.js
require('jsdom-global')(undefined, {
	pretendToBeVisual: true,
	url: 'http://localhost',
});

const Vue = require('vue');
Vue.config.productionTip = false;
Vue.config.devtools = false;
