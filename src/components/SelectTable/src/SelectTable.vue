<script setup lang="ts">
import { ref, onMounted, unref } from 'vue'
import {
  ElAside,
  ElContainer,
  ElHeader,
  ElInput,
  ElMain,
  ElMessage,
  ElDrawer,
  ElScrollbar,
  ElTree
} from 'element-plus'
import { BaseButton } from '@/components/Button'
import { propTypes } from '@/utils/propTypes'
import { useConfigGlobal } from '@/hooks/web/useConfigGlobal'
import { useDesign } from '@/hooks/web/useDesign'
import { getDictDataApi, getFormInfoApi, getTableInfoApi } from '@/api/common'
import { listToTree } from '@/utils/tree'
import { Search } from '@/components/Search'
import { Table } from '@/components/Table'
import { ContentWrap } from '@/components/ContentWrap'

const { getPrefixCls } = useDesign()
const { configGlobal } = useConfigGlobal()
const prefixCls = getPrefixCls('select-table')

const props = defineProps({
  modelValue: Array<Recordable>,
  side: propTypes.string.def(undefined),
  search: propTypes.string.def(undefined),
  table: propTypes.string.def(undefined)
})
const emit = defineEmits(['select'])

const searchInfo = ref()
const tableInfo = ref()
const sideInfo = ref()
const tableExpose = ref()
const filterText = ref('')
const visible = ref(false)
const treeRef = ref<InstanceType<typeof ElTree>>()

const handleSearch = (data: Recordable) => {
  unref(tableExpose).setQueryParams(data)
  unref(tableExpose).refresh()
}

const currentChange = (data: Recordable) => {
  unref(tableExpose).setQueryParams({
    [sideInfo.value!.alias]: data[sideInfo.value!.nodeKey || 'id']
  })
  unref(tableExpose).refresh()
}

const tableRegister = (objs: any) => {
  tableExpose.value = objs
}

const filterNode = (value: string, data: Recordable) => {
  if (!value) return true
  return data[sideInfo.value!.props.label || 'label'].includes(value)
}

const renderSearch = async (searchCode: string) => {
  if (searchCode) {
    const res = await getFormInfoApi({ code: searchCode })
    if (res.code != 200) {
      ElMessage.error(res.msg)
      searchInfo.value = undefined
    } else {
      searchInfo.value = res.data
    }
  } else {
    searchInfo.value = undefined
  }
  props.table && (await renderTable(props.table))
}

const renderTable = async (tableCode: string) => {
  if (tableCode) {
    const res = await getTableInfoApi({ code: tableCode })
    if (res.code != 200) {
      ElMessage.error(res.msg)
      tableInfo.value = undefined
    } else {
      tableInfo.value = res.data
    }
  } else {
    tableInfo.value = undefined
  }
}

const renderSide = async (dictCode: string) => {
  if (dictCode) {
    const res = await getDictDataApi({ dictCode })
    if (res.code != 200) {
      ElMessage.error(res.msg)
      sideInfo.value = undefined
    } else {
      sideInfo.value = {
        alias: res.data.dictCode,
        data: listToTree(res.data.data, {
          id: res.data.dictValue,
          children: 'children',
          pid: res.data.dictPid
        }),
        nodeKey: res.data.dictValue,
        props: {
          children: 'children',
          label: res.data.dictLabel
        }
      }
    }
  } else {
    sideInfo.value = undefined
  }
}

const comfirm = () => {
  emit('select', unref(tableExpose).getSelectRows())
}

onMounted(() => {
  if (props.search) {
    renderSearch(props.search)
  } else {
    props.table && renderTable(props.table)
  }
  props?.side && renderSide(props.side)
})
</script>
<template>
  <div @click="visible = true">
    <slot name="reference">
      <BaseButton>挑选</BaseButton>
    </slot>
  </div>
  <el-drawer
    v-model="visible"
    :destroyOnClose="true"
    :lockScroll="true"
    :closeOnClickModal="false"
    :appendToBody="true"
    :class="[prefixCls, `${prefixCls}--${configGlobal?.size}`]"
  >
    <div class="h-full">
      <el-container class="h-full">
        <el-aside v-if="sideInfo" width="200px" class="mr-10px h-full overflow-hidden">
          <div class="h-full overflow-hidden">
            <ContentWrap class="h-full">
              <ElInput v-model="filterText" clearable style="width: 158px" placeholder="请输入" />
              <ElScrollbar :height="240" class="mt-2">
                <ElTree
                  v-if="sideInfo"
                  ref="treeRef"
                  style="width: 250px"
                  v-bind="sideInfo"
                  default-expand-all
                  :expand-on-click-node="false"
                  :filter-node-method="filterNode"
                  @current-change="currentChange"
                />
              </ElScrollbar>
            </ContentWrap>
          </div>
        </el-aside>
        <el-container class="h-full overflow-hidden">
          <el-header v-if="searchInfo" class="h-auto! mb-10px overflow-hidden">
            <ContentWrap>
              <ElScrollbar>
                <Search v-bind="searchInfo" @search="handleSearch" v-on="searchInfo.on" />
              </ElScrollbar>
            </ContentWrap>
          </el-header>
          <el-main v-if="tableInfo">
            <ContentWrap>
              <Table
                :height="414"
                v-bind="tableInfo"
                @register="tableRegister"
                v-on="tableInfo.on"
              />
            </ContentWrap>
          </el-main>
        </el-container>
      </el-container>
    </div>
    <template #footer>
      <BaseButton type="info" @click="visible = false">取消</BaseButton>
      <BaseButton type="primary" @click="comfirm">确定</BaseButton>
    </template>
  </el-drawer>
</template>

<style lang="less">
@prefix-cls: ~'@{namespace}-select-table';

.@{prefix-cls} {
  width: 88% !important;
}
</style>
