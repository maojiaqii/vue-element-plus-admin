<script lang="tsx" setup>
import {
  ElCol,
  ElRow,
  ElScrollbar,
  ElTooltip,
  ElDivider,
  ElForm,
  ElFormItem,
  ElSwitch,
  ElInput,
  ElInputNumber,
  ElSelect,
  ElOption,
  ElMessage,
  ElDialog,
  ElCollapseTransition,
  ElTag,
  ElMessageBox
} from 'element-plus'
import { BaseButton } from '@/components/Button'
import { ContentWrap } from '@/components/ContentWrap'
import { Icon } from '@/components/Icon'
import { vDraggable } from 'vue-draggable-plus'
import { componentList, formTodo, formDone, formOwn } from './helper/componentList'
import { computed, onMounted, ref, toRaw, watch } from 'vue'
import { toAnyString } from '@/utils'
import { Form, FormSchema, SelectOption } from '@/components/Form'
import { CodeEditor } from '@/components/CodeEditor'
import { getDictDataApi } from '@/api/common'
import { get, set } from 'lodash-es'
import { Infotip } from '@/components/Infotip'
import { propTypes } from '@/utils/propTypes'
import { Table, TableColumn } from '@/components/Table'
import { FormInfo } from '@/components/Form/src/types'
import { useIcon } from '@/hooks/web/useIcon'
import { isEmpty } from '@/utils/is'
import { getFormPropsApi } from '@/api/form'

const props = defineProps({
  formId: propTypes.string.def('')
})

const formInfo = ref<FormInfo>({
  formCode: '',
  formName: '',
  formType: 0,
  status: 0,
  remark: '',
  schema: {
    size: 'default',
    labelWidth: '80px',
    labelPosition: 'right',
    mode: 'edit',
    autoSetPlaceholder: true,
    isSearch: false,
    expandIndex: 3,
    isDescription: false,
    direction: 'horizontal',
    dividerType: 'lines',
    others: {},
    formItems: [],
    formValidators: {},
    lifecycle: {}
  },
  dbMapping: {
    dbTableName: '',
    mapping: []
  }
})
const selectedKey = ref<string | undefined>(undefined)
const selectedItem = ref<FormSchema | undefined>(undefined)
const editingJs = ref<string | undefined>(undefined)
const editingJsPath = ref<string>('')
const currentProp = ref<string>('')
const svgUrls = ref()

const form1 = ref<boolean>(true)
const form2 = ref<boolean>(true)
const form3 = ref<boolean>(true)
const form4 = ref<boolean>(true)
const form5 = ref<boolean>(true)

const tabs = ['基础信息', '可视化设计', '数据库映射', 'JSON格式化数据', '表单预览']
const propTabs = [
  { name: 'fieldProps', label: '字段属性' },
  { name: 'formProps', label: '表单属性' }
]

const dbMappingProps = {
  mode: 'edit',
  maxHeight: 550,
  columns: [
    {
      type: 'index',
      label: '序号'
    },
    {
      field: 'dbColumn',
      label: '数据库字段',
      slots: {
        default: (data) => {
          return (
            <div>
              {data.row.dbColumn === data.row.formField && data.row.formField ? (
                data.row.dbColumn
              ) : (
                <ElSelect v-model={data.row.dbColumn}>
                  {dbTableColumnsList.value.value.map((v) => {
                    return (
                      <ElOption
                        value={v.value}
                        label={v.value + ' ' + v.label}
                        disabled={v.disabled}
                      />
                    )
                  })}
                </ElSelect>
              )}
            </div>
          )
        }
      }
    },
    {
      field: 'formField',
      label: '表单字段'
    },
    {
      field: 'isKey',
      label: '是否主键',
      slots: {
        default: (data) => {
          return (
            <ElSwitch
              v-model={data.row.isKey}
              active-text="是"
              inactive-text="否"
              style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
              onChange={(val) => {
                if (val) {
                  if (formInfo.value.dbMapping.mapping.filter((e) => e.isKey === true).length > 1) {
                    data.row.isKey = false
                    ElMessage.warning('不允许同时存在多个主键！')
                    return
                  }
                  if (data.row.isMainKey) {
                    data.row.isKey = false
                    ElMessage.warning('不允许同时为主键和关联主键！')
                    return
                  }
                  if (data.row.isDetail) {
                    data.row.isKey = false
                    ElMessage.warning('不允许同时为主键和保存副表！')
                    return
                  }
                }
              }}
            />
          )
        }
      }
    },
    {
      field: 'isMainKey',
      label: '是否关联主键',
      slots: {
        default: (data) => {
          return (
            <ElSwitch
              v-model={data.row.isMainKey}
              active-text="是"
              inactive-text="否"
              style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
              onChange={(val) => {
                if (val) {
                  if (
                    formInfo.value.dbMapping.mapping.filter((e) => e.isMainKey === true).length > 1
                  ) {
                    data.row.isMainKey = false
                    ElMessage.warning('不允许同时存在多个关联主键！')
                    return
                  }
                  if (data.row.isKey) {
                    data.row.isMainKey = false
                    ElMessage.warning('不允许同时为主键和关联主键！')
                    return
                  }
                  if (data.row.isDetail) {
                    data.row.isMainKey = false
                    ElMessage.warning('不允许同时为关联主键和保存副表！')
                    return
                  }
                }
              }}
            />
          )
        }
      }
    },
    {
      field: 'isJson',
      label: '是否Json形式',
      slots: {
        default: (data) => {
          return (
            <ElSwitch
              v-model={data.row.isJson}
              active-text="是"
              inactive-text="否"
              style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
            />
          )
        }
      }
    },
    {
      field: 'isDetail',
      label: '是否保存副表',
      formatter: (_: Recordable, __: TableColumn, cellValue: boolean) => {
        return <ElTag type={cellValue ? 'success' : 'danger'}>{cellValue ? '是' : '否'}</ElTag>
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
              {data.row.isDetail ? (
                <BaseButton
                  bg={true}
                  text={true}
                  type="info"
                  icon={useIcon({ icon: 'tdesign:rocket' })}
                  onClick={() => actionFn(data)}
                >
                  查看附表配置
                </BaseButton>
              ) : undefined}
            </div>
          )
        }
      }
    }
  ]
}
const typeOptions = [
  { label: '单行文本', value: 'text', component: 'Input' },
  { label: '多行文本', value: 'textarea', component: 'Input' },
  { label: '年度', value: 'year', component: 'DatePicker' },
  { label: '多个年度', value: 'years', component: 'DatePicker' },
  { label: '年度范围', value: 'yearrange', component: 'DatePicker' },
  { label: '月份', value: 'month', component: 'DatePicker' },
  { label: '多个月份', value: 'months', component: 'DatePicker' },
  { label: '月份范围', value: 'monthrange', component: 'DatePicker' },
  { label: '日期', value: 'date', component: 'DatePicker' },
  { label: '多个日期', value: 'dates', component: 'DatePicker' },
  { label: '日期范围', value: 'daterange', component: 'DatePicker' },
  { label: '日期时间', value: 'datetime', component: 'DatePicker' },
  { label: '日期时间范围', value: 'datetimerange', component: 'DatePicker' },
  { label: '周', value: 'week', component: 'DatePicker' },
  { label: '算数形式', value: 'math', component: 'Captcha' },
  { label: '数字形式', value: 'char', component: 'Captcha' },
  { label: 'primary', value: 'primary', component: 'Tag' },
  { label: 'success', value: 'success', component: 'Tag' },
  { label: 'info', value: 'info', component: 'Tag' },
  { label: 'warning', value: 'warning', component: 'Tag' },
  { label: 'danger', value: 'danger', component: 'Tag' }
]

