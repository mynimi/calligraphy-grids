import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/index.ts', // Entry point of your library
  output: [
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs', // CommonJS format for Node.js
    },
    {
      file: 'dist/bundle.esm.js',
      format: 'esm', // ES module format
    },
    {
      file: 'dist/bundle.umd.js',
      format: 'umd', // Universal Module Definition
      name: 'calligraphyGrids', // UMD name
    },
    {
      file: 'dist/bundle.iife.js',
      format: 'iife', // Immediately Invoked Function Expression
      name: 'calligraphyGrids'
    }
  ],
  plugins: [typescript()],
};