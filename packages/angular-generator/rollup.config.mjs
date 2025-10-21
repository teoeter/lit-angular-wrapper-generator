import pkg from './package.json' with { type: 'json' };

export default {
  input: 'dist/index.js',

  external: ['path', 'node-sass', 'fs', 'util', 'os', 'url'],

  watch: {
    clearScreen: false,
  },

  output: [
    {
      format: 'cjs',
      file: 'dist/index.cjs.js',
    },
    {
      format: 'es',
      file: 'dist/index.js',
    },
  ],
};