const activeTab = ref<string>('基础信息')
const activePropTab = ref('fieldProps')
const tableList = ref<SelectOption[]>([])
const formList = ref<SelectOption[]>([])
const dbTableList = ref<SelectOption[]>([])
const dbTableColumnsListOri = ref<SelectOption[]>([])
const searchList = ref<SelectOption[]>([])
const visibleDialog = ref(false)
const visibleDialog2 = ref(false)
const visibleDialog3 = ref(false)

// 刷新json格式化数据
watch(
  () => formInfo.value.formType,
  (val: number) => {
    // 填报表单
    if (val === 0) {
      formInfo.value.schema.isSearch = false
    } else {
      formInfo.value.schema.isSearch = true
      formInfo.value.dbMapping = {
        dbTableName: '',
        mapping: []
      }
      dbTableColumnsListOri.value = []
      if (val === 1) {
        // 普通查询表单
      } else if (val === 2) {
        // 我的待办查询表单
        for (const item of formTodo) {
          let index = formInfo.value.schema.formItems.findIndex(
            (item1) => item1.itemProps.prop === item.itemProps.prop
          )
          if (index === -1) {
            item.componentInfo!.key = toAnyString()
            formInfo.value.schema.formItems.push(item)
          }
        }
      } else if (val === 3) {
        // 我的已办查询表单
        for (const item of formDone) {
          let index = formInfo.value.schema.formItems.findIndex(
            (item1) => item1.itemProps.prop === item.itemProps.prop
          )
          if (index === -1) {
            item.componentInfo!.key = toAnyString()
            formInfo.value.schema.formItems.push(item)
          }
        }
      } else if (val === 4) {
        // 我发起的查询表单
        for (const item of formOwn) {
          let index = formInfo.value.schema.formItems.findIndex(
            (item1) => item1.itemProps.prop === item.itemProps.prop
          )
          if (index === -1) {
            item.componentInfo!.key = toAnyString()
            formInfo.value.schema.formItems.push(item)
          }
        }
      }
    }
  },
  { deep: true, immediate: true }
)

const dbTableColumnsList = computed(() => {
  const dbTableColumnsListLast = toRaw(dbTableColumnsListOri)
  for (const dbTableColumn of dbTableColumnsListLast.value) {
    let index = formInfo.value.schema.formItems.findIndex(
      (item) => item.itemProps.prop === dbTableColumn.value
    )
    dbTableColumn.disabled = index !== -1
  }
  return dbTableColumnsListLast
})

const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
  selectedKey.value = undefined
  selectedItem.value = undefined
}

const actionFn = (data: any) => {
  ElMessage.warning('功能待实现！')
}

// 设置字段属性之后
// 自动添加相应的表单校验初始json数据
// 修改数据库列下拉集合是被选中的字段不可再选中
// 自动添加数据库字段映射
const addRequireValidatorAndDbMapping = (val: string, component: string) => {
  if (component !== 'Divider' && !formInfo.value.schema.formValidators.hasOwnProperty(val)) {
    formInfo.value.schema.formValidators[val] = [
      {
        required: false,
        message: '必填'
      },
      {
        validator: '(_, val, callback) => {\n' + '   callback()\n' + '}'
      }
    ]
  }
  // 删除修改前的prop
  let index = formInfo.value.dbMapping.mapping.findIndex(
    (item) => item.formField === currentProp.value
  )
  if (index !== -1) {
    formInfo.value.dbMapping.mapping.splice(index, 1)
  }
  let hasColumn = false
  for (const dbTableColumn of dbTableColumnsListOri.value) {
    if (dbTableColumn.value === val) {
      hasColumn = true
    }
  }
  formInfo.value.dbMapping.mapping.push({
    dbColumn: hasColumn ? val : '',
    formField: val,
    isMainKey: false,
    isDetail: false,
    isJson: component === 'Table' || component === 'SubForm',
    isKey: false
  })
}

// 判断组件是否多选（默认有multiple的组件，且multiple为true时返回数组）
const multipleChange = (val: boolean, formItem: FormSchema) => {
  for (const mapping of formInfo.value.dbMapping.mapping) {
    if (mapping.formField === formItem.itemProps.prop) {
      mapping.isJson = val
      break
    }
  }
}

// 明细表或者子表单的isDetail属性值发生变化时，调整数据库映射中可能的附表属性
const isDetailChange = (val: boolean, formItem: FormSchema) => {
  if (val) {
    if (
      formItem.componentProps.component === 'Table' &&
      isEmpty(formItem.componentProps.tableCode)
    ) {
      formItem.componentProps.isDetail = false
      ElMessage.warning('请选择子表格！')
    }
    if (
      formItem.componentProps.component === 'SubForm' &&
      isEmpty(formItem.componentProps.formCode)
    ) {
      formItem.componentProps.isDetail = false
      ElMessage.warning('请选择子表单！')
    }
    for (const mapping of formInfo.value.dbMapping.mapping) {
      if (mapping.formField === formItem.itemProps.prop) {
        mapping.isDetail = true
        mapping.detail = {
          type: formItem.componentProps.component,
          code: formItem.componentProps.tableCode || formItem.componentProps.formCode
        }
        break
      }
    }
  } else {
    for (const mapping of formInfo.value.dbMapping.mapping) {
      if (mapping.formField === formItem.itemProps.prop) {
        mapping.isDetail = false
        delete mapping.detail
        break
      }
    }
  }
}

const setCurrentProp = (val: string) => {
  currentProp.value = val
}

const openJsDialog = (path: string) => {
  editingJsPath.value = path
  editingJs.value = get(selectedItem.value, path) || '() => {\n' + '}'
  visibleDialog.value = true
}

const confirmJs = () => {
  selectedItem.value && set(selectedItem.value, editingJsPath.value, editingJs.value)
  visibleDialog.value = false
  editingJsPath.value = ''
  editingJs.value = undefined
}

const openJsDialog2 = () => {
  selectedItem.value &&
    (editingJs.value =
      get(
        formInfo.value.schema.formValidators[selectedItem.value.itemProps.prop][1],
        'validator'
      ) || '(_, val, callback) => {\n' + '   callback()\n' + '}')
  visibleDialog2.value = true
}

const confirmJs2 = () => {
  selectedItem.value &&
    set(
      formInfo.value.schema.formValidators[selectedItem.value.itemProps.prop][1],
      'validator',
      editingJs.value
    )
  visibleDialog2.value = false
  editingJsPath.value = ''
  editingJs.value = undefined
}

const openJsDialog3 = (path: string) => {
  editingJsPath.value = path
  editingJs.value = get(formInfo.value.schema.lifecycle, path) || '() => {\n' + '}'
  visibleDialog3.value = true
}

const confirmJs3 = () => {
  selectedItem.value && set(formInfo.value.schema.lifecycle, editingJsPath.value, editingJs.value)
  visibleDialog3.value = false
  editingJsPath.value = ''
  editingJs.value = undefined
}

