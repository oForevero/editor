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
import { ref, inject, onMounted } from 'vue'

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

  const arrayBuffer = await file.arrayBuffer()
  // @ts-expect-error
  const { messages, value } = await mammoth.convertToHtml(
    { arrayBuffer },
    options.value.toolbar?.importWord.options,
  )
  message.close()
  if (messages.type === 'error') {
    useMessage('error', {
      attach: container,
      content: `${t('base.importWord.convertError')} (${messages.message})`,
    })
    return
  }

  try {
    const doc = new DOMParser().parseFromString(value, 'text/html')
    for (const img of doc.querySelectorAll('img')) {
      const parent = img.parentElement
      if (parent?.tagName === 'P') {
        parent.insertAdjacentElement('beforebegin', img)
        if (!parent.hasChildNodes() && parent.textContent === '') {
          parent.remove()
        }
      }
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
