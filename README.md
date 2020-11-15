# vue-esm-loader

> A Node module loader for importing Vue single-file components

## What is vue-esm-loader?

Testing Vue single-file components [can be hard to setup](https://vue-test-utils.vuejs.org/installation/#using-other-test-runners).
Basically you need to use a build tool to be able to test them which can be difficult to properly configure.

Since version 13.2, Node supports ESM natively without `--experimental-modules`.
It also provides [a way of creating custom loaders](https://nodejs.org/api/esm.html#esm_experimental_loaders), which can be used like
```
node --experimental-loader=path/to/loader.js file.js
```

This project aims to provide a custom loader that is able to load `.vue` single-file components in Node *natively*, avoiding the need for a build tool to test your Vue single-file components.

## Usage

**BEWARE** As module loaders are still experimental in Node, so is `vue-esm-loader`.
It is stated that the loaders api [may still change](https://nodejs.org/api/esm.html#esm_experimental_loaders), so there's always a possibility of having this module suddenly stopped working in future Node versions!
Given that module loaders only work with ES modules, it requires your code to be written in ESM format as well.
This also means that you [must use file extensions](https://nodejs.org/api/esm.html#esm_mandatory_file_extensions) in your code, where this typically isn't a requirement with most bundlers.
```vue
<template>
  <div>{{ foo }}</div>
</template>
<script>
// File extension is mandatory here for it to work on Node!
import SomeFile from './some-file.js';

export default {
  data() {
    return { foo: 'bar' };
  },
};
</script>
```

That said, installation is as easy as
```
npm install vue-esm-loader
```
and subsequently the loader can be used as
```
node --experimental-loader=vue-esm-loader path/to/your/file.js
```
so that you can import `.vue` files as
```js
import Component from './component.vue';
```

Given that you will probably use it with a testing framework, you need to find a way to pass this node flag to it somehow.
With [mocha](https://www.npmjs.com/package/mocha) this can be done as
```
mocha --experimental-loader=vue-esm-loader
```

If you want to test a single test file without the hassle of always typing `--experimental-loader=vue-esm-loader`, I suggest using a `.mocharc.cjs` file:
```js
// .mocharc.cjs
'use strict';
module.exports = {
  'experimental-loader': 'vue-esm-loader',
};
```

## How does it work?

`vue-esm-loader` is heavily inspired by the official [vue-loader](https://www.npmjs.com/package/vue-loader) for webpack.
If you're familiar with how `vue-loader` works, you'll find `vue-esm-loader` to be really familiar.
Basically it transforms the `.vue` file in the `getSource()` hook into something that looks to Node like
```js
import { render, staticRenderFns } from './file.vue?type=template';
import script from './file.vue?type=script';

export default {
  ...script,
  render,
  staticRenderFns,
};
```
and then subsequently the querystring is sniffed to return the correct code blocks, while also compiling the template using `vue-template-compiler` in the `transformSource()` hook.
