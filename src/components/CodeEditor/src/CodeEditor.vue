<script setup lang="tsx">
import { useMonacoEditor } from '@/hooks/web/useMonacoEditor'
import { onMounted, computed, watch, ref, nextTick } from 'vue'
import { useAppStore } from '@/store/modules/app'

const props = withDefaults(
  defineProps<{
    width?: string | number
    height?: string | number
    language?: string
    editorOption?: Object
    modelValue: string
  }>(),
  {
    width: '100%',
    height: '100%',
    language: 'javascript',
    editorOption: () => ({}),
    modelValue: ''
  }
)

const emits = defineEmits<{
  (e: 'blur'): void
  (e: 'update:modelValue', val: string): void
  (e: 'change', val: string): void
}>()

const appStore = useAppStore()
const isDark = computed(() => appStore.getIsDark)

const monacoEditorStyle = computed(() => {
  return {
    width: typeof props.width === 'string' ? props.width : props.width + 'px',
    height: typeof props.height === 'string' ? props.height : props.height + 'px'
  }
})

const {
  monacoEditorRef,
  createEditor,
  updateVal,
  updateOptions,
  getEditor,
  changeLanguage,
  changeTheme
} = useMonacoEditor(props.language)

onMounted(() => {
  const monacoEditor = createEditor(props.editorOption)
  updateMonacoVal(props.modelValue)
  monacoEditor?.onDidChangeModelContent(() => {
    emits('update:modelValue', monacoEditor?.getValue())
    emits('change', monacoEditor?.getValue())
  })
  monacoEditor?.onDidBlurEditorText(() => {
    emits('blur')
  })
})

watch(
  () => props.modelValue,
  () => {
    updateMonacoVal(props.modelValue)
  }
)

const localLanguage = ref(props.language)

watch(localLanguage, (newLanguage) => {
  changeLanguage(newLanguage)
})

watch(
  isDark,
  async (newTheme) => {
    await nextTick()
    if (newTheme) {
      changeTheme('vs-dark')
    } else {
      changeTheme('vs')
    }
  },
  { immediate: true }
)

function updateMonacoVal(val: string) {
  if (val !== getEditor()?.getValue()) {
    updateVal(val)
  }
}

defineExpose({ updateOptions })
</script>

<template>
  <div ref="monacoEditorRef" :style="monacoEditorStyle"></div>
</template>
