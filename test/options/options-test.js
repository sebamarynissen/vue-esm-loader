import { expect } from 'chai';

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
		expect(Component.markdown).to.equal('# This is markdown');
		expect(Component.render).to.be.ok;

	});

});
