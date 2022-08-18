import vue from '@vitejs/plugin-vue';
import jsx from "@vitejs/plugin-vue-jsx";
import { defineConfig, UserConfig } from "vite";

export const config = {
  base:"./",
  build:{
    outDir:"dist/view"
  },
  plugins: [vue(),jsx()],
  resolve:{
    alias:{
      // vue:"vue/dist/vue.esm-bundler.js",
      // "naive-ui":"naive-ui/es/index.js"
    }
  },
  css:{
  },
  ssgOptions: {
    format: 'cjs',
    mock:true
  }
}


export default defineConfig(config);
