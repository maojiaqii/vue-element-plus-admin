<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Table } from '@/components/Table'
import { getCardTableListApi } from '@/api/table'
import { ElLink, ElDivider, ElSteps, ElDrawer, ElStep } from 'element-plus'
import { useIcon } from '@/hooks/web/useIcon'
import { ref } from 'vue'
import WorkFlow from '@/components/WorkFlow/src/WorkFlow.vue'

const { t } = useI18n()

const drawerVisible = ref(false)
const stepsActive = ref(1)

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

const handleNewClick = () => {
  drawerVisible.value = true
}
</script>

<template>
  <ContentWrap title="流程列表">
    <template #header>
      <div class="w-full">
        <BaseButton
          class="w-12vh h-20px float-right flex items-center justify-end"
          type="primary"
          :icon="useIcon({ icon: 'ep:plus' })"
        >
          全部导出
        </BaseButton>
        <BaseButton
          class="w-10vh h-20px mr-10px float-right flex items-center justify-end"
          type="primary"
          :icon="useIcon({ icon: 'ep:plus' })"
          @click="handleNewClick"
        >
          新增
        </BaseButton>
      </div>
    </template>
    <Table
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
            <ElLink :underline="false" type="primary">编辑</ElLink>
          </div>
          <ElDivider direction="vertical" />
          <div class="flex-1 text-center" @click="() => actionClick(item)">
            <ElLink :underline="false">导出</ElLink>
          </div>
          <ElDivider direction="vertical" />
          <div class="flex-1 text-center" @click="() => actionClick(item)">
            <ElLink :underline="false" type="danger">删除</ElLink>
          </div>
        </div>
      </template>
    </Table>
  </ContentWrap>

  <ElDrawer v-model="drawerVisible" size="80%">
    <template #header>
      <h4>流程设计</h4>
    </template>
    <template #default>
      <ElSteps style="width: 100%" :active="stepsActive" align-center>
        <ElStep title="基本信息" />
        <ElStep title="流程图" />
        <ElStep title="其他" />
      </ElSteps>
      <div>
        <WorkFlow />
      </div>
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="cancelClick">cancel</el-button>
        <el-button type="primary" @click="confirmClick">confirm</el-button>
      </div>
    </template>
  </ElDrawer>
</template>