const formPropsApi = async () => {
  const res = await getFormPropsApi({ formId: props.formId })
  if (res.code != 200) {
    ElMessage.error(res.msg)
  } else {
    formInfo.value = res.data
    const dbTableName = res.data.dbMapping.dbTableName
    if (!isEmpty(dbTableName)) {
      await getDbTableColumns(dbTableName)
    }
  }
}

const tableListApi = async () => {
  const res = await getDictDataApi({ dictCode: 'sys_table' })
  if (res.code != 200) {
    ElMessage.error(res.msg)
    tableList.value = []
  } else {
    tableList.value = res.data?.data
  }
}

const formListApi = async () => {
  const res = await getDictDataApi({ dictCode: 'sys_form' })
  if (res.code != 200) {
    ElMessage.error(res.msg)
    formList.value = []
  } else {
    formList.value = res.data?.data
  }
}

const getDbTableColumns = async (val: string) => {
  const res = await getDictDataApi({ dictCode: 'sys_db_table_columns', params: { tableName: val } })
  if (res.code != 200) {
    ElMessage.error(res.msg)
    dbTableColumnsListOri.value = []
  } else {
    dbTableColumnsListOri.value = res.data?.data
  }
}

const dbTableListApi = async () => {
  const res = await getDictDataApi({ dictCode: 'sys_db_table' })
  if (res.code != 200) {
    ElMessage.error(res.msg)
    dbTableList.value = []
  } else {
    dbTableList.value = res.data?.data
  }
}

const searchListApi = async () => {
  const res = await getDictDataApi({ dictCode: 'sys_search_form' })
  if (res.code != 200) {
    ElMessage.error(res.msg)
    searchList.value = []
  } else {
    searchList.value = res.data?.data
  }
}

const clone = (element: FormSchema) => {
  let eleClone = JSON.parse(JSON.stringify(element))
  eleClone.componentInfo.key = toAnyString()
  return eleClone
}

const onUpdate = (element: any) => {
  let elementToMove = formInfo.value.schema.formItems?.splice(element.oldIndex, 1)[0]
  formInfo.value.schema.formItems?.splice(element.newIndex, 0, elementToMove)
}

const onAdd = (element: any) => {
  const symbols = Object.getOwnPropertySymbols(element.item)
  const cloneElementSymbol = symbols.find((sym) => sym.description === 'cloneElement')
  cloneElementSymbol &&
    formInfo.value.schema.formItems?.splice(element.newIndex, 0, element.item[cloneElementSymbol])
}

// 添加选中项的处理函数
const handleSelect = (item: FormSchema) => {
  selectedKey.value =
    selectedKey.value === item.componentInfo!.key ? undefined : item.componentInfo!.key
  selectedItem.value = selectedKey.value ? item : undefined
}

// 添加复制功能
const handleCopy = (item: FormSchema) => {
  const newItem = JSON.parse(JSON.stringify(item))
  newItem.componentInfo.key = toAnyString()
  formInfo.value.schema.formItems?.push(newItem)
}

// 添加删除功能
const handleDelete = (index: number) => {
  ElMessageBox.confirm('确定删除？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const deleted = formInfo.value.schema.formItems?.splice(index, 1)
    let index1 = formInfo.value.dbMapping.mapping.findIndex(
      (item1) => item1.formField === deleted[0].itemProps.prop
    )
    if (index1 !== -1) {
      formInfo.value.dbMapping.mapping.splice(index1, 1)
    }
    selectedKey.value = undefined
    selectedItem.value = undefined
  })
}

onMounted(() => {
  if (!isEmpty(props.formId)) {
    formPropsApi()
  }
  svgUrls.value = import.meta.glob('@/assets/svgs/form/*.svg', { eager: true })
  tableListApi()
  formListApi()
  searchListApi()
  dbTableListApi()
})
</script>

