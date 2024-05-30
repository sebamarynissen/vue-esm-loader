import * as tsx from 'tsx/esm/api';
import * as vue from 'vue-esm-loader';

// IMPORTANT! vue-esm-loader needs to be registered **before** tsx, otherwise 
// ts imports from within <script> don't get processed by vue-esm-loader!
vue.register();
tsx.register();

// Alternatively, if no customization is needed, we could've used the imports 
// below as well. Note that order remains important!
// import 'vue-esm-loader/register';
// import 'tsx/esm';
