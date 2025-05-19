<template>
  <div>
    <input type="file" :accept="props.accept" @change="onFileChange" />
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'select', file: File): void
}>()
const props = defineProps({
  accept: {
    type: String,
    required: true,
    default: '.docx, .md, .pdf, .txt'
  },
});
const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    emit('select', file)
  }
}
</script>
