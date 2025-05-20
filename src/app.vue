<template>
  <div class="examples">
    <div class="box">
      <umo-editor ref="editorRef" v-bind="options" @save-to-bus="saveToBus"/>
    </div>
    <!-- <div class="box">
      <umo-editor editor-key="testaaa" :toolbar="{ defaultMode: 'classic' }" />
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { shortId } from '@/utils/short-id'
import OpenAI from 'openai'

const editorRef = $ref(null)
let content = $ref('')
const templates = [
  {
    title: '工作任务',
    description: '工作任务模板',
    content:
      '<h1>工作任务</h1><h3>任务名称：</h3><p>[任务的简短描述]</p><h3>负责人：</h3><p>[执行任务的个人姓名]</p><h3>截止日期：</h3><p>[任务需要完成的日期]</p><h3>任务详情：</h3><ol><li>[任务步骤1]</li><li>[任务步骤2]</li><li>[任务步骤3]...</li></ol><h3>目标：</h3><p>[任务需要达成的具体目标或结果]</p><h3>备注：</h3><p>[任何额外信息或注意事项]</p>',
  },
  {
    title: '工作周报',
    description: '工作周报模板',
    content:
      '<h1>工作周报</h1><h2>本周工作总结</h2><hr /><h3>已完成工作：</h3><ul><li>[任务1名称]：[简要描述任务内容及完成情况]</li><li>[任务2名称]：[简要描述任务内容及完成情况]</li><li>...</li></ul><h3>进行中工作：</h3><ul><li>[任务1名称]：[简要描述任务当前进度和下一步计划]</li><li>[任务2名称]：[简要描述任务当前进度和下一步计划]</li><li>...</li></ul><h3>问题与挑战：</h3><ul><li>[问题1]：[描述遇到的问题及当前解决方案或需要的支持]</li><li>[问题2]：[描述遇到的问题及当前解决方案或需要的支持]</li><li>...</li></ul><hr /><h2>下周工作计划</h2><h3>计划开展工作：</h3><ul><li>[任务1名称]：[简要描述下周计划开始的任务内容]</li><li>[任务2名称]：[简要描述下周计划开始的任务内容]</li><li>...</li></ul><h3>需要支持与资源：</h3><ul><li>[资源1]：[描述需要的资源或支持]</li><li>[资源2]：[描述需要的资源或支持]</li><li>...</li></ul>',
  },
]

//接收父页面的消息
onMounted(() => {
  window.addEventListener('message', handleMessage)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handleMessage)
})

//获取配置文件url
const config = inject<{ apiUrl: string }>('config', { apiUrl: '' })
console.log(config);
/**
 * VUE3获取消息
 * @param event
 */
