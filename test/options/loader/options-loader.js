import hooks from 'vue-esm-loader';
import create from 'create-esm-loader';

// For some weird reason we cannot simply use "vue-esm-loader", so we need to 
// build up the full url. Wtf.
// const require = createRequire(import.meta.url);
// const url = pathToFileURL(require.resolve('vue-esm-loader'));

export const {
	resolve,
	getFormat,
	getSource,
	transformSource,
	load,
} = await create([

	// For some reason we cannot reference ourselves as "vue-esm-loader" here. 
	// No idea why, might be an issue with create-esm-loader or a problem with 
	// the node resolution algorithm. Anyway, specifying ourselves as *config* 
	// does work though, which should be equivalent.
	{
		hooks,
		options: {
			files: [/\.vuex?/],
		},
	},

]);
