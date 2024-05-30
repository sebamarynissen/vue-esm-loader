// # resolve-script.js
import { resolveCompiler } from './compiler.js';
import { major } from './vue-version.js';

// # resolveScript(descriptor, query, scopeId)
export default function resolveScript(descriptor, query, scopeId) {

	// Check for older compiler versions.
	const { compiler } = resolveCompiler();
	if (!compiler.compileScript) {
		if (descriptor.scriptSetup) {
			throw new Error(
				'The version of Vue you are using does not support <script setup>. Please upgradeto 2.7 or above',
			);
		}
		return descriptor.script;
	}

	// Compile the script for the descriptor. The compiler sfc will 
	// automatically merge the setup and normal script for us.
	if (major === 2) {
		return compiler.compileScript(descriptor);
	} else {
		return compiler.compileScript(descriptor, {
			id: scopeId,
		});
	}

}
