// # loader-test.js
import path from 'node:path';
import Vue from 'vue';
import { expect } from 'chai';

describe('The vue esm loader', function() {

	context('loads .vue files', function() {

		before(function() {
			this.require = async function(id) {
				let filePath = path.join('./files', id);
				return await import(filePath);
			};
		});

		beforeEach(async function() {
			let { title } = this.currentTest;
			let module = await this.require(title);
			this.component = module.default;
		});

		it('script.vue', function() {
			expect(this.component.data()).to.eql({
				foo: 'bar',
			});
		});

		it('template.vue', function() {
			expect(this.component.render).to.be.a('function');
			expect(this.component.staticRenderFns).to.be.an('array');
			expect(this.component._compiled).to.be.true;
		});

		it('nested.vue', async function() {
			let { components } = this.component;
			let { default: tpl } = await this.require('template.vue');
			expect(components.Component).to.equal(tpl);
		});

		it('scoped.vue', function() {
			expect(this.component._scopedId).to.be.ok;
		});

		it('functional.vue', function() {
			expect(this.component.functional).to.be.true;
			const { component } = this;
			let props = { foo: 'bar' };
			let main = new Vue({
				render(h) {
					return h(component, { props });
				},
			});
			let el = main.$mount();
		});

		it('setup.vue', function() {
			const { component } = this;
			expect(component.foo).to.equal('bar');
			expect(component.setup().foo).to.equal('baz');
		});

		it('external-script.vue', function() {
			expect(this.component.data()).to.eql({
				foo: 'bar',
			});
		});

		it('external-template.vue', function() {
			let { render } = this.component;
			expect(render).to.be.a('function');
		});

	});

});