const handleMessage = (event: MessageEvent) => {
  // 校验来源
  if (event.origin !== config.apiUrl){
    return
  }

  // 校验数据结构
  if (
    typeof event.data === 'object' &&
    event.data !== null
  ) {
    if(event.data.type === 'from-bus-check-method'){
      let methodName = event.data.payload.methodName;
      const method = busPltfmMethodMap[methodName];
      method();
    }else if(event.data.type === 'from-bus-check-message'){
      content = event.data.payload.message;
      //设置内容
      editorRef.setContent(content);
      console.log('收到父页面数据：', event.data.payload.message)
    }
  }
}
//方法列表
const busPltfmMethodMap: Record<string, () => void> = {
  doLog() {
    console.log('doLog 被调用');
  },
  doContentSet() {
    console.log('doContentSet 被调用');
    editorRef.setcontent('测试设置值');
  },
  doTypeWriter() {
    console.log('打字机写入内容');

    const content = {
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Wow, this editor instance exports its content as JSON."
            }
          ]
        }
      ]
    };

    const options = {
      onProgress: (process: number)=>{
        console.log('doing:'+process)
      },
      speed: 50,       // 打字机效果的速度（毫秒），这里设置为每个字符之间间隔50毫秒
      step: 1,         // 每次显示的字符数量
      onComplete: ()=>{
        console.log('finish')
      }// 打字机状态：3表示重新开始
    };
    // 调用 startTypewriter 方法
    editorRef.startTypewriter(content, options);
  }
};
const saveToBus = (content: string)=>{
  sendMessageToBusCheck(content);
}
const sendMessageToBusCheck = (content: string)=>{
  window.parent.postMessage(
    {
      type: 'from-vue3',
      payload: {
        message: content,
        time: Date.now(),
      },
    },
    config.apiUrl
  )
}
const options = $ref({
  toolbar: {
    // defaultMode: 'classic',
    // menus: ['base'],
    importWord: {
      enabled: true,
      useCustomMethod: false,
    },
  },
  document: {
    title: '测试文档',
    content: localStorage.getItem('document.content') ?? '<p>测试文档</p>',
    characterLimit: 10000,
  },
  page: {
    showBookmark: true,
  },
  templates,
  cdnUrl: 'https://cdn.umodoc.com',
  shareUrl: 'https://umodoc.com',
  file: {
    // allowedMimeTypes: [
    //   'application/pdf',
    //   'image/svg+xml',
    //   'video/mp4',
    //   'audio/*',
    // ],
  },
  ai: {
    assistant: {
      enabled: true,
      async onMessage(payload, content) {
        const client = new OpenAI({
          baseURL: 'https://open.bigmodel.cn/api/paas/v4',
          apiKey: '16cd7d2f42f4a32539e2e1d9cad17a6d.FJvJPdHeXA9kp2W8',
          dangerouslyAllowBrowser: true, // 允许在浏览器中使用 OpenAI SDK
        })
        const { command, lang, input, output } = payload
        //根据语言切换自动续写
        const langs = {
          'en-US': '英文',
          'zh-CN': '中文',
        }
        //ai配置
        const reqOption = {
          stream: true,
          model: 'glm-4-flash',
          messages: [
            {
              role: 'system',
              content: `你是一个文档助手，根据用户输入的文本或者HTML内容，以及对应操作指令，生成符合要求的文档内容。要求如下：1.如果指令不是要求翻译内容，请使用${langs[lang]}返回，否则按用户要求翻译的语言返回；2.返回${output === 'rich-text' ? '富文本（HTML）' : '纯文本（剔除内容中的HTML标记）'}格式；3.如果用户输入的指令你不能理解，在返回的内容前加上“[ERROR]: ”，4.除此之外不返回任何其他多余的内容。`,
            },
            {
              role: 'user',
              content: `对以下内容进行：【${command}】操作。\n${input}`,
            },
          ],
        }
        const completion = await client.chat.completions.create(reqOption)
        const stream = new ReadableStream({
          async start(controller) {
            for await (const chunk of completion) {
              controller.enqueue(chunk.choices[0]?.delta?.content || '')
            }
            controller.close()
          },
        })
        return await Promise.resolve(stream)
      },
    },
  },
  user: {
    id: 'umoeditor',
    label: 'Umo Editor',
    avatar: 'https://tdesign.gtimg.com/site/avatar.jpg',
  },
  users: [
    { id: 'umodoc', label: 'Umo Team' },
    { id: 'Cassielxd', label: 'Cassielxd' },
    { id: 'Goldziher', label: "Na'aman Hirschfeld" },
    { id: 'SerRashin', label: 'SerRashin' },
    { id: 'ChenErik', label: 'ChenErik' },
    { id: 'china-wangxu', label: 'china-wangxu' },
    { id: 'Sherman Xu', label: 'xuzhenjun130' },
    { id: 'testuser', label: '测试用户' },
  ],
  async onSave(content: string, page: number, document: { content: string }) {
    localStorage.setItem('document.content', document.content)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const success = true
        if (success) {
          console.log('onSave', { content, page, document })
          resolve('操作成功')
        } else {
          reject(new Error('操作失败'))
        }
      }, 2000)
    })
  },
  async onFileUpload(file: File & { url?: string }) {
    if (!file) {
      throw new Error('没有找到要上传的文件')
    }
    console.log('onUpload', file)
    await new Promise((resolve) => setTimeout(resolve, 3000))
    return {
      id: shortId(),
      url: file.url ?? URL.createObjectURL(file),
      name: file.name,
      type: file.type,
      size: file.size,
    }
  },
  onFileDelete(id: string, url: string) {
    console.log(id, url)
  },

})
</script>

<style>
html,
body {
  padding: 0;
  margin: 0;
}
.examples {
  margin: 20px;
  display: flex;
  height: calc(100vh - 40px);
}
.box {
  border: solid 1px #ddd;
  box-sizing: border-box;
  position: relative;
  width: 100%;
  height: 100%;
}

html,
body {
  height: 100vh;
  overflow: hidden;
}
</style>
