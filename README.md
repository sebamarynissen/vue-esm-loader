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
[It is stated that](https://nodejs.org/api/esm.html#esm_experimental_loaders) the loaders api may still change, so there's always a possibility of this module having suddenly stopped working in future Node versions!
Given that module loaders only work with ES modules, it requires your code to be written in ESM format as well.

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

## How does it work?

`vue-esm-loader` is heavily inspired the official [vue-loader](https://www.npmjs.com/package/vue-loader) for webpack.
If you're familiar with how `vue-loader` works, you'll find `vue-esm-loader` to be really familiar.
It basically uses the Node loader api to register certain hooks to alter how `.vue` files should be treated and then uses [vue-template-compiler](https://www.npmjs.com/package/vue-template-compiler) to do the compilation of the html template.
