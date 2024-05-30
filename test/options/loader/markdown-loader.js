// # markdown-loader.js
export async function load(req, ctx, nextLoad) {

	// If we're not dealing with .md files, pass on to the next in the chain.
	let url = new URL(req);
	if (!url.pathname.endsWith('.md')) {
		return nextLoad(req);
	}

	// Cool, we're dealing with markdown here. In production this is where you'd 
	// call stuff like marked to transform it to a true Vue component. Here we 
	// just transform it to a dummy component for testing.
	let { source } = await nextLoad(req, { format: 'module' });
	let code = `
	<template>
		<div>${source}</div>
	</template>
	<script setup>
	const name = 'Markdown';
	</script>
	<script>
	export default {
		markdown: ${JSON.stringify(String(source).trim())},
	};
	</script>
	`;
	return {
		source: code,
		format: 'module',
	};

}
