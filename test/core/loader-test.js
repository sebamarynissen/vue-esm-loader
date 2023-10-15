// # loader-test.js
import semver from 'semver';
import { expect } from 'chai';
import version from '#vue/version';

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
				return (await import(`./files/${id}`)).default;
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
			if (version === 2) {
				expect(component.staticRenderFns).to.be.an('array');
				expect(component._compiled).to.be.true;
			}
		});

		it('nested.vue', async function() {
			let { components } = await this.require();
			let tpl = await this.require('template.vue');
			expect(components.Component).to.equal(tpl);
		});

		it('scoped.vue', async function() {
			const component = await this.require();
			expect(component._scopedId || component.__scopeId).to.be.ok;
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
			expect(component.setup({}, {
				expose() {},
			}).foo).to.equal('baz');
			
			// Test that the components are properly available when using script 
			// setup. Depends on whether we're using 2 or 3 obviously.
			const { render } = component;
			if (semver.satisfies(version, '2')) {
				let result = render.call({
					_self: {
						_c: (...args) => args,
						_setupProxy: {
							CustomComponent: 'this is it',
						},
					},
					_v: x => x,
				}).flat(Infinity);
				expect(result).to.include('this is it');
			}

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

		it('multi-root.vue', async function() {
			this.semver('>=3');
			await this.require();
		});

	});

});
