import create from './create-loader/index.js';
import hooks from './loader.js';

// Export the loader configuration for usage with node-esm-loader.
export default hooks;

// Create an actual loader as well for standalone usage.
const loader = create({ hooks });
const { resolve, getFormat, getSource, transformSource } = loader;
export { resolve, getFormat, getSource, transformSource };
