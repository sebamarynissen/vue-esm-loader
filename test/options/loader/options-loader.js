import hooks from 'vue-esm-loader';
import create from 'create-esm-loader';
import ts from 'typescript';
import path from 'node:path';
import process from 'node:process';

let tsConfig;
const vueTsRegex = /lang=ts/;

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

	// A working Typescript loader for Vue components.
	// The transform() code is copied from https://www.npmjs.com/package/esm-loader-typescript
	// It's not possible to use esm-loader-typescript directly because that loader is hardcoded to only process
	// files ending with ".ts" whereas the files we need to process end with ".vue?vue&type=script&lang=ts"
	{
		resolve(specifier, ctx) {
			if (!vueTsRegex.test(specifier)) {
				return;
			}
			return {
				format: 'module',
				url: new URL(specifier, ctx.parentURL).href,
			};
		},
		transform(source, ctx) {
			if (!vueTsRegex.test(ctx.url)) {
				return;
			}

			if (!tsConfig) {
				const configFileName = ts.findConfigFile(process.cwd(), ts.sys.fileExists, ctx.config || 'tsconfig.json');
				const configFile = ts.readConfigFile(configFileName, ts.sys.readFile);
				const compilerOptions = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configFileName));

				tsConfig = compilerOptions.options;
				tsConfig.inlineSourceMap = true;
				if (!tsConfig.module) tsConfig.module = ts.ModuleKind.ESNext;
			}

			const { outputText } = ts.transpileModule(String(source), {
				compilerOptions: tsConfig,
				fileName: ctx.url,
			});
			return { source: outputText };
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
