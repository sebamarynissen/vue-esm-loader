import * as tsx from 'tsx/esm/api';
import * as vue from 'vue-esm-loader';

// IMPORTANT! tsx needs to be registered **after** vue-esm-loader, otherwise
// tsx will try to transform .vue files!
vue.register();
tsx.register();

// Alternatively, if no customization is needed, we could've used the imports 
// below as well. Note that order remains important!
// import 'vue-esm-loader/register';
// import 'tsx/esm';
