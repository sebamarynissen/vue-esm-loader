// # export-helper.js
// A clone of vue-loader's exportHelper.js. This is used in the facade module 
// to finalize the export of the component.
export default function(src, props) {
	const target = src;
	for (const [key, val] of props) {
		target[key] = val;
	}
	return target;
}
