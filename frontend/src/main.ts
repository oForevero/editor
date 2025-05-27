import type { UmoEditorOptions } from '@/types'

declare global {
  interface Window {
    __APP_CONFIG__?: {
      VITE_API_URL?: string;
      // 可以扩展更多配置项
    };
  }
}

import App from './app.vue'
import { useUmoEditor } from './components'
const app = createApp(App)
// 获取环境变量
const apiUrl = window.__APP_CONFIG__?.VITE_API_URL;
//console.log("🚀 VITE_API_URL =", apiUrl);
app.provide('config', { apiUrl })
const options = {}

app.use(useUmoEditor, options as unknown as UmoEditorOptions)

app.mount('#app')
