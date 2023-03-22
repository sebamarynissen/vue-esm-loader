// # loader-test.js
import path from 'node:path';
import semver from 'semver';
import { expect } from 'chai';
import version from '../lib/vue-version.js';

describe('The vue esm loader', function() {

	before(function() {

		this.semver = function(expr) {
			if (!semver.satisfies(version, expr)) {
				this.skip();
			}
		};

	});

	context('loads .vue files', function() {

		before(function() {
			this.require = async function(id = this.test.title) {
				let filePath = path.join('./files', id);
				return (await import(filePath)).default;
			};
		});

		it('script.vue', async function() {
			const component = await this.require();
			expect(component.data()).to.eql({
				foo: 'bar',
			});
		});

		it('template.vue', async function() {
			const component = await this.require();
			expect(component.render).to.be.a('function');
			expect(component.staticRenderFns).to.be.an('array');
			expect(component._compiled).to.be.true;
		});

		it('nested.vue', async function() {
			let { components } = await this.require();
			let tpl = await this.require('template.vue');
			expect(components.Component).to.equal(tpl);
		});

		it('scoped.vue', async function() {
			const component = await this.require();
			expect(component._scopedId).to.be.ok;
		});

		it('functional.vue', async function() {
			this.semver('<3');
			const { default: Vue } = await import('vue');
			const component = await this.require();
			expect(component.functional).to.be.true;
			let props = { foo: 'bar' };
			let main = new Vue({
				render(h) {
					return h(component, { props });
				},
			});
			main.$mount();
		});

		it('setup.vue', async function() {
			this.semver('>=2.7');
			const component = await this.require();
			expect(component.foo).to.equal('bar');
			expect(component.setup().foo).to.equal('baz');
		});

		it('external-script.vue', async function() {
			const component = await this.require();
			expect(component.data()).to.eql({
				foo: 'bar',
			});
		});

		it('external-template.vue', async function() {
			const component = await this.require();
			let { render } = component;
			expect(render).to.be.a('function');
		});

	});

});
