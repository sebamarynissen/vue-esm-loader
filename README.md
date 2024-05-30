# vue-esm-loader

> A custom loader for importing Vue single-file components

## What is vue-esm-loader?

Testing Vue single-file components [can be hard to setup](https://vue-test-utils.vuejs.org/installation/#using-other-test-runners).
Basically you need to use a build tool to be able to test them which can be difficult to properly configure.
If you're using [Vite](https://vitejs.dev/), you can use [Vitest](https://vitest.dev/) for testing, but sometimes it's just easier to use good ol' mocha.

In Node [it is possible to write custom loader hooks](https://nodejs.org/api/module.html#customization-hooks) which allow you to *natively* import `.vue` files and transpile them on the fly, avoiding the need for a build tool to test your Vue single-file components on Node.
This is exactly what `vue-esm-loader` does.

In that way, you can compare it to [@vitejs/plugin-vue](https://www.npmjs.com/package/@vitejs/plugin-vue) for Vite, or [vue-loader](https://www.npmjs.com/package/vue-loader) for webpack, but then to natively import `.vue` files in Node.

## Installation

```
npm install --save-dev vue-esm-loader
```

## Usage

If you're only importing `.vue` files, you can use it as a standalone loader as

```
node --import vue-esm-loader/register ./your/file.js
```

so that you can do

```js
// # ./your/file.js
import Component from './component.vue';
```

However, most of the time you will probably be using `vue-esm-loader` in composition with other loaders, which can be done [by manually registering](https://nodejs.org/api/module.html#customization-hooks) `vue-esm-loader`:

```js
// # setup-loader.js
import { register } from 'node:module';
import * as vue from 'vue-esm-loader';

vue.register();
register('another-loader', import.meta.url);
```

and then

```
node --import ./setup-loader.js ./your-file.js
```

Using the `register()` function manually also allows you to customize the loader's behavior.
For example, if for some reason you're also using `.vuex` as an extension, you can set it up as

```js
// # setup-loader.js
import * as vue from 'vue-esm-loader';

vue.register({
  include: [/\.vuex?$/],
  exclude: [/\.ce\.vue$/],
  transformAssetUrls: {},
  compilerOptions: {
    whitespace: 'preserve',
  },
});
```

If you're using `vue-esm-loader` with [mocha](https://npmjs.com/package/mocha) to test your `.vue` files, you can create a `.mocharc.cjs` file

```js
// .mocharc.cjs
module.exports = {

  // As standalone loader with default options
  'import': 'vue-esm-loader/register',

  // In composition with other loaders
  'import': './setup-loader.js',

};
```

## TypeScript support

Using TypeScript in your `.vue` files is supported out of the box.
For example
```vue
<template>
  <p>Hello {{ name }}!</p>
</template>

<script lang="ts" setup>
const name : string = 'Vue';
</script>
```
will just work, even if you don't have setup a loader for `.ts` files.
`vue-esm-loader` uses [esbuild](https://www.npmjs.com/package/esbuild) under the hood to strip the types and output pure JS.
Note that it **does not** do type checking for you!

Note that *importing* `.ts` files is not supported out of the box.
In order for this to work, you need to compose it with a loader that is able to handle `.ts` files - see the example below.

## Examples

### Importing TypeScript files

If you are importing `.ts` files from within your `.vue` files, you need to setup a separate loader that can handle `.ts` files.
For example,

```vue
<template>
  <p>Hello {{ name }}!</p>
</template>

<script lang="ts" setup>
import { name } from './person.ts';
</script>
```

```ts
// # person.ts
export const name : string = 'TypeScript';
```

can be loaded with

```js
// # setup-loader.js
import * as vue from 'vue-esm-loader';
import * as tsx from 'tsx/esm/api';

// IMPORTANT! tsx needs to be registered **after** vue-esm-loader, otherwise
// tsx will try to transform .vue files!
vue.register();
tsx.register();
```

### Compiling markdown to .vue

If you want to compile markdown to `.vue` files like [Vitepress](https://vitepress.dev/) does, for example

```md
# Hello

This is some **Markdown**.
```

then you can use the following loader configuration

```js
// # setup-loader.js
import { register } from 'node:module';
import * as vue from 'vue-esm-loader';

// Register your markdown loader **before** vue-esm-loader so that it will 
// transform markdown to vue first, and then have it processed by vue-esm-loader.
register('./markdown-loader.js', import.meta.url);
vue.register({

  // Both .vue and .md files have to be processed by vue-esm-loader.
  // You can use either a regex or a glob.
  include: [/\.vue$/, '**/*.md'],

});
```

```js
// # markdown-loader.js
import marked from 'marked';

export async function load(req, ctx, nextLoad) {
  let url = new URL(req);
  if (url.pathname.endsWith('.md')) {
    let { source } = await nextLoad(req, { format: 'module' });
    return {
      source: `<template>${marked(String(source)}</template>`,
      format: 'module',
    };
  }

  // Use the default loader for files with no .md extension.
  return nextLoad(req, ctx);

}
```

### Using an html preprocessor

Most html preprocessors are supported out of the box, though you need to make sure to have them in your `node_modules` folder.
For example, if you'd like to write your templates with [pug](https://www.npmjs.com/package/pug), you can do so

```vue
<template lang="pug">
div
  p We're using {{ template }}
</template>

<script setup>
const template = 'Pug';
</script>
```

provided that you have installed pug with `npm install pug`.

## Migration from v0.x

Versions `0.x` initially relied on [create-esm-loader](https://www.npmjs.com/package/create-esm-loader) to make `vue-esm-loader` composable with other loaders.
Since the advent of the `register()` api of `node:module`, this is now no longer necessary.
This also means that the minimum supported Node.js version is `^18.19.0 || >= 20.6.0` as `module.register()` is not available in earlier versions.

If you are still using [create-esm-loader](https://www.npmjs.com/package/create-esm-loader) for other loaders, they can normally be combined just fine provided that you register the `create-esm-loader`-created loader **last**:

```js
// # setup-loader.js
import * as vue from 'vue-esm-loader';

vue.register();
register('./cesm-loader.js', import.meta.url);
```

```js
// # cesm-loader.js
import create from 'create-esm-loader';

export const {
	resolve,
	load,
} = await create(config);
```

Note that with `module.register()` loaders are now easily composable, so there is actually no need anymore for [create-esm-loader](https://www.npmjs.com/package/create-esm-loader), and hence it is advised to migrate away from it.
This might not be possible straight away if you rely on loaders that use [create-esm-loader](https://www.npmjs.com/package/create-esm-loader) under the hood, but you are invited to make the maintainers of these loaders aware of this.

If you're using [node-esm-loader](https://www.npmjs.com/package/node-esm-loader), then it is advised to import multiple files

```js
node --import ./setup-loader.js --import node-esm-loader/register ./your-file.js
```

until you no longer need any loaders that rely on [create-esm-loader](https://www.npmjs.com/package/create-esm-loader) under the hood.

## How does it work?

`vue-esm-loader` is heavily inspired by the official [@vitejs/plugin-vue](https://www.npmjs.com/package/@vitejs/plugin-vue) for Vite.
If you're familiar with how this plugin works works, you'll find `vue-esm-loader` to be really familiar.
Basically it transforms the `.vue` file in the `load()` hook into something that looks to Node like
```js
import { render, staticRenderFns } from './file.vue?type=template';
import script from './file.vue?type=script';

export default {
  ...script,
  render,
  staticRenderFns,
};
```
and then subsequently the querystring is sniffed to return the correct code blocks, while also compiling the template using `@vue/compiler-sfc` in the `load()` hook.
