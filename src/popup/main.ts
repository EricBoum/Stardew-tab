/* popup/main.ts */
import { createApp } from 'vue'
import '@/styles/index.css'
import Popup from './vuePage/index.vue'
import { initI18n } from '@/locales'

// 异步初始化应用，等待 i18n 准备完成
const initApp = async () => {
  // 等待 i18n 初始化完成（读取存储的语言设置）
  const i18n = await initI18n()

  // 创建并挂载应用
  const app = createApp(Popup)
  app.use(i18n)
  app.mount('#app')
}

// 启动应用
initApp()
