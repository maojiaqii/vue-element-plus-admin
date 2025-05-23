<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Table, TableColumn } from '@/components/Table'
import {
  ElDialog,
  ElDivider,
  ElDrawer,
  ElForm,
  ElFormItem,
  ElInput,
  ElLink,
  ElMessage,
  ElSwitch,
  ElTooltip,
  ElTag,
  ElCheckbox
} from 'element-plus'
import { BaseButton } from '@/components/Button'
import { useIcon } from '@/hooks/web/useIcon'
import { nextTick, ref } from 'vue'
import { WorkFlow } from '@/components/WorkFlow'
import { CharAvatar } from '@/components/CharAvatar'
import { NodeUtils } from '@/components/WorkFlow/src/utils/nodeUtils'
import { useValidator } from '@/hooks/web/useValidator'
import {
  getFlowApi,
  flowListApi,
  saveWorkflowApi,
  publishWorkflowApi,
  testWorkflowApi,
  processHistoryApi
} from '@/api/flow'
import { WorkflowDesign } from '@/api/flow/types'
import { TableSearch } from '@/api/table/types'
import { isEmpty } from '@/utils/is'
import { CodeEditor } from '@/components/CodeEditor'
import { toAnyString } from '@/utils'
import { Infotip } from '@/components/Infotip'

const { required } = useValidator()

const drawerVisible = ref(false)
const drawerVisible1 = ref(false)
const flowViewVisible = ref(false)
const workflowData = ref<any>([])
const flowDesigner = ref()
const flowTable = ref()
const flowHistoryVersion = ref()
const flowTestParams = ref('')
const testResult = ref({})
const flowViewData = ref({})
const flowFinished = ref(false)

// 流程信息表单对话框相关
const formDialogVisible = ref(false)
// 流程测试对话框
const flowTestDialogVisible = ref(false)
const formData = ref<WorkflowDesign>({
  isNew: true,
  flowCode: '',
  flowName: '',
  status: 0, // 0为正常，1为停用
  remark: ''
})
const formRules = {
  flowCode: [required()],
  flowName: [required()]
}
const formRef = ref()

const editFlow = async (data: Recordable) => {
  const res = await getFlowApi({ flowId: data.row.flow_id })
  if (res.code === 200) {
    const flowObj = res.data
    formData.value = {
      flowId: flowObj.flowId,
      isNew: true,
      flowCode: flowObj.flowCode,
      flowName: flowObj.flowName,
      status: flowObj.status,
      remark: flowObj.remark
    }
    workflowData.value = flowObj.flowNodes
    drawerVisible.value = true
  } else {
    ElMessage.error(res.msg)
  }
}

const actionFn = async (data: Recordable) => {
  const res = await publishWorkflowApi({
    flowId: data.row.flow_id
  })
  if (res.code === 200) {
    ElMessage.success(res.msg)
    flowHistoryVersion.value?.refresh()
    flowTable.value?.refresh()
  } else {
    ElMessage.error(res.msg)
  }
}

const flowHistoryVersionProps = {
  mode: 'view',
  showAction: true,
  columns: [
    {
      type: 'index',
      label: '序号'
    },
    {
      field: 'flow_id',
      label: '流程id',
      width: '100px'
    },
    {
      field: 'flow_code',
      label: '流程编码'
    },
    {
      field: 'flow_name',
      label: '流程名称'
    },
    {
      field: 'flow_version',
      label: '版本号',
      width: '80px',
      formatter: (_: Recordable, __: TableColumn, cellValue: number) => {
        return <ElTag type="info">v{cellValue}</ElTag>
      }
    },
    {
      field: 'create_time',
      label: '创建时间'
    },
    {
      field: 'published',
      label: '发布状态',
      width: '90px',
      formatter: (_: Recordable, __: TableColumn, cellValue: number) => {
        return (
          <ElTag type={cellValue === 0 ? 'danger' : cellValue === 1 ? 'success' : 'warning'}>
            {cellValue === 0 ? '未发布' : cellValue === 1 ? '已发布' : '已挂起'}
          </ElTag>
        )
      }
    },
    {
      field: 'status',
      label: '状态',
      width: '80px',
      formatter: (_: Recordable, __: TableColumn, cellValue: number) => {
        return (
          <ElTag type={cellValue === 0 ? 'success' : 'danger'}>
            {cellValue === 0 ? '正常' : '停用'}
          </ElTag>
        )
      }
    },
    {
      type: 'operation',
      field: 'operation',
      label: '操作',
      slots: {
        default: (data) => {
          return (
            <div class="flex items-center">
              <BaseButton
                bg={true}
                text={true}
                type="info"
                icon={useIcon({ icon: 'ep:edit' })}
                onClick={() => editFlow(data)}
              >
                编辑
              </BaseButton>
              <BaseButton
                bg={true}
                text={true}
                type="success"
                icon={useIcon({ icon: 'tdesign:rocket' })}
                onClick={() => actionFn(data)}
              >
                发布
              </BaseButton>
            </div>
          )
        }
      }
    }
  ]
}

