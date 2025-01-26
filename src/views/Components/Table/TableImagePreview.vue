<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import { getTableListApi } from '@/api/table'
import { ElTag } from 'element-plus'

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
  imagePreview: ['image_uri'],
  fetchDataApi: (pageSize: number, currentPage: number) => fetchDataApi(pageSize, currentPage),
  columns: [
    {
      field: 'title',
      label: t('tableDemo.title')
    },
    {
      field: 'image_uri',
      label: t('tableDemo.preview')
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
      field: 'importance',
      label: t('tableDemo.importance'),
      formatter: (_: Recordable, __: TableColumn, cellValue: number) => {
        return (
          <ElTag type={cellValue === 1 ? 'success' : cellValue === 2 ? 'warning' : 'danger'}>
            {cellValue === 1
              ? t('tableDemo.important')
              : cellValue === 2
                ? t('tableDemo.good')
                : t('tableDemo.commonly')}
          </ElTag>
        )
      }
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
  <ContentWrap :title="t('router.PicturePreview')">
    <Table v-bind="tableProps" />
  </ContentWrap>
</template>
