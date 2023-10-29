<template>
	<div>
		Foo: {{ foo }}
		<custom-component />
	</div>
</template>

<script>
export default {
	foo: 'bar',
};
</script>

<script setup>
import CustomComponent from './custom-component.vue';

const foo = 'baz';
</script>