const tableQuery = ref<TableSearch>({
  tableCode: 'table-8',
  params: { flowCode: '' },
  order: [
    {
      col: 'flow_version',
      order: 'desc'
    }
  ]
})

const fetchDataApi = async () => {
  const res = await flowListApi()
  return { data: res.data }
}

const testFlow = (row?: any) => {
  flowTestDialogVisible.value = true
  flowTestParams.value = JSON.stringify({
    businessKey: toAnyString(),
    flowCode: row.flowCode,
    formData: {}
  })
  testResult.value = {}
}

const startTest = async () => {
  testResult.value = {}
  testResult.value = await testWorkflowApi(JSON.parse(flowTestParams.value))
}

const showFlow = async () => {
  const res = await processHistoryApi({ processInstanceId: testResult.value.data })
  if (res.code == 200) {
    flowViewData.value = res.data.flowNodes
    flowFinished.value = res.data.finished
    flowViewVisible.value = true
  } else {
    ElMessage.error(res.msg)
  }
}

const showFlowTimeLine = async () => {
  const res = await processHistoryApi({ processInstanceId: testResult.value.data })
  console.log(res)
}

const actionClick = async (row?: any) => {
  console.log(row)
}

const actionView = (row?: any) => {
  tableQuery.value.params!.flowCode = row.flowCode
  nextTick(() => {
    drawerVisible1.value = true
    drawerVisible.value = false
  })
}

const handleNewClick = () => {
  formData.value = {
    flowId: '',
    isNew: true,
    flowCode: '',
    flowName: '',
    status: 0,
    remark: ''
  }
  workflowData.value = NodeUtils.createStartNode()
  drawerVisible.value = true
}

const cancelClick = () => {
  drawerVisible.value = false
}

const confirmClick = () => {
  console.log(flowDesigner.value.getData())
  if (flowDesigner.value.validate()) {
    // 显示流程表单对话框
    formDialogVisible.value = true
  }
}

// 提交流程信息表单
const submitWorkflowForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      // 合并流程基本信息和流程设计数据
      formData.value.nodes = flowDesigner.value.getData()
      // 这里可以添加保存API调用
      const res = await saveWorkflowApi(formData.value)
      if (res.code === 200) {
        ElMessage.success('保存成功')
        // 关闭对话框和抽屉
        formDialogVisible.value = false
        drawerVisible.value = false
        flowHistoryVersion.value?.refresh()
        flowTable.value.refresh()
      } else {
        ElMessage.error(res.msg)
      }
    }
  })
}

// 添加状态样式
const getStatusStyle = (published: boolean) => {
  return {
    color: published ? '#67C23A' : '#F56C6C',
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    marginTop: '12px',
    marginLeft: '4px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    minWidth: '82px'
  }
}
</script>

