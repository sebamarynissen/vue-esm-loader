import { register } from 'node:module';

register('./markdown-loader.js', import.meta.url);
register('vue-esm-loader', import.meta.url, {
	data: {
		include: [/\.vuex?$/, '**/*.md'],
	},
});
