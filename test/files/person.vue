<template>
	<div>
		{{ fullName }}
	</div>
</template>

<script>
export default {
	props: {
		person: Object,
	},
	computed: {
		fullName() {
			let { firstName, lastName } = this.person;
			return `${firstName} ${lastName}`;
		},
	},
};	
</script>
