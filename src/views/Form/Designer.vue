<script setup lang="tsx">
import { ContainerA } from '@/components/Container'
import { TableColumn, TableProps } from '@/components/Table'
import { ElDrawer, ElMessage, ElMessageBox, ElTag } from 'element-plus'
import { BaseButton } from '@/components/Button'
import { useIcon } from '@/hooks/web/useIcon'
import { ref } from 'vue'
import { Designer } from '@/components/Form'
import { SearchProps } from '@/components/Search'
import { saveFormPropsApi, deleteFormPropsApi } from '@/api/form'

const drawerVisible = ref(false)
const formId = ref('')
const formDesigner = ref()
const tableExposedRef = ref()

const addForm = () => {
  formId.value = ''
  drawerVisible.value = true
}

const cancelClick = () => {
  drawerVisible.value = false
}

const confirmClick = async () => {
  const res = await saveFormPropsApi(formDesigner.value.formInfo)
  if (res.code === 200) {
    ElMessage.success('操作成功')
    tableExposedRef.value.refresh()
    drawerVisible.value = false
  } else {
    ElMessage.error(res.msg)
  }
}

const editForm = (data: Recordable) => {
  formId.value = data.row.form_id
  drawerVisible.value = true
}

const deleteForm = async (data: Recordable) => {
  ElMessageBox.confirm('确定删除当前数据?', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const res = await deleteFormPropsApi({ formId: data.row.form_id })
      if (res.code === 200) {
        ElMessage.success('删除成功')
        tableExposedRef.value.refresh()
      } else {
        ElMessage.error(res.msg)
      }
    })
    .catch(() => {})
}

const register = (tableExpose: any) => {
  tableExposedRef.value = tableExpose
}

const searchFormProps: SearchProps = {
  schema: {
    expandIndex: 3,
    isSearch: true,
    formItems: [
      {
        itemProps: {
          prop: 'formName',
          label: '表单名称'
        },
        colProps: {
          xl: 6,
          lg: 6,
          md: 12,
          sm: 12,
          xs: 24
        },
        componentProps: {
          component: 'Input'
        }
      }
    ]
  }
}

const tableProps: TableProps = {
  mode: 'view',
  showAction: true,
  buttons: [
    {
      icon: 'ep:plus',
      type: 'primary',
      staticText: '新增',
      on: {
        click: addForm
      }
    },
    {
      icon: 'ep:plus',
      type: 'success',
      staticText: '导入',
      on: {
        click: addForm
      }
    }
  ],
  columns: [
    {
      type: 'index',
      label: '序号'
    },
    {
      field: 'form_code',
      label: '表单编码'
    },
    {
      field: 'form_name',
      label: '表单名称'
    },
    {
      field: 'form_type',
      label: '表单类型',
      width: '150px',
      formatter: (_: Recordable, __: TableColumn, cellValue: number) => {
        if (cellValue === 1) {
          return <ElTag type="primary">普通查询表单</ElTag>
        } else if (cellValue === 2) {
          return <ElTag type="danger">流程待办查询表单</ElTag>
        } else if (cellValue === 3) {
          return <ElTag type="success">流程已办查询表单</ElTag>
        } else if (cellValue === 4) {
          return <ElTag type="warning">我发起的查询表单</ElTag>
        }
        return <ElTag type="info">填报表单</ElTag>
      }
    },
    {
      field: 'status',
      label: '状态',
      width: '80px',
      formatter: (_: Recordable, __: TableColumn, cellValue: number) => {
        if (cellValue === 0) {
          return <ElTag type="success">正常</ElTag>
        } else if (cellValue === 1) {
          return <ElTag type="danger">停用</ElTag>
        }
      }
    },
    {
      field: 'remark',
      label: '说明'
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
                onClick={() => editForm(data)}
              >
                编辑
              </BaseButton>
              <BaseButton
                bg={true}
                text={true}
                type="danger"
                icon={useIcon({ icon: 'ep:delete' })}
                onClick={() => deleteForm(data)}
              >
                删除
              </BaseButton>
              <BaseButton
                bg={true}
                text={true}
                type="success"
                icon={useIcon({ icon: 'tdesign:file-export' })}
                onClick={() => editForm(data)}
              >
                导出
              </BaseButton>
            </div>
          )
        }
      }
    }
  ],
  query: {
    order: [
      {
        col: 'create_time',
        order: 'desc'
      }
    ],
    tableCode: 'table-10'
  },
  pagination: {
    pageSize: 10
  }
}
</script>

<template>
  <ContainerA @register="register" :search="searchFormProps" :table="tableProps" />
  <ElDrawer v-model="drawerVisible" size="100%" destroy-on-close>
    <template #header>
      <div><b>表单设计</b></div>
    </template>
    <template #default>
      <Designer ref="formDesigner" :formId="formId" />
    </template>
    <template #footer>
      <div style="flex: auto">
        <BaseButton @click="cancelClick">取消</BaseButton>
        <BaseButton type="primary" @click="confirmClick">确认</BaseButton>
      </div>
    </template>
  </ElDrawer>
</template>

<style scoped></style>
