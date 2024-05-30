import * as vue from 'vue-esm-loader';
import * as md from './markdown-loader.js';

// Markdown loader needs to be registered **before** vue-esm-loader because we 
// first need to transpile markdown to vue, then transpile vue to js!
md.register();
vue.register({
	include: [/\.vuex?$/, '**/*.md'],
});
