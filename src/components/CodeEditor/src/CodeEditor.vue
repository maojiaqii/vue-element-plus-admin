<script setup lang="tsx">
import { useMonacoEditor } from '@/hooks/web/useMonacoEditor'
import { onMounted, computed, watch, ref, nextTick } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { useLocaleStore } from '@/store/modules/locale'

const localeStore = useLocaleStore()

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
  <div class="code-editor-wrapper">
    <div ref="monacoEditorRef" :style="monacoEditorStyle"></div>
  </div>
</template>

<style lang="scss" scoped>
.code-editor-wrapper {
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-input-border-radius, 4px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 4px;
  background-color: var(--el-input-bg-color, var(--el-fill-color-blank));

  &:hover {
    border-color: var(--el-border-color-hover);
  }

  &:focus-within {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 1px var(--el-color-primary-light-5);
  }
}
</style>
