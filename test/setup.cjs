// # setup-jsdom.js
'use strict';
const pkg = require(require.resolve('vue/package.json'));
if (pkg.version.startsWith('2')) {
	two();
}

function two() {
	require('jsdom-global')(undefined, {
		pretendToBeVisual: true,
		url: 'http://localhost',
	});

	const Vue = require('vue');
	Vue.config.productionTip = false;
	Vue.config.devtools = false;
}