<template>
  <div style="position: relative">
    <div class="tabs-container">
      <ElScrollbar class="tabs-scrollbar">
        <div class="tabs-nav">
          <div
            v-for="item in tabs"
            v-show="item !== '数据库映射' || (item === '数据库映射' && !formInfo.schema.isSearch)"
            :key="item"
            :class="[
              'tab-item',
              'rounded-t-[16px] relative h-50px shadow-[0_8px_16px_-2px_rgba(64,158,255,0.15)] hover:shadow-[0_8px_32px_-4px_rgba(64,158,255,0.25)] flex justify-between items-center px-10px cursor-pointer',
              activeTab === item ? 'active' : ''
            ]"
            :style="{
              backgroundColor:
                activeTab === item ? 'var(--left-menu-bg-active-color)' : 'var(--el-bg-color)',
              color:
                activeTab === item
                  ? 'var(--left-menu-text-active-color)'
                  : 'var(--el-text-color-regular)'
            }"
            @click="handleTabChange(item)"
          >
            <div
              :class="[
                `tab-item-header__title`,
                'relative font-18px font-bold ml-10px duration-300 ease-in-out'
              ]"
            >
              <div class="flex items-center">
                {{ item }}
              </div>
            </div>
          </div>
        </div>
      </ElScrollbar>
    </div>
    <ElCollapseTransition>
      <!--  基本信息-->
      <div v-if="activeTab === '基础信息'">
        <ElForm :model="formInfo" label-width="auto">
          <ElFormItem label="表单代码" :required="true">
            <template #label="{ label }">
              <ElTooltip :show-after="500" content="formCode" placement="top-start">
                {{ label }}
              </ElTooltip>
            </template>
            <ElInput v-model="formInfo.formCode" clearable />
          </ElFormItem>
          <ElFormItem label="表单名称" :required="true">
            <template #label="{ label }">
              <ElTooltip :show-after="500" content="formName" placement="top-start">
                {{ label }}
              </ElTooltip>
            </template>
            <ElInput v-model="formInfo.formName" clearable />
          </ElFormItem>
          <ElRow :gutter="20">
            <ElCol :span="4">
              <ElFormItem label="表单类型">
                <template #label="{ label }">
                  <ElTooltip
                    :show-after="500"
                    content="填报表单或者表格的查询条件表单"
                    placement="top-start"
                  >
                    {{ label }}
                  </ElTooltip>
                </template>
                <ElSelect v-model="formInfo.formType">
                  <ElOption :value="0" label="填报表单" />
                  <ElOption :value="1" label="普通查询表单" />
                  <ElOption :value="2" label="我的待办查询表单" />
                  <ElOption :value="3" label="我的已办查询表单" />
                  <ElOption :value="4" label="我发起的查询表单" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol v-if="formInfo.formType === 0" :span="8">
              <ElFormItem label="数据库表">
                <template #label="{ label }">
                  <ElTooltip
                    :show-after="500"
                    content="表单数据保存在的数据库物理表表名"
                    placement="top-start"
                  >
                    {{ label }}
                  </ElTooltip>
                </template>
                <ElSelect
                  v-model="formInfo.dbMapping.dbTableName"
                  filterable
                  clearable
                  @change="getDbTableColumns"
                >
                  <ElOption
                    v-for="item in dbTableList"
                    :key="item.value"
                    :label="item.value + ' ' + item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol v-if="formInfo.formType !== 0" :span="8">
              <ElFormItem label="显示控件">
                <template #label="{ label }">
                  <ElTooltip
                    :show-after="500"
                    content="expandIndex，作为查询条件表单时，收起时显示的控件数量。"
                    placement="top-start"
                  >
                    {{ label }}
                  </ElTooltip>
                </template>
                <ElInputNumber v-model="formInfo.schema.expandIndex" :min="1" :value-on-clear="3" />
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElFormItem label="状态">
            <template #label="{ label }">
              <ElTooltip :show-after="500" content="status" placement="top-start">
                {{ label }}
              </ElTooltip>
            </template>
            <ElSwitch
              v-model="formInfo.status"
              active-text="正常"
              inactive-text="停用"
              :active-value="0"
              :inactive-value="1"
              style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
            />
          </ElFormItem>
          <ElFormItem label="说明">
            <template #label="{ label }">
              <ElTooltip :show-after="500" content="remark" placement="top-start">
                {{ label }}
              </ElTooltip>
            </template>
            <ElInput v-model="formInfo.remark" type="textarea" clearable />
          </ElFormItem>
        </ElForm>
      </div>
    </ElCollapseTransition>
    <ElCollapseTransition>
      <!--  可视化设计-->
      <div v-if="activeTab === '可视化设计'">
        <el-row :gutter="10">
          <el-col :span="4">
            <ContentWrap title="可选组件">
              <div style="height: 70vh">
                <el-scrollbar style="height: 100%">
                  <ElRow
                    :gutter="10"
                    v-draggable="[
                      componentList,
                      {
                        animation: 150,
                        group: { name: 'comp', pull: 'clone', put: false },
                        sort: false,
                        clone
                      }
                    ]"
                  >
                    <ElCol :span="12" v-for="item in componentList" :key="item.componentInfo?.type">
                      <ElTooltip
                        :content="item.componentInfo?.type"
                        placement="top-start"
                        :show-after="500"
                      >
                        <div class="list-complete-item0">
                          <Icon :icon="item.componentInfo?.icon" />
                          <span class="m-l-1">{{ item.componentInfo?.title }}</span>
                        </div>
                      </ElTooltip>
                    </ElCol>
                  </ElRow>
                </el-scrollbar>
              </div>
            </ContentWrap>
          </el-col>
          <el-col :span="14">
            <ContentWrap title="设计区域">
              <div style="height: 70vh">
                <el-scrollbar style="height: 100%">
                  <ElRow
                    :gutter="10"
                    class="bg-gray-500/5"
                    v-draggable="[
                      [],
                      {
                        animation: 1000,
                        group: 'comp',
                        onUpdate,
                        onAdd
                      }
                    ]"
                  >
                    <ElCol
                      v-for="(item, index) in formInfo.schema.formItems"
                      :key="item.componentInfo?.key"
                      :span="item.componentInfo?.type === 'Divider' ? 24 : item.colProps?.span"
                      style="padding-top: 10px"
                    >
                      <div
                        class="list-complete-item1"
                        :class="{ 'item-selected': selectedKey === item.componentInfo?.key }"
                        @click="handleSelect(item)"
                      >
                        <div class="preview-row">
                          <span class="label-text">
                            {{ item.itemProps.label || item.componentInfo?.title }}
                          </span>
                          <img
                            :src="
                              (
                                svgUrls[
                                  '/src/assets/svgs/form/' + item.componentInfo?.type + '.svg'
                                ] || svgUrls['/src/assets/svgs/form/Default.svg']
                              ).default
                            "
                            alt="control-preview"
                            class="control-preview"
                          />
                        </div>
                        <div v-if="selectedKey === item.componentInfo?.key" class="item-actions">
                          <ElTooltip :show-after="500" content="复制" placement="top">
                            <div
                              class="action-btn"
                              style="background-color: var(--el-color-success-light-3)"
                              @click.stop="handleCopy(item)"
                            >
                              <Icon icon="ep:copy-document" />
                            </div>
                          </ElTooltip>
                          <ElTooltip :show-after="500" content="删除" placement="top">
                            <div
                              class="action-btn"
                              style="background-color: var(--el-color-danger-light-3)"
                              @click.stop="handleDelete(index)"
                            >
                              <Icon icon="ep:delete" />
                            </div>
                          </ElTooltip>
                        </div>
                      </div>
                    </ElCol>
                  </ElRow>
                </el-scrollbar>
              </div>
            </ContentWrap>
          </el-col>
          <el-col :span="6">
            <ContentWrap title="属性配置" class="h-full">
              <template #header>
                <div class="prop-header">
                  <div class="prop-tabs">
                    <div
                      v-for="tab in propTabs"
                      :key="tab.name"
                      class="prop-tab-item"
                      :class="{ active: activePropTab === tab.name }"
                      @click="activePropTab = tab.name"
                    >
                      {{ tab.label }}
                    </div>
                  </div>
                </div>
              </template>
              <div style="height: 70vh">
                <el-scrollbar style="height: 100%">
                  <div v-if="activePropTab === 'fieldProps' && selectedItem">
                    <el-divider v-if="selectedItem.colProps" content-position="left">
                      <span
                        style="color: var(--el-color-primary); font-weight: bold; cursor: pointer"
                        @click="form1 = !form1"
                      >
                        布局属性（Col）
                      </span>
                    </el-divider>
                    <ElForm
                      size="small"
                      v-if="form1 && selectedItem.colProps"
                      :model="selectedItem.colProps"
                      label-width="auto"
                    >
                      <ElRow :gutter="6">
                        <ElCol :span="12">
                          <ElFormItem label="栅格数">
                            <template #label="{ label }">
                              <ElTooltip :show-after="500" content="span" placement="top-start">
                                {{ label }}
                              </ElTooltip>
                            </template>
                            <ElInputNumber
                              v-model="selectedItem.colProps.span"
                              :value-on-clear="1"
                              :min="1"
                              :max="24"
                              controls-position="right"
                            />
                          </ElFormItem>
                        </ElCol>
                        <ElCol :span="12">
                          <ElFormItem label="栅格数">
                            <template #label="{ label }">
                              <ElTooltip :show-after="500" content="xs" placement="top-start">
                                {{ label }}
                              </ElTooltip>
                            </template>
                            <ElInputNumber
                              v-model="selectedItem.colProps.xs"
                              :value-on-clear="24"
                              :min="1"
                              :max="24"
                              controls-position="right"
                            />
                          </ElFormItem>
                        </ElCol>
                        <ElCol :span="12">
                          <ElFormItem label="栅格数">
                            <template #label="{ label }">
                              <ElTooltip :show-after="500" content="sm" placement="top-start">
                                {{ label }}
                              </ElTooltip>
                            </template>
                            <ElInputNumber
                              v-model="selectedItem.colProps.sm"
                              :value-on-clear="12"
                              :min="1"
                              :max="24"
                              controls-position="right"
                            />
                          </ElFormItem>
                        </ElCol>
                        <ElCol :span="12">
                          <ElFormItem label="栅格数">
                            <template #label="{ label }">
                              <ElTooltip :show-after="500" content="md" placement="top-start">
                                {{ label }}
                              </ElTooltip>
                            </template>
                            <ElInputNumber
                              v-model="selectedItem.colProps.md"
                              :value-on-clear="12"
                              :min="1"
                              :max="24"
                              controls-position="right"
                            />
                          </ElFormItem>
                        </ElCol>
                        <ElCol :span="12">
                          <ElFormItem label="栅格数">
                            <template #label="{ label }">
                              <ElTooltip :show-after="500" content="lg" placement="top-start">
                                {{ label }}
                              </ElTooltip>
                            </template>
                            <ElInputNumber
                              v-model="selectedItem.colProps.lg"
                              :value-on-clear="12"
                              :min="1"
                              :max="24"
                              controls-position="right"
                            />
                          </ElFormItem>
                        </ElCol>
                        <ElCol :span="12">
                          <ElFormItem label="栅格数">
                            <template #label="{ label }">
                              <ElTooltip :show-after="500" content="xl" placement="top-start">
                                {{ label }}
                              </ElTooltip>
                            </template>
                            <ElInputNumber
                              v-model="selectedItem.colProps.xl"
                              :value-on-clear="12"
                              :min="1"
                              :max="24"
                              controls-position="right"
                            />
                          </ElFormItem>
                        </ElCol>
                      </ElRow>
                    </ElForm>
                    <el-divider v-if="selectedItem.itemProps" content-position="left">
                      <span
                        style="color: var(--el-color-primary); font-weight: bold; cursor: pointer"
                        @click="form2 = !form2"
                      >
                        表单组件属性（FormItem）
                      </span>
                    </el-divider>
                    <ElForm
                      v-show="form2"
                      size="small"
                      :model="selectedItem.itemProps"
                      label-width="auto"
                    >
                      <ElFormItem label="字段值" :required="true">
                        <template #label="{ label }">
                          <ElTooltip :show-after="500" content="prop" placement="top-start">
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElSelect
                          v-model="selectedItem.itemProps.prop"
                          clearable
                          filterable
                          allow-create
                          @focus="setCurrentProp(selectedItem.itemProps.prop)"
                          @change="
                            (val) =>
                              addRequireValidatorAndDbMapping(
                                val,
                                selectedItem.componentProps.component
                              )
                          "
                        >
                          <ElOption
                            v-for="item in dbTableColumnsList.value"
                            :key="item.value"
                            :label="item.value + ' ' + item.label"
                            :value="item.value"
                            :disabled="item.disabled === true"
                            @click="item.label && (selectedItem.itemProps.label = item.label)"
                          />
                        </ElSelect>
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.component !== 'Divider'"
                        label="标签文本"
                      >
                        <template #label="{ label }">
                          <ElTooltip :show-after="500" content="label" placement="top-start">
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElInput v-model="selectedItem.itemProps.label" clearable />
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.component !== 'Divider'"
                        label="提示"
                      >
                        <template #label="{ label }">
                          <ElTooltip :show-after="500" content="tip" placement="top-start">
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElInput v-model="selectedItem.itemProps.tip" clearable />
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.component !== 'Divider'"
                        label="更多属性"
                      >
                        <template #label="{ label }">
                          <ElTooltip
                            :show-after="500"
                            content="更多其他未罗列、不常用的属性"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <CodeEditor
                          v-model="selectedItem.itemProps.others"
                          :editorOption="{ lineNumbers: 'off' }"
                          language="json"
                          height="20vh"
                          width="200"
                        />
                      </ElFormItem>
                    </ElForm>
                    <el-divider v-if="selectedItem.componentProps" content-position="left">
                      <span
                        style="color: var(--el-color-primary); font-weight: bold; cursor: pointer"
                        @click="form3 = !form3"
                      >
                        控件属性（Components）
                      </span>
                    </el-divider>
                    <ElForm
                      v-show="form3"
                      size="small"
                      :model="selectedItem.componentProps"
                      label-width="auto"
                    >
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('disabled')"
                        label="禁用"
                      >
                        <template #label="{ label }">
                          <ElTooltip :show-after="500" content="disabled" placement="top-start">
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElSwitch
                          v-model="selectedItem.componentProps.disabled"
                          active-text="是"
                          inactive-text="否"
                          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                        />
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('showPassword')"
                        label="密码框"
                      >
                        <template #label="{ label }">
                          <ElTooltip :show-after="500" content="showPassword" placement="top-start">
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElSwitch
                          v-model="selectedItem.componentProps.showPassword"
                          active-text="是"
                          inactive-text="否"
                          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                        />
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('type')"
                        label="类型"
                      >
                        <template #label="{ label }">
                          <ElTooltip :show-after="500" content="type" placement="top-start">
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElSelect v-model="selectedItem.componentProps.type">
                          <ElOption
                            v-for="item in typeOptions"
                            :key="item.value"
                            v-show="selectedItem.componentProps.component === item.component"
                            :label="item.label"
                            :value="item.value"
                          />
                        </ElSelect>
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('clearable')"
                        label="可清空"
                      >
                        <template #label="{ label }">
                          <ElTooltip :show-after="500" content="clearable" placement="top-start">
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElSwitch
                          v-model="selectedItem.componentProps.clearable"
                          active-text="是"
                          inactive-text="否"
                          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                        />
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('precision')"
                        label="精度"
                      >
                        <template #label="{ label }">
                          <ElTooltip :show-after="500" content="precision" placement="top-start">
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElInputNumber
                          v-model="selectedItem.componentProps.precision"
                          :value-on-clear="0"
                          :min="0"
                          :max="5"
                          controls-position="right"
                        />
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('options')"
                        label="选项值"
                      >
                        <template #label="{ label }">
                          <ElTooltip
                            content="静态数据列表（JSON数组形式，label：显示值；value：实际值；disabled：是否可选）"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <CodeEditor
                          v-model="selectedItem.componentProps.options"
                          :editorOption="{ lineNumbers: 'off' }"
                          language="json"
                          height="20vh"
                          width="200"
                        />
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('query')"
                        label="字典"
                      >
                        <template #label="{ label }">
                          <ElTooltip
                            content="后台字典（JSON形式，dictCode：字典代码；params：过滤条件；优先级高于静态数据列表）"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <CodeEditor
                          v-model="selectedItem.componentProps.query"
                          :editorOption="{ lineNumbers: 'off' }"
                          language="json"
                          height="20vh"
                          width="200"
                        />
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('data')"
                        label="选项值"
                      >
                        <template #label="{ label }">
                          <ElTooltip
                            content="静态数据列表（JSON数组形式，label：显示值；value：实际值；disabled：是否可选；children：下级数据）"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <CodeEditor
                          v-model="selectedItem.componentProps.data"
                          :editorOption="{ lineNumbers: 'off' }"
                          language="json"
                          height="20vh"
                          width="200"
                        />
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('multiple')"
                        label="多选"
                      >
                        <template #label="{ label }">
                          <ElTooltip :show-after="500" content="multiple" placement="top-start">
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElSwitch
                          v-model="selectedItem.componentProps.multiple"
                          active-text="是"
                          inactive-text="否"
                          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                          @change="(val: boolean) => multipleChange(val, selectedItem)"
                        />
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('valueFormat')"
                        label="格式化"
                      >
                        <template #label="{ label }">
                          <ElTooltip
                            content="valueFormat（例如：YYYY-MM-DD HH:mm:ss，如为空，则返回Date对象）"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElInput v-model="selectedItem.componentProps.valueFormat" clearable />
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('showAlpha')"
                        label="透明度"
                      >
                        <template #label="{ label }">
                          <ElTooltip :show-after="500" content="showAlpha" placement="top-start">
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElSwitch
                          v-model="selectedItem.componentProps.showAlpha"
                          active-text="是"
                          inactive-text="否"
                          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                        />
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('tableCode')"
                        label="子表格"
                      >
                        <template #label="{ label }">
                          <ElTooltip
                            :show-after="500"
                            content="后台设计的tableCode值"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElSelect v-model="selectedItem.componentProps.tableCode">
                          <ElOption
                            v-for="item in tableList"
                            :key="item.value"
                            :label="item.label + ' ' + item.value"
                            :value="item.value"
                            @click="selectedItem.componentProps['db_mapping'] = item.db_mapping"
                          />
                        </ElSelect>
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('formCode')"
                        label="子表单"
                      >
                        <template #label="{ label }">
                          <ElTooltip
                            :show-after="500"
                            content="后台设计的formCode值"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElSelect v-model="selectedItem.componentProps.formCode">
                          <ElOption
                            v-for="item in formList"
                            :key="item.value"
                            :label="item.label + ' ' + item.value"
                            :value="item.value"
                            @click="selectedItem.componentProps['db_mapping'] = item.db_mapping"
                          />
                        </ElSelect>
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('isDetail')"
                        label="产生副表"
                      >
                        <template #label="{ label }">
                          <ElTooltip
                            :show-after="500"
                            content="作为明细数据时，是否需要保存到明细表中"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElSwitch
                          v-model="selectedItem.componentProps.isDetail"
                          active-text="是"
                          inactive-text="否"
                          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                          @change="(val: boolean) => isDetailChange(val, selectedItem)"
                        />
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('table')"
                        label="表格"
                      >
                        <template #label="{ label }">
                          <ElTooltip
                            :show-after="500"
                            content="后台设计的tableCode值"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElSelect v-model="selectedItem.componentProps.table">
                          <ElOption
                            v-for="item in tableList"
                            :key="item.value"
                            :label="item.label + ' ' + item.value"
                            :value="item.value"
                          />
                        </ElSelect>
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('search')"
                        label="查询条件"
                      >
                        <template #label="{ label }">
                          <ElTooltip
                            :show-after="500"
                            content="后台设计的查询表单formCode值"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElSelect v-model="selectedItem.componentProps.search">
                          <ElOption
                            v-for="item in searchList"
                            :key="item.value"
                            :label="item.label + ' ' + item.value"
                            :value="item.value"
                          />
                        </ElSelect>
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.component === 'SelectTable'"
                        label="选中事件"
                      >
                        <template #label="{ label }">
                          <ElTooltip
                            content="选中数据操作函数（如赋值给表单某一个字段）"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <CodeEditor
                          v-model="selectedItem.componentProps.on.select"
                          :editorOption="{ lineNumbers: 'off' }"
                          language="javascript"
                          height="20vh"
                          width="200"
                        />
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('language')"
                        label="语言"
                      >
                        <template #label="{ label }">
                          <ElTooltip
                            :show-after="500"
                            content="设计器兼容的语言"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElSelect v-model="selectedItem.componentProps.language">
                          <ElOption value="javascript" label="javascript" />
                          <ElOption value="sql" label="sql" />
                          <ElOption value="json" label="json" />
                          <ElOption value="mysql" label="mysql" />
                          <ElOption value="pgsql" label="pgsql" />
                          <ElOption value="html" label="html" />
                        </ElSelect>
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('title')"
                        label="标题"
                      >
                        <template #label="{ label }">
                          <ElTooltip
                            :show-after="500"
                            content="显示的标题文本"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElInput v-model="selectedItem.componentProps.title" clearable />
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('collapses')"
                        label="收起"
                      >
                        <template #label="{ label }">
                          <ElTooltip
                            content="collapses（初始化时是收起或展开状态）"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElSwitch
                          v-model="selectedItem.componentProps.collapses"
                          active-text="是"
                          inactive-text="否"
                          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                        />
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('text')"
                        label="标题"
                      >
                        <template #label="{ label }">
                          <ElTooltip :show-after="500" content="内容" placement="top-start">
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElInput v-model="selectedItem.componentProps.text" clearable />
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('link')"
                        label="链接"
                      >
                        <template #label="{ label }">
                          <ElTooltip
                            content="高亮可跳转链接（JSON数组形式，text：高亮内容；url：跳转链接）"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <CodeEditor
                          v-model="selectedItem.componentProps.link"
                          :editorOption="{ lineNumbers: 'off' }"
                          language="json"
                          height="20vh"
                          width="200"
                        />
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('staticText')"
                        label="显示内容"
                      >
                        <template #label="{ label }">
                          <ElTooltip :show-after="500" content="staticText" placement="top-start">
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElInput v-model="selectedItem.componentProps.staticText" clearable />
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('schema')"
                        label="内容"
                      >
                        <template #label="{ label }">
                          <ElTooltip
                            content="显示的详细说明内容（JSON数组形式，label：说明内容；keys：其中高亮内容）"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <CodeEditor
                          v-model="selectedItem.componentProps.schema"
                          :editorOption="{ lineNumbers: 'off' }"
                          language="json"
                          height="20vh"
                          width="200"
                        />
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('others')"
                        label="更多属性"
                      >
                        <template #label="{ label }">
                          <ElTooltip
                            :show-after="500"
                            content="更多其他未罗列、不常用的属性"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <CodeEditor
                          v-model="selectedItem.componentProps.others"
                          :editorOption="{ lineNumbers: 'off' }"
                          language="json"
                          height="20vh"
                          width="200"
                        />
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('slots')"
                        label="插槽"
                      >
                        <template #label="{ label }">
                          <ElTooltip :show-after="500" content="slots" placement="top-start">
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <CodeEditor
                          v-model="selectedItem.componentProps.slots"
                          :editorOption="{ lineNumbers: 'off' }"
                          language="json"
                          height="20vh"
                          width="200"
                        />
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('on')"
                        label="事件"
                      >
                        <template #label="{ label }">
                          <ElTooltip
                            :show-after="500"
                            content="各种on事件（如：change等）"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <base-button
                          size="small"
                          v-if="selectedItem.componentProps.on.hasOwnProperty('click')"
                          :type="selectedItem.componentProps.on.click ? 'success' : ''"
                          @click="openJsDialog('componentProps.on.click')"
                          >click</base-button
                        >
                        <base-button
                          size="small"
                          v-if="selectedItem.componentProps.on.hasOwnProperty('change')"
                          :type="selectedItem.componentProps.on.change ? 'success' : ''"
                          @click="openJsDialog('componentProps.on.change')"
                          >change</base-button
                        >
                        <base-button
                          size="small"
                          v-if="selectedItem.componentProps.on.hasOwnProperty('select')"
                          :type="selectedItem.componentProps.on.select ? 'success' : ''"
                          @click="openJsDialog('componentProps.on.select')"
                          >select</base-button
                        >
                      </ElFormItem>
                      <ElFormItem
                        v-if="selectedItem.componentProps.hasOwnProperty('lifecycle')"
                        label="生命周期"
                      >
                        <template #label="{ label }">
                          <ElTooltip
                            content="组件生命周期事件（包括：mounted、updated、unmounted）"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <base-button
                          size="small"
                          @click="openJsDialog('componentProps.lifecycle.mounted')"
                          :type="selectedItem.componentProps.lifecycle.mounted ? 'success' : ''"
                        >
                          mounted
                        </base-button>
                        <base-button
                          size="small"
                          @click="openJsDialog('componentProps.lifecycle.updated')"
                          :type="selectedItem.componentProps.lifecycle.updated ? 'success' : ''"
                        >
                          updated
                        </base-button>
                        <base-button
                          size="small"
                          @click="openJsDialog('componentProps.lifecycle.unmounted')"
                          :type="selectedItem.componentProps.lifecycle.unmounted ? 'success' : ''"
                        >
                          unmounted
                        </base-button>
                      </ElFormItem>
                    </ElForm>
                    <el-divider content-position="left">
                      <span
                        style="color: var(--el-color-primary); font-weight: bold; cursor: pointer"
                        @click="form4 = !form4"
                      >
                        其它属性
                      </span>
                    </el-divider>
                    <ElForm v-show="form4" size="small" :model="selectedItem" label-width="auto">
                      <ElFormItem label="渲染">
                        <template #label="{ label }">
                          <ElTooltip :show-after="500" content="v-if" placement="top-start">
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElSwitch
                          v-model="selectedItem.hidden"
                          active-text="是"
                          inactive-text="否"
                          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                        />
                      </ElFormItem>
                      <ElFormItem label="显示">
                        <template #label="{ label }">
                          <ElTooltip :show-after="500" content="v-show" placement="top-start">
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElSwitch
                          v-model="selectedItem.display"
                          active-text="是"
                          inactive-text="否"
                          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                        />
                      </ElFormItem>
                      <ElFormItem label="权限控制">
                        <template #label="{ label }">
                          <ElTooltip
                            content="用于角色权限控制，必须保证全系统唯一"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElInput v-model="selectedItem.permi" clearable />
                      </ElFormItem>
                    </ElForm>
                    <el-divider
                      v-if="
                        selectedItem.componentProps.component !== 'Divider' &&
                        formInfo.schema.formValidators[selectedItem.itemProps.prop]
                      "
                      content-position="left"
                    >
                      <span
                        style="color: var(--el-color-primary); font-weight: bold; cursor: pointer"
                        @click="form5 = !form5"
                      >
                        校验规则
                      </span>
                    </el-divider>
                    <ElForm
                      v-if="
                        selectedItem.componentProps.component !== 'Divider' &&
                        form5 &&
                        formInfo.schema.formValidators[selectedItem.itemProps.prop]
                      "
                      :model="formInfo.schema.formValidators"
                      label-width="auto"
                    >
                      <ElFormItem label="必填">
                        <ElSwitch
                          v-model="
                            formInfo.schema.formValidators[selectedItem.itemProps.prop][0].required
                          "
                          active-text="是"
                          inactive-text="否"
                          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                        />
                      </ElFormItem>
                      <ElFormItem
                        v-if="
                          formInfo.schema.formValidators[selectedItem.itemProps.prop][0].required
                        "
                        label="必填提醒"
                      >
                        <ElInput
                          v-model="
                            formInfo.schema.formValidators[selectedItem.itemProps.prop][0].message
                          "
                          clearable
                        />
                      </ElFormItem>
                      <ElFormItem label="自定义规则">
                        <template #label="{ label }">
                          <ElTooltip
                            content="通过编写js函数实现复杂的校验规则。如：callback(new Error('校验不通过'))"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <base-button
                          size="small"
                          :type="
                            formInfo.schema.formValidators[selectedItem.itemProps.prop][1].validator
                              ? 'success'
                              : ''
                          "
                          @click="openJsDialog2"
                        >
                          校验规则代码
                        </base-button>
                      </ElFormItem>
                    </ElForm>
                  </div>
                  <div v-if="activePropTab === 'formProps'">
                    <ElForm :model="formInfo.schema" size="small" label-width="auto">
                      <ElFormItem label="尺寸">
                        <template #label="{ label }">
                          <ElTooltip :show-after="500" content="整体控件尺寸" placement="top-start">
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElSelect v-model="formInfo.schema.size">
                          <ElOption value="small" label="小号" />
                          <ElOption value="default" label="默认" />
                          <ElOption value="large" label="大号" />
                        </ElSelect>
                      </ElFormItem>
                      <ElFormItem label="标签长度" :required="true">
                        <template #label="{ label }">
                          <ElTooltip
                            content="labelWidth，例如 '50px'。 作为 Form 直接子元素的 form-item 会继承该值。 可以使用 auto。"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElInput v-model="formInfo.schema.labelWidth" clearable />
                      </ElFormItem>
                      <ElFormItem label="标签位置">
                        <template #label="{ label }">
                          <ElTooltip
                            content="labelPosition，表单域标签的位置， 当设置为 left 或 right 时，则也需要设置 label-width 属性。"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElSelect v-model="formInfo.schema.labelPosition">
                          <ElOption value="left" label="left" />
                          <ElOption value="right" label="right" />
                          <ElOption value="top" label="top" />
                        </ElSelect>
                      </ElFormItem>
                      <ElFormItem label="自动占位">
                        <template #label="{ label }">
                          <ElTooltip
                            :show-after="500"
                            content="autoSetPlaceholder。为控件自动设置站位内容；如：文本框显示“请填写”。"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElSwitch
                          v-model="formInfo.schema.autoSetPlaceholder"
                          active-text="是"
                          inactive-text="否"
                          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                        />
                      </ElFormItem>
                      <ElFormItem label="展示模式">
                        <template #label="{ label }">
                          <ElTooltip
                            :show-after="500"
                            content="mode。示例模式会展示组件源码。"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElSelect v-model="formInfo.schema.mode">
                          <ElOption value="edit" label="可编辑模式" />
                          <ElOption value="view" label="查看模式" />
                          <ElOption value="demo" label="示例模式" />
                        </ElSelect>
                      </ElFormItem>
                      <ElFormItem label="分组方式">
                        <template #label="{ label }">
                          <ElTooltip :show-after="500" content="dividerType" placement="top-start">
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElSelect v-model="formInfo.schema.dividerType">
                          <ElOption value="lines" label="分割线模式" />
                          <ElOption value="tabs" label="页签模式" />
                        </ElSelect>
                      </ElFormItem>
                      <ElFormItem v-if="!formInfo.schema.isSearch" label="显示方式">
                        <template #label="{ label }">
                          <ElTooltip
                            :show-after="500"
                            content="isDescription。描述列表指：展示成el-descriptions效果的表单。"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElSwitch
                          v-model="formInfo.schema.isDescription"
                          active-text="描述列表"
                          inactive-text="普通表单"
                          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                        />
                      </ElFormItem>
                      <ElFormItem v-if="formInfo.schema.isDescription" label="标签位置">
                        <template #label="{ label }">
                          <ElTooltip
                            :show-after="500"
                            content="direction。描述列表状态下，标签显示的位置。此时，labelPosition失效。"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <ElSelect v-model="formInfo.schema.direction">
                          <ElOption value="vertical" label="垂直" />
                          <ElOption value="horizontal" label="水平" />
                        </ElSelect>
                      </ElFormItem>
                      <ElFormItem label="其他属性">
                        <template #label="{ label }">
                          <ElTooltip
                            :show-after="500"
                            content="others。其他不常用、未列举的属性。"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <CodeEditor
                          v-model="formInfo.schema.others"
                          :editorOption="{ lineNumbers: 'off' }"
                          language="json"
                          height="20vh"
                          width="200"
                        />
                      </ElFormItem>
                      <ElFormItem label="生命周期">
                        <template #label="{ label }">
                          <ElTooltip
                            content="生命表单周期事件（包括：mounted、updated、unmounted）"
                            placement="top-start"
                          >
                            {{ label }}
                          </ElTooltip>
                        </template>
                        <base-button
                          size="small"
                          :type="formInfo.schema.lifecycle.mounted ? 'success' : ''"
                          @click="openJsDialog3('mounted')"
                        >
                          mounted
                        </base-button>
                        <base-button
                          size="small"
                          :type="formInfo.schema.lifecycle.updated ? 'success' : ''"
                          @click="openJsDialog3('updated')"
                        >
                          updated
                        </base-button>
                        <base-button
                          size="small"
                          :type="formInfo.schema.lifecycle.unmounted ? 'success' : ''"
                          @click="openJsDialog3('unmounted')"
                        >
                          unmounted
                        </base-button>
                      </ElFormItem>
                    </ElForm>
                  </div>
                </el-scrollbar>
              </div>
            </ContentWrap>
          </el-col>
        </el-row>
      </div>
    </ElCollapseTransition>
    <ElCollapseTransition>
      <!--  数据库字段映射-->
      <Table
        v-if="activeTab === '数据库映射'"
        ref="tt"
        v-model="formInfo.dbMapping.mapping"
        v-bind="dbMappingProps"
      />
    </ElCollapseTransition>
    <ElCollapseTransition>
      <!--  JSON格式化数据-->
      <CodeEditor
        v-if="activeTab === 'JSON格式化数据'"
        v-model="formInfo"
        :editorOption="{ lineNumbers: 'off' }"
        language="json"
        height="70vh"
        width="200"
      />
    </ElCollapseTransition>
    <ElCollapseTransition>
      <!--  表单预览-->
      <Form v-if="activeTab === '表单预览'" :schema="JSON.parse(JSON.stringify(formInfo.schema))" />
    </ElCollapseTransition>
  </div>
  <el-dialog title="js代码" v-model="visibleDialog" append-to-body destroy-on-close>
    <CodeEditor
      v-model="editingJs"
      :editorOption="{ lineNumbers: 'off' }"
      language="javascript"
      height="40vh"
      width="200"
    />
    <Infotip
      class="m-t-1"
      :show-index="false"
      title="编写要求"
      :schema="[
        {
          label: '支持所有原生js函数'
        },
        {
          label: '支持以下自定义js函数：'
        }
      ]"
    />
    <template #footer>
      <div class="dialog-footer">
        <base-button
          @click="
            () => {
              visibleDialog = false
              editingJs = undefined
              editingJsPath = ''
            }
          "
          >取消</base-button
        >
        <base-button type="primary" @click="confirmJs"> 确认 </base-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog title="自定义校验js代码" v-model="visibleDialog2" append-to-body destroy-on-close>
    <CodeEditor
      v-model="editingJs"
      :editorOption="{ lineNumbers: 'off' }"
      language="javascript"
      height="40vh"
      width="200"
    />
    <Infotip
      class="m-t-1"
      :show-index="false"
      title="编写要求"
      :schema="[
        {
          label: '支持所有原生js函数'
        },
        {
          label: '支持以下自定义js函数：'
        }
      ]"
    />
    <template #footer>
      <div class="dialog-footer">
        <base-button
          @click="
            () => {
              visibleDialog2 = false
              editingJs = undefined
              editingJsPath = ''
            }
          "
          >取消</base-button
        >
        <base-button type="primary" @click="confirmJs2"> 确认 </base-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog title="表单生命周期js代码" v-model="visibleDialog3" append-to-body destroy-on-close>
    <CodeEditor
      v-model="editingJs"
      :editorOption="{ lineNumbers: 'off' }"
      language="javascript"
      height="40vh"
      width="200"
    />
    <Infotip
      class="m-t-1"
      :show-index="false"
      title="编写要求"
      :schema="[
        {
          label: '支持所有原生js函数'
        },
        {
          label: '支持以下自定义js函数：'
        }
      ]"
    />
    <template #footer>
      <div class="dialog-footer">
        <base-button
          @click="
            () => {
              visibleDialog3 = false
              editingJs = undefined
              editingJsPath = ''
            }
          "
          >取消</base-button
        >
        <base-button type="primary" @click="confirmJs3"> 确认 </base-button>
      </div>
    </template>
  </el-dialog>
