<script setup lang="ts">
import { Container } from '@/components/Container'
import { onMounted, ref, unref } from 'vue'
import { useRouter } from 'vue-router'
import { getTableInfoApi, getFormInfoApi } from '@/api/common'
import { ElMessage } from 'element-plus'
import { SearchProps } from '@/components/Search'
import { TableProps } from '@/components/Table'

const { currentRoute } = useRouter()

const search = ref<SearchProps>()
const table = ref<TableProps>()
const side = ref()
const params = unref(currentRoute).meta.params

const renderSearch = async (searchCode: string) => {
  const res = await getFormInfoApi({ code: searchCode })
  if (res.code != 200) {
    ElMessage.error(res.msg)
  } else {
    search.value = res.data
  }
}

const renderTable = async (tableCode: string) => {
  const res = await getTableInfoApi({ code: tableCode })
  if (res.code != 200) {
    ElMessage.error(res.msg)
  } else {
    table.value = res.data
  }
}

onMounted(() => {
  params?.search && renderSearch(params.search as string)
  params?.table && renderTable(params.table as string)
})
</script>

<template>
  <Container :search="unref(search)" :table="unref(table)" :side="unref(side)" />
</template>
