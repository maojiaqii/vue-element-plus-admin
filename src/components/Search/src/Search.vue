<script setup lang="tsx">
import { Form, FormProps } from '@/components/Form'
import { PropType, ref, unref } from 'vue'
import { propTypes } from '@/utils/propTypes'

defineProps({
  // 生成Form的布局结构数组
  schema: {
    type: Object as PropType<FormProps>,
    default: () => ({})
  },
  // 伸缩的界限字段
  expandIndex: propTypes.number.def(-1),
  inline: propTypes.bool.def(true),
  model: {
    type: Object as PropType<Recordable>,
    default: () => ({})
  }
})

const emit = defineEmits(['register', 'search', 'reset', 'expand'])

const formMethods = ref()

const search = async () => {
  emit('reset', await unref(formMethods).getFormData())
}

const reset = async () => {
  emit('reset', await unref(formMethods).getFormData())
}

const expand = async (expanded: boolean) => {
  emit('expand', expanded)
}

const register = (methods: any) => {
  formMethods.value = methods
  emit('register', methods)
}
</script>

<template>
  <Form
    :model="model"
    :schema="schema"
    @expand="expand"
    @reset="reset"
    @search="search"
    is-search
    direction="vertical"
    :expand-index="expandIndex"
    @register="register"
  />
</template>
