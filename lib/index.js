import create from './create-loader/index.js';
import config from './loader.js';

// Export the loader configuration for usage with node-esm-loader.
export default config;

// Create an actual loader as well for standalone usage.
const loader = create(config);
const { resolve, getFormat, getSource, transformSource } = loader;
export { resolve, getFormat, getSource, transformSource };
