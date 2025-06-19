import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [ vue(), tailwindcss() ],
  server: {
    port: 9527,
    open: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: [ '.js', '.ts', '.vue' ], // 添加 .vue
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        popup: resolve(__dirname, 'src/popup/index.html')
      }
    }
  },
  base: 'https://github.com/EricBoum/stardew-tab/'
})
