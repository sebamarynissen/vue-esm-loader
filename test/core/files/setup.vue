<template>
	<div>
		Hello world
		<custom-component />
	</div>
</template>

<script>
import CustomComponent from './custom-component.vue';

export default {
	foo: 'bar',
};
</script>

<script setup>
const foo = 'baz';
</script>
