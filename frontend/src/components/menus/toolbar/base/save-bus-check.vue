<template>
  <menus-button
    :text="t('busCheck.save.text')"
    ico="toc"
    shortcut="Ctrl+S"
    :disabled="editor?.isEmpty"
    huge
    @menu-click="handleClick"
  >
  </menus-button>
</template>

<script setup lang="ts">
const editor = inject('editor')
const emit = defineEmits<{
  (e: 'saveToBus'): void
}>()
const handleClick = () => {
  emit('saveToBus')
}
</script>

<style lang="less" scoped></style>