</template>
<style lang="less" scoped>
.list-complete-item0 {
  cursor: pointer;
  font-size: 12px;
  padding: 5px;
  margin-bottom: 10px;
  width: 90%;
  border: 1px solid #bfcbd9;
  border-radius: 5px;
  transition: all 1s;

  &:hover {
    background-color: var(--el-color-primary-light-9);
  }
}

.list-complete-item1 {
  cursor: pointer;
  padding: 5px;
  margin-bottom: 10px;
  transition: all 0.3s;
  position: relative;
  height: 40px;
  border-radius: 5px;

  &:hover {
    background-color: var(--el-color-primary-light-9);
  }
}

// 添加选中样式
.item-selected {
  background-color: var(--el-color-primary-light-8);
  border: 1px solid var(--el-color-primary);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

// 添加操作按钮样式
.item-actions {
  position: absolute;
  top: -10px;
  right: 2px;
  display: flex;
  gap: 5px;
}

.action-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.1);
  }
}

.tabs-container {
  position: sticky;
  top: 0;
  z-index: 10;
  margin-bottom: 15px;
  background-color: var(--el-bg-color-overlay);
  border-radius: 16px 16px 0 0;
}

.tabs-scrollbar {
  overflow-x: auto;
  white-space: nowrap;
}

.tabs-nav {
  display: flex;
  flex-wrap: nowrap;
  margin-bottom: 10px;
  gap: 10px;
}

