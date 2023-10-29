import semver from 'semver';
import { expect } from 'chai';
import { mount } from '../mount.js';
import version from '#vue/version';

describe('vue-esm-loader with custom options', function() {

	before(function() {
		this.require = async function(id = this.test.title) {
			let filePath = `./files/${id}`;
			return (await import(filePath)).default;
		};
	});

	it('imports .vue files', async function() {

		const Component = await this.require('component.vue');
		expect(Component.render).to.be.ok;
		expect(Component.props).to.eql(['vue']);

	});

	it('imports .vuex files', async function() {

		const Component = await this.require('component.vuex');
		expect(Component.render).to.be.ok;
		expect(Component.props).to.eql(['vuex']);

	});

	it('imports .md that compiles compile to vue', async function() {

		const Component = await this.require('markdown.md');
		expect(Component.markdown).to.include('# This is markdown');
		expect(Component.render).to.be.ok;

		// Below will only work on Vue 3.
		if (!semver.satisfies(version, '>=2.7')) return;
		const el = await mount(Component);
		expect(el.innerHTML).to.include('Hello, Markdown');

	});

	it('compiles an custom template to html', async function() {

		const Component = await this.require('custom.vue');
		expect(Component.render+'').to.include('Hello world');

	});

});
