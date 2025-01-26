<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn, TableSlotDefault } from '@/components/Table'
import { getTableListApi } from '@/api/table'
import { ref } from 'vue'
import { ElTag } from 'element-plus'
import { BaseButton } from '@/components/Button'

const { t } = useI18n()

const fetchDataApi = async (pageSize: number, currentPage: number) => {
  const res = await getTableListApi({
    pageIndex: currentPage,
    pageSize: pageSize
  })
  return { data: res.data.list, total: res.data.total }
}

const tableProps = ref<any>({
  mode: 'view',
  showAction: true,
  sortable: true,
  fetchDataApi: (pageSize: number, currentPage: number) => fetchDataApi(pageSize, currentPage),
  columns: [
    {
      field: 'expand',
      type: 'expand',
      slots: {
        default: (data: TableSlotDefault) => {
          const { row } = data
          return (
            <div class="ml-30px">
              <div>
                {t('tableDemo.title')}：{row.title}
              </div>
              <div>
                {t('tableDemo.author')}：{row.author}
              </div>
              <div>
                {t('tableDemo.displayTime')}：{row.display_time}
              </div>
            </div>
          )
        }
      }
    },
    {
      field: 'selection',
      type: 'selection'
    },
    {
      field: 'index',
      label: t('tableDemo.index'),
      type: 'index'
    },
    {
      field: 'title',
      label: t('tableDemo.title')
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
    },
    {
      field: 'action',
      label: t('tableDemo.action'),
      slots: {
        default: (data) => {
          return (
            <BaseButton type="primary" onClick={() => actionFn(data)}>
              {t('tableDemo.action')}
            </BaseButton>
          )
        }
      }
    }
  ],
  pagination: {
    currentPage: 1,
    pageSize: 10,
    total: 0
  }
})

const ta = ref([])

const actionFn = (data: any) => {
  console.log(data)
}
</script>

<template>
  <ContentWrap :title="`UseTable ${t('tableDemo.example')}`">
    <Table v-bind="tableProps" v-model="ta" @change="actionFn" />
  </ContentWrap>
</template>

<style lang="less" scoped>
.el-button {
  margin-top: 10px;
}
</style>
