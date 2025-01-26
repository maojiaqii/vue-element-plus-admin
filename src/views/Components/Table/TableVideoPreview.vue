<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Table } from '@/components/Table'
import { getTableListApi } from '@/api/table'

const { t } = useI18n()

const fetchDataApi = async (pageSize: number, currentPage: number) => {
  const res = await getTableListApi({
    pageIndex: currentPage,
    pageSize: pageSize
  })
  return { data: res.data.list, total: res.data.total }
}

const tableProps = {
  mode: 'view',
  showAction: true,
  sortable: true,
  videoPreview: ['image_uri', 'video_uri'],
  fetchDataApi: (pageSize: number, currentPage: number) => fetchDataApi(pageSize, currentPage),
  columns: [
    {
      field: 'title',
      label: t('tableDemo.title')
    },
    {
      field: 'video_uri',
      label: t('tableDemo.videoPreview')
    },
    {
      field: 'author',
      label: t('tableDemo.author')
    },
    {
      field: 'display_time',
      label: t('tableDemo.displayTime')
    },
    {
      field: 'pageviews',
      label: t('tableDemo.pageviews')
    }
  ],
  pagination: {
    currentPage: 1,
    pageSize: 10,
    total: 0
  }
}
</script>

<template>
  <ContentWrap :title="t('tableDemo.videoPreview')">
    <Table v-bind="tableProps" />
  </ContentWrap>
</template>
