// # version.js
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

export const { version } = require(require.resolve('vue/package.json'));
export const [major, minor, patch] = version.split('.').map(v => +v);
export default version;
