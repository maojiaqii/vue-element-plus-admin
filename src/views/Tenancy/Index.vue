<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Table } from '@/components/Table'
import { ElDivider, ElLink, ElTooltip, ElTag, ElMessage } from 'element-plus'
import { BaseButton } from '@/components/Button'
import { useIcon } from '@/hooks/web/useIcon'
import { ref } from 'vue'
import { getFormInfoApi, getTableDataApi } from '@/api/common'
import createDrawer from '@/hooks/web/useDrawer'
import { newFunction } from '@/utils/newFunction'

const tenancyTable = ref()

const fetchDataApi = async () => {
  const res = await getTableDataApi({
    tableCode: 'table-4',
    order: [
      {
        col: 'order_num',
        order: 'asc'
      }
    ]
  })
  return { data: res.data?.list, total: res.data?.total }
}

const actionNew = async () => {
  getFormInfoApi({ code: 'tenancy_form' })
    .then((res) => {
      if (res.code === 200) {
        createDrawer({
          title: '新增',
          width: '80%',
          content: [{ type: 'form', props: res.data }],
          buttons: [
            {
              component: 'Button',
              type: 'primary',
              staticText: '取消',
              on: { click: () => 'this.closeDialog()' }
            },
            {
              component: 'Button',
              type: 'danger',
              staticText: '保存',
              on: {
                click: {
                  js: 'form_save',
                  params: {
                    formCode: 'tenancy_form'
                  }
                }
              }
            }
          ]
        }).then(() => tenancyTable.value.refresh())
      } else {
        ElMessage({ type: 'error', message: res.msg })
      }
    })
    .catch(() => {
      ElMessage({ type: 'error', message: '请求失败！' })
    })
}

const actionEdit = async (row?: any) => {
  newFunction(
    {
      js: 'table_row_edit',
      params: {
        js: 'form_save',
        formCode: 'tenancy_form',
        dialogType: 'drawer'
      }
    },
    { tableRef: tenancyTable.value, row: row }
  ).then((res) => res.func(res.params))
}

const actionDelete = async (row?: any) => {
  newFunction(
    {
      js: 'table_row_delete',
      params: {
        formCode: 'tenancy_form'
      }
    },
    { tableRef: tenancyTable.value, row: row }
  ).then((res) => res.func(res.params))
}

const actionClick = async (row?: any) => {
  newFunction(
    {
      js: 'menu_manage',
      params: {
        dialogType: 'drawer'
      }
    },
    { tableRef: tenancyTable.value, row: row }
  ).then((res) => res.func(res.params))
}
</script>

<template>
  <ContentWrap title="租户列表">
    <template #header>
      <div class="w-full">
        <BaseButton
          class="mr-10px float-right flex items-center justify-end"
          type="primary"
          :icon="useIcon({ icon: 'ep:plus' })"
          @click="actionNew"
        >
          新增
        </BaseButton>
      </div>
    </template>
    <Table
      ref="tenancyTable"
      :columns="[]"
      :fetch-data-api="fetchDataApi"
      custom-content
      :card-wrap-style="{
        width: '260px',
        marginBottom: '20px',
        marginRight: '20px'
      }"
    >
      <template #content="row">
        <div class="flex">
          <div class="pr-16px">
            <img
              :src="row.icon"
              class="w-[calc(var(--logo-height)-10px)] h-[calc(var(--logo-height)-10px)]"
            />
            <div class="status-dot">
              <ElTag :type="row.status === 0 ? 'success' : 'danger'">
                {{ row.status === 0 ? '正常' : '停用' }}
              </ElTag>
            </div>
          </div>
          <div>
            <div class="mb-12px font-700 font-size-16px">{{ row.tenancy_name }}</div>
            <ElTooltip :content="row.remark" placement="top" :show-after="500" effect="light">
              <div class="line-clamp-3 font-size-12px cursor-pointer">{{ row.remark }}</div>
            </ElTooltip>
          </div>
        </div>
      </template>
      <template #content-footer="item">
        <div class="flex justify-center items-center">
          <div class="flex-1 text-center" @click="() => actionEdit(item)">
            <ElLink :underline="false" type="primary">编辑</ElLink>
          </div>
          <ElDivider direction="vertical" />
          <div class="flex-1 text-center" @click="() => actionDelete(item)">
            <ElLink :underline="false" type="danger">删除</ElLink>
          </div>
          <ElDivider direction="vertical" />
          <div class="flex-1 text-center" @click="() => actionClick(item)">
            <ElLink :underline="false">查看菜单</ElLink>
          </div>
        </div>
      </template>
    </Table>
  </ContentWrap>
</template>

<style scoped>
.status-dot {
  display: flex;
  align-items: center;
  margin-top: 12px;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(2);
    opacity: 0.3;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
