// # vue-test-utils-test.js
import path from 'path';
import { mount } from '@vue/test-utils';
import { expect } from './chai.js';
import Person from './files/person.vue';

describe('Using vue-test-utils', function() {

	it('a Person component', function() {

		let view = mount(Person, {
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
