import { register } from 'node:module';
import * as tsx from 'tsx/esm/api';

register('vue-esm-loader', import.meta.url);

// Calling register() from tsx
tsx.register();
