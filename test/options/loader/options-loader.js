import hooks from 'vue-esm-loader';
import create from 'create-esm-loader';

export const {
	resolve,
	getFormat,
	getSource,
	transformSource,
	load,
} = await create([

	// For some reason we cannot reference ourselves as "vue-esm-loader" here. 
	// No idea why, might be an issue with create-esm-loader or a problem with 
	// the node resolution algorithm. Anyway, specifying ourselves as *config* 
	// does work though, which should be equivalent.
	{
		hooks,
		options: {
			files: [/\.vuex?$/, /\.md$/],
			preprocess(input, ctx) {
				let source = String(input);
				let { pathname } = new URL(ctx.url);
				if (pathname.match(/\.md$/)) {
					return `
						<template>
							<div>${source}</div>
						</template>
						<script>
						export default {
							markdown: ${JSON.stringify(source.trim())},
						};
						</script>
					`;
				}
			},
		},
	},

]);
