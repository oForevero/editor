<!-- import-word.vue -->
<template>
  <menus-button
    v-if="options.toolbar?.importWord?.enabled"
    ico="word"
    :text="t('base.importWord.text')"
    huge
    @menu-click="showDialog = true"
  />

  <emo-dialog
    :visible="showDialog"
    :header="t('base.importWord.dialogTitle')"
    width="560px"
    @confirm="onConfirm"
    @close="showDialog = false"
  >
    <template #default>
      <input ref="uploadInput" type="file" accept=".docx" />
    </template>
  </emo-dialog>
</template>

<script setup lang="ts">
import EmoDialog from '@/components/modal.vue'
import mammoth from 'mammoth';

const container = inject('container')
const editor = inject('editor')
const options = inject('options')

const showDialog = ref(false)
const uploadInput = ref<HTMLInputElement>()

onMounted(() => {
  const mammothScriptElement = document.querySelector('#mammoth-script')
  if (
    mammothScriptElement === null &&
    options.value.toolbar?.importWord.enabled
  ) {
    const script = document.createElement('script')
    script.src = `${options.value.cdnUrl}/libs/mammoth/mammoth.browser.min.js`
    script.id = 'mammoth-script'
    document.head.appendChild(script)
  }
})
const onConfirm = () => {
  const file = uploadInput.value?.files?.[0]
  if (!file) return
  handleWordImport(file);
  showDialog.value = false;
}

const handleWordImport = async (file: File) => {
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    useMessage('error', {
      attach: container,
      content: t('base.importWord.limitSize'),
    })
    return
  }

  const transformParagraph = (paragraph:any) => {
    if (paragraph.alignment === "center") {
      return { ...paragraph, styleName: "text-center" };
    }
    if (paragraph.alignment === "right") {
      return { ...paragraph, styleName: "text-right" };
    }
    return paragraph;
  }

  const message = await useMessage('loading', {
    attach: container,
    content: t('base.importWord.converting'),
  })
  if (options.value.toolbar?.importWord?.useCustomMethod) {
    try {
      const result =
        await options.value.toolbar?.importWord.onCustomImportMethod?.(file)
      message.close()
      if (result?.messages?.type === 'error') {
        useMessage('error', {
          attach: container,
          content: `${t('base.importWord.convertError')} (${result.messages.message})`,
        })
        return
      }
      if (result?.value) {
        editor.value?.commands.setContent(result.value)
      } else {
        useMessage('error', {
          attach: container,
          content: t('base.importWord.importError'),
        })
      }
    } catch {
      useMessage('error', {
        attach: container,
        content: t('base.importWord.importError'),
      })
    }
    return
  }

  // 默认使用 Mammoth 导入
  const arrayBuffer = await file.arrayBuffer()
  if (!mammoth) {
    return
  }
  let importWord={
    styleMap: [
      // 对齐 & 标题 & 列表 & 引用 & 分页
      "p[style-name='text-center'] => p.text-center:fresh",
      "p[style-name='text-right'] => p.text-right:fresh",
      "h1[style-name='标题 1'] => h1.text-center:fresh",
      "h2[style-name='标题 2'] => h2.text-center:fresh",
      "h2[style-name='标题 3'] => h3.text-center:fresh",
      "p[style-name='list-item-center'] => p.text-center:fresh",
      "tc[style-name='table-cell-center'] => td.text-center:fresh",
      "p[style-name='custom-block-center'] => div.text-center:fresh",
    ],
    // 手动注入 transformDocument
    transformDocument: (document: any) => {
      document.children = document.children.map((child: any) => {
        if (child.type === "paragraph") {
          return transformParagraph(child)
        }
        return child
      })
      return document
    }
  };
  const { value, messages } = await mammoth.convertToHtml(
    { arrayBuffer },
    importWord
  )
  message.close()
  for (const msg of messages) {
    if (msg.type === 'error') {
      useMessage('error', {
        attach: container,
        content: `${t('base.importWord.convertError')} (${msg.message})`,
      })
      return
    }
  }

  try {
    // 解析和加工 Mammoth 返回的 HTML 内容
    const doc = new DOMParser().parseFromString(value, 'text/html')

    // —— 1 处理图片
    for (const img of doc.querySelectorAll('img')) {
      const parent = img.parentElement
      if (parent?.tagName === 'P') {
        parent.insertAdjacentElement('beforebegin', img)
        if (!parent.hasChildNodes() && parent.textContent === '') {
          parent.remove()
        }
      }
    }

    // —— 2 内联对齐
    const ALIGN_CLASSES = ['text-center', 'text-right'] as const
    ALIGN_CLASSES.forEach(cls => {
      for (const el of Array.from(doc.querySelectorAll(`.${cls}`))) {
        const align = cls === 'text-center' ? 'center' : 'right'
        ;(el as HTMLElement).style.textAlign = align
      }
    })

    // —— 3 分页符替换
    for (const el of Array.from(doc.querySelectorAll('div.page-break'))) {
      const br = doc.createElement('div')
      br.setAttribute('style', 'page-break-after: always;')
      el.parentNode?.replaceChild(br, el)
    }

    editor.value?.commands.setContent(doc.body.innerHTML)
  } catch {
    useMessage('error', {
      attach: container,
      content: t('base.importWord.importError'),
    })
  }
}
</script>
