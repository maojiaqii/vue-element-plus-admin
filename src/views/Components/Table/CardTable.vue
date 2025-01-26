<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Table } from '@/components/Table'
import { getCardTableListApi } from '@/api/table'
import { ElLink, ElDivider } from 'element-plus'

const { t } = useI18n()

const fetchDataApi = async (pageSize: number, currentPage: number) => {
  const res = await getCardTableListApi({
    pageIndex: currentPage,
    pageSize: pageSize
  })
  return { data: res.data.list, total: res.data.total }
}
const actionClick = (row?: any) => {
  console.log(row)
}
</script>

<template>
  <ContentWrap :title="t('tableDemo.cardTable')">
    <Table
      :columns="[]"
      :fetch-data-api="fetchDataApi"
      custom-content
      :card-wrap-style="{
        width: '200px',
        marginBottom: '20px',
        marginRight: '20px'
      }"
    >
      <template #content="row">
        <div class="flex cursor-pointer">
          <div class="pr-16px">
            <img :src="row.logo" class="w-48px h-48px rounded-[50%]" alt="" />
          </div>
          <div>
            <div class="mb-12px font-700 font-size-16px">{{ row.name }}</div>
            <div class="line-clamp-3 font-size-12px">{{ row.desc }}</div>
          </div>
        </div>
      </template>
      <template #content-footer="item">
        <div class="flex justify-center items-center">
          <div class="flex-1 text-center" @click="() => actionClick(item)">
            <ElLink :underline="false">操作一</ElLink>
          </div>
          <ElDivider direction="vertical" />
          <div class="flex-1 text-center" @click="() => actionClick(item)">
            <ElLink :underline="false">操作二</ElLink>
          </div>
        </div>
      </template>
    </Table>
  </ContentWrap>
</template>
