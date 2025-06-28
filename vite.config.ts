import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(() => {
  // 当在 GitHub Actions 中构建时（GITHUB_ACTIONS 环境变量为 'true'），
  // 使用仓库子路径；本地或其他环境默认使用根路径 '/'
  const isGitHub = process.env.GITHUB_ACTIONS === 'true'
  const base = isGitHub ? '/Stardew-tab/' : '/'

  return {
    plugins: [ vue(), tailwindcss() ],
    server: {
      port: 9527,
      open: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      extensions: [ '.js', '.ts', '.vue' ],
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          popup: resolve(__dirname, 'src/popup/index.html'),
        },
      },
    },
    base
  }
})
