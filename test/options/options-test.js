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

});
