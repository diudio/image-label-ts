import typescript from 'rollup-plugin-typescript2'
import image from '@rollup/plugin-image';
import babel from 'rollup-plugin-babel'

export default {
  input:'./src/index.ts',//入口文件
  output:{
    file:'./dist/index.js',//打包后的存放文件
    format:'es',//输出格式 amd es6 iife umd cjs
    sourcemap:true  //生成bundle.map.js文件，方便调试
  },
  plugins: [
    image(),
    typescript(),
    babel({
      exclude: 'node_modules/**'
    })
  ],
  external:['lodash', 'lodash-es']
}
