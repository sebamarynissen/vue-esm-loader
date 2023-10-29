import hooks from 'vue-esm-loader';
import create from 'create-esm-loader';

export const {
	resolve,
	getFormat,
	getSource,
	transformSource,
	load,
} = await create([

	// Mock what a pug loader could look like. Note that create-esm-loader does 
	// not properly support webpack syntax here as it chokes on query 
	// parameters. We should fix it there and then we can update here.
	{
		resolve(specifier, ctx) {
			if (!/lang=pug/.test(specifier)) return;
			return {
				format: 'module',
				url: new URL(specifier, ctx.parentURL).href,
			};
		},
		transform(source, ctx) {
			if (!/lang=pug/.test(ctx.url)) return;
			return '<p>Hello world</p>';
		},
	},

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
						<script setup>
						const name = 'Markdown';
						</script>
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
