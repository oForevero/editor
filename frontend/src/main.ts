import type { UmoEditorOptions } from '@/types'

import App from './app.vue'
import { useUmoEditor } from './components'
const app = createApp(App)
// 获取环境变量
const apiUrl = import.meta.env.VITE_API_URL
console.log('读取的 apiUrl:', apiUrl)

app.provide('config', { apiUrl })
const options = {}

app.use(useUmoEditor, options as unknown as UmoEditorOptions)

app.mount('#app')
