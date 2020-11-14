'use strict';
const path = require('path');

module.exports = {
	require: path.resolve(__dirname, './test/setup.cjs'),
	'experimental-loader': 'vue-esm-loader',
};
