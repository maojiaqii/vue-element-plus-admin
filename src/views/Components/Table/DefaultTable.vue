<script setup lang="tsx">
import data from '@/assets/json/defaultTable.json'
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Table } from '@/components/Table'
import { ref } from 'vue'

const { t } = useI18n()

const tt = ref()
const ttt = ref([
  {
    create_by: 'm',
    dict_id: 3,
    label: '未知',
    label_en: 'unknown',
    is_default: 0,
    create_date: '2023-11-08T10:12:44',
    dict_code: 'sys_sex',
    value: '2'
  },
  {
    create_by: 'm',
    dict_id: 2,
    label: '男',
    label_en: 'male',
    is_default: 0,
    create_date: '2023-11-08T10:12:09',
    dict_code: 'sys_sex',
    value: '1'
  },
  {
    create_by: 'm',
    dict_id: 1,
    label: '女',
    label_en: 'female',
    is_default: 1,
    create_date: '2023-11-08T10:10:02',
    dict_code: 'sys_sex',
    value: '0'
  }
])

const actionFn = (ref1: any) => {
  console.log(ref1)
  console.log(ttt.value)
}
</script>

<template>
  <ContentWrap :title="t('tableDemo.table')" :message="t('tableDemo.tableDes')">
    <Table ref="tt" v-model="ttt" v-bind="data" @change="actionFn" />
  </ContentWrap>
</template>
