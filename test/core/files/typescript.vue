<template>
	<p>Foo = {{ foo }}</p>
</template>

<script lang="ts">
const foo : string = 'bar';

export default {
	data() {
		return { foo };
	},
};
</script>
