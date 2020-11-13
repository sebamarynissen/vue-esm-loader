// # vue-test-utils-test.js
import path from 'path';
import Vue from 'vue';
import { mount } from '@vue/test-utils';
import { expect } from './chai.js';

describe('Using vue-test-utils', function() {

	context('loading .vue files', function() {

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

		it('person.vue', function() {

			let view = mount(this.component, {
				propsData: {
					person: {
						firstName: 'John',
						lastName: 'Doe',
					},
				},
			});
			expect(view.vm.fullName).to.equal('John Doe');

		});

	});

});
