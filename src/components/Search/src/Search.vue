<script setup lang="tsx">
import { Form, FormProps } from '@/components/Form'
import { PropType } from 'vue'

defineProps({
  // 生成Form的布局结构数组
  schema: {
    type: Object as PropType<FormProps>,
    default: () => ({})
  },
  model: {
    type: Object as PropType<Recordable>,
    default: () => ({})
  }
})

const emit = defineEmits(['register', 'search', 'reset', 'expand'])

const search = (data: Recordable) => {
  emit('search', data)
}

const reset = (data: Recordable) => {
  emit('reset', data)
}

const expand = (expanded: boolean) => {
  emit('expand', expanded)
}

const register = (methods: any) => {
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
    @register="register"
  />
</template>
