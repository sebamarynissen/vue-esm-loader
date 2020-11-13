// # component-compiler-utils.js
// Wrapper around @vue/component-compiler-utils so that we can use ES imports 
// on it.
import utils from '@vue/component-compiler-utils';
const {
	parse,
	compileTemplate,
	compileStyle,
	compileStyleAsync,
} = utils;

export {
	parse,
	compileTemplate,
	compileStyle,
	compileStyleAsync,
	utils as default,
};
