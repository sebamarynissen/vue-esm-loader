import create from 'create-esm-loader';
import config from './loader.js';

// Export the loader configuration for usage with node-esm-loader.
export default config;

// Create an actual loader as well for standalone usage.
const loader = create(config);
export const {
	resolve,
	getFormat,
	getSource,
	transformSource,
	load,
} = loader;
