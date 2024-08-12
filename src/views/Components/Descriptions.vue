<script setup lang="ts">
import { Descriptions } from '@/components/Descriptions'
import { useI18n } from '@/hooks/web/useI18n'
import { reactive } from 'vue'
import { Form } from '@/components/Form'
import { DescriptionsSchema } from '@/components/Descriptions'
import data2 from '@/assets/forms/search_demo.json'

const { t } = useI18n()

const data = reactive({
  username: 'chenkl',
  nickName: '梦似花落。',
  age: 26,
  phone: '13655971xxxx',
  email: '502431556@qq.com',
  addr: '这是一个很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长的地址',
  sex: '男',
  certy: '3505831994xxxxxxxx'
})

const schema = reactive<DescriptionsSchema[]>([
  {
    field: 'username',
    label: t('descriptionsDemo.username')
  },
  {
    field: 'nickName',
    label: t('descriptionsDemo.nickName')
  },
  {
    field: 'phone',
    label: t('descriptionsDemo.phone')
  },
  {
    field: 'email',
    label: t('descriptionsDemo.email')
  },
  {
    field: 'addr',
    label: t('descriptionsDemo.addr'),
    span: 24
  }
])
</script>

<template>
  <Descriptions
    :title="t('descriptionsDemo.descriptions')"
    :message="t('descriptionsDemo.descriptionsDes')"
    :data="data"
    :schema="schema"
  />

  <Form :schema="data2" is-description direction="vertical" />
</template>

<style lang="less" scoped>
:deep(.is-required--item) {
  position: relative;

  &::before {
    margin-right: 4px;
    color: var(--el-color-danger);
    content: '*';
  }
}
</style>
