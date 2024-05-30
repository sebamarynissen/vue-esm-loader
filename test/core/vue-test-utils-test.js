// # vue-test-utils-test.js
import { mount } from '@vue/test-utils';
import { expect } from 'chai';
import Person from './files/person.vue';
import { major } from '../version.js';

describe('Using vue-test-utils', function() {

	before(function() {
		this.mount = function(Component, opts = {}) {
			let { props, propsData, ...rest } = opts;
			return mount(Component, {
				[major === 2 ? 'propsData' : 'props']: props,
				...rest,
			});
		};
	});

	it('a Person component', function() {

		let view = this.mount(Person, {
			props: {
				person: {
					firstName: 'John',
					lastName: 'Doe',
				},
			},
		});
		expect(view.vm.fullName).to.equal('John Doe');

	});
});
