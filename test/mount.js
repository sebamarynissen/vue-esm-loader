// # mount.js
import './setup-jsdom.js';
import { major } from '#vue/version';

export async function mount(Component) {
	if (major === 2) {
		const { default: Vue } = await import('vue');
		const vm = new Vue(Component);
		Vue.config.devtools = false;
		Vue.config.productionTip = false;
		vm.$mount(document.createElement('div'));
		return vm.$el;
	} else {
		const { createApp } = await import('vue');
		const app = createApp(Component);
		const vm = app.mount(document.createElement('div'));
		return vm.$el;
	}
}