<template>
  <ContentWrap title="流程列表">
    <template #header>
      <div class="w-full">
        <BaseButton
          class="float-right flex items-center justify-end"
          type="primary"
          :icon="useIcon({ icon: 'ep:plus' })"
        >
          全部导出
        </BaseButton>
        <BaseButton
          class="mr-10px float-right flex items-center justify-end"
          type="primary"
          :icon="useIcon({ icon: 'ep:plus' })"
          @click="handleNewClick"
        >
          新增
        </BaseButton>
      </div>
    </template>
    <Table
      ref="flowTable"
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
            <CharAvatar
              :text="row.flowCode"
              :size="60"
              :customStyle="{ border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }"
            />
            <div :style="getStatusStyle(row.published === 1)">
              <span class="status-dot" :class="{ published: row.published === 1 }"></span>
              {{ row.published === 1 ? '已发布' : '新版本未发布' }}
            </div>
          </div>
          <div>
            <div class="mb-12px font-700 font-size-16px">{{ row.flowName }}</div>
            <ElTooltip :content="row.remark" placement="top" :show-after="500" effect="light">
              <div class="line-clamp-3 font-size-12px cursor-pointer">{{ row.remark }}</div>
            </ElTooltip>
          </div>
        </div>
      </template>
      <template #content-footer="item">
        <div class="flex justify-center items-center">
          <div class="flex-1 text-center" @click="() => actionView(item)">
            <ElLink :underline="false" type="primary">查看</ElLink>
          </div>
          <ElDivider direction="vertical" />
          <div class="flex-1 text-center" @click="() => testFlow(item)">
            <ElLink :underline="false" type="warning">测试</ElLink>
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
  <ElDrawer v-model="drawerVisible" size="80%" destroy-on-close>
    <template #header>
      <div><b>流程设计</b></div>
    </template>
    <template #default>
      <WorkFlow ref="flowDesigner" :nodeConfig="workflowData" />
    </template>
    <template #footer>
      <div style="flex: auto">
        <BaseButton @click="cancelClick">取消</BaseButton>
        <BaseButton type="primary" @click="confirmClick">确认</BaseButton>
      </div>
    </template>
  </ElDrawer>

  <ElDrawer v-model="flowViewVisible" size="80%" destroy-on-close>
    <template #header>
      <div><b>流程查看</b></div>
    </template>
    <template #default>
      <WorkFlow
        ref="flowView"
        :nodeConfig="flowViewData"
        :preview-mode="true"
        :finished="flowFinished"
      />
    </template>
  </ElDrawer>

  <ElDrawer v-model="drawerVisible1" size="80%" destroy-on-close>
    <template #header>
      <div><b>流程历史版本</b></div>
    </template>
    <template #default>
      <Table
        v-if="drawerVisible1"
        ref="flowHistoryVersion"
        v-bind="flowHistoryVersionProps"
        :query="tableQuery"
      />
    </template>
  </ElDrawer>

  <!-- 流程信息表单对话框 -->
  <ElDialog
    v-model="formDialogVisible"
    title="流程信息"
    width="500px"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="80px">
      <ElFormItem label="流程编码" prop="flowCode">
        <ElInput
          v-model="formData.flowCode"
          :disabled="!isEmpty(formData.flowId)"
          placeholder="请输入流程编码"
        />
      </ElFormItem>
      <ElFormItem label="流程名称" prop="flowName">
        <ElInput v-model="formData.flowName" placeholder="请输入流程名称" />
      </ElFormItem>
      <ElFormItem label="流程状态" prop="status">
        <ElSwitch
          v-model="formData.status"
          :active-value="0"
          :inactive-value="1"
          active-text="正常"
          inactive-text="停用"
          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
        />
      </ElFormItem>
      <ElFormItem label="说明" prop="remark">
        <ElInput
          v-model="formData.remark"
          type="textarea"
          :autosize="{
            maxRows: 4,
            minRows: 2
          }"
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElCheckbox
        class="float-left"
        v-model="formData.isNew"
        :disabled="true"
        label="保存为新版本"
        size="large"
      />
      <div>
        <BaseButton @click="formDialogVisible = false">取消</BaseButton>
        <BaseButton type="primary" @click="submitWorkflowForm">确认</BaseButton>
      </div>
    </template>
  </ElDialog>

  <!-- 流程信息表单对话框 -->
  <ElDialog
    v-model="flowTestDialogVisible"
    title="流程测试"
    width="500px"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <Infotip
      :show-index="false"
      title="提示"
      :schema="[
        {
          label: '请在formData中补充流程运行的必要参数；例：{age: 80}',
          keys: ['formData', '{age: 80}']
        }
      ]"
    />
    <CodeEditor
      v-model="flowTestParams"
      language="json"
      height="25vh"
      class="m-t-10px"
      placeholder="请补充流程必要参数，json格式"
    />
    <div>
      <p><b>测试结果：</b></p>
      <span>{{ testResult.msg }}</span>
    </div>
    <template #footer>
      <div>
        <BaseButton @click="flowTestDialogVisible = false">取消</BaseButton>
        <BaseButton type="success" @click="startTest">测试</BaseButton>
        <BaseButton v-show="testResult.data" type="primary" @click="showFlow">流程图</BaseButton>
        <BaseButton v-show="testResult.data" type="warning" @click="showFlowTimeLine"
          >时间线</BaseButton
        >
      </div>
    </template>
  </ElDialog>
</template>

<style scoped>
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 4px;
  display: inline-block;
  position: relative;
}

.status-dot::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

.status-dot.published {
  background-color: #67c23a;
}

.status-dot.published::before {
  background-color: #67c23a;
}

.status-dot:not(.published) {
  background-color: #f56c6c;
}

.status-dot:not(.published)::before {
  background-color: #f56c6c;
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