.tab-item {
  min-width: 150px;
  transition: all 0.3s;

  &.active {
    border-bottom: 2px solid var(--el-color-primary);
  }

  .tab-item-header__title {
    &::after {
      position: absolute;
      top: 3px;
      left: -10px;
      width: 4px;
      height: 70%;
      background: var(--el-color-primary);
      content: '';
    }
  }
}

.tab-item-header {
  &__title {
    &::after {
      position: absolute;
      top: 3px;
      left: -10px;
      width: 4px;
      height: 70%;
      background: var(--el-color-primary);
      content: '';
    }
  }
}

// 添加属性配置页签样式
.prop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.prop-title {
  font-weight: bold;
  font-size: 16px;
}

.prop-tabs {
  display: flex;
  margin-bottom: 0;
}

.prop-tab-item {
  padding: 0 16px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  position: relative;

  &.active {
    color: var(--el-color-primary);

    &::after {
      content: '';
      position: absolute;
      bottom: -20px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: var(--el-color-primary);
    }
  }

  &:hover {
    color: var(--el-color-primary);
  }
}

:deep(.el-form-item__label) {
  font-weight: bold !important;
}

.preview-row {
  display: flex;
  align-items: center;
}

.label-text {
  font-size: var(--el-font-size-small);
  white-space: nowrap;
  flex: 0 0 auto;
}

.control-preview {
  min-width: 0;
  height: 40px;
  width: 100%;
  display: block;
  flex: 1 1 auto;
}
</style>
