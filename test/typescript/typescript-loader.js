import hooks from 'vue-esm-loader';
import create from 'create-esm-loader';
import ts from 'typescript';
import path from 'node:path';
import process from 'node:process';

let tsConfig;
const vueTsRegex = /lang=ts/;

export const {
  resolve,
  getFormat,
  getSource,
  transformSource,
  load,
} = await create([

  // A working Typescript loader for Vue components.
  // The transform() code is copied from https://www.npmjs.com/package/esm-loader-typescript
  // It's not possible to use esm-loader-typescript directly because that loader is hardcoded to only process
  // files ending with ".ts" whereas the files we need to process end with ".vue?vue&type=script&lang=ts"
  {
    resolve(specifier, ctx) {
      if (!vueTsRegex.test(specifier)) {
        return;
      }
      return {
        format: 'module',
        url: new URL(specifier, ctx.parentURL).href,
      };
    },
    transform(source, ctx) {
      if (!vueTsRegex.test(ctx.url)) {
        return;
      }

      if (!tsConfig) {
        const configFileName = ts.findConfigFile(process.cwd(), ts.sys.fileExists, ctx.config || 'tsconfig.json');
        const configFile = ts.readConfigFile(configFileName, ts.sys.readFile);
        const compilerOptions = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configFileName));

        tsConfig = compilerOptions.options;
        tsConfig.inlineSourceMap = true;
        if (!tsConfig.module) tsConfig.module = ts.ModuleKind.ESNext;
      }

      const { outputText } = ts.transpileModule(String(source), {
        compilerOptions: tsConfig,
        fileName: ctx.url,
      });
      return { source: outputText };
    },
  },

  // Like with 'options-loader.js', we can't reference ourselves as "vue-esm-loader" here for some reason.
  {
    hooks,
  },
]);
