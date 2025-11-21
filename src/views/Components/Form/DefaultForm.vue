<script setup lang="tsx">
import data from '@/assets/json/all_form.json'
import { Form, FormProps } from '@/components/Form'
import { ref, watch } from 'vue'
import { Infotip } from '@/components/Infotip'

const schema = ref<FormProps>(data as any)
const formMethods = ref()

const keyClick1 = () => {
  schema.value.dividerType = schema.value.dividerType === 'lines' ? 'tabs' : 'lines'
}
const keyClick = (key: string) => {
  if (key === '官网地址') {
    window.open('https://element-plus.org/')
  }
}
const register = async (methods: any) => {
  formMethods.value = await methods.getFormData()
}

watch(
  () => formMethods.value,
  (val) => {
    console.log(val)
  },
  { deep: true }
)
</script>

<template>
  <Infotip
    :show-index="false"
    title="提示"
    :schema="[
      {
        label: '适配Element Plus V2.7.7版本绝大部分组件，推荐使用',
        keys: ['Element Plus V2.7.7']
      },
      {
        label: '官网地址',
        keys: ['官网地址']
      }
    ]"
    @click="keyClick"
  />
  <base-button type="primary" @click="keyClick1" />
  <Form :schema="schema" @register="register" />
</template>
