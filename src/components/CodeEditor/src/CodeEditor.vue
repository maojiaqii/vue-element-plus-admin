<script setup lang="tsx">
import { useMonacoEditor } from '@/hooks/web/useMonacoEditor'
import { onMounted, computed, watch, ref, nextTick } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { isArray, isObject } from '@/utils/is'
import { debounce } from 'lodash-es'

const props = withDefaults(
  defineProps<{
    width?: string | number
    height?: string | number
    language?: string
    editorOption?: Object
    modelValue: string | Object
  }>(),
  {
    width: '100%',
    height: '100%',
    language: 'javascript',
    editorOption: () => ({}),
    modelValue: undefined
  }
)

const emits = defineEmits<{
  (e: 'blur', val: string | Object): void
  (e: 'update:modelValue', val: string | Object): void
  (e: 'change', val: string | Object): void
}>()

const appStore = useAppStore()
const isDark = computed(() => appStore.getIsDark)
const isObj = isObject(props.modelValue) || isArray(props.modelValue)

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

const emitVal = debounce(() => {
  let value = getEditor()?.getValue()
  if (isObj && value) {
    try {
      const jsonObject = JSON.parse(value)
      emits('update:modelValue', jsonObject)
      emits('blur', jsonObject)
      emits('change', jsonObject)
    } catch (error) {
      console.error('Error parsing JSON:', error)
    }
  } else {
    emits('update:modelValue', value || undefined)
    emits('blur', value || undefined)
    emits('change', value || undefined)
  }
}, 1000)

onMounted(() => {
  const monacoEditor = createEditor(props.editorOption)
  updateMonacoVal(
    isObj ? JSON.stringify(props.modelValue, null, '\t') : (props.modelValue as string)
  )
  monacoEditor?.onDidChangeModelContent(() => emitVal())
  monacoEditor?.onDidBlurEditorText(() => {
    emits('blur')
  })
})

watch(
  () => props.modelValue,
  () => {
    updateMonacoVal(
      isObj ? JSON.stringify(props.modelValue, null, '\t') : (props.modelValue as string)
    )
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
  width: 100%;
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
