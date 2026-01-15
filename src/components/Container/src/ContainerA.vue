<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { ElAside, ElContainer, ElHeader, ElInput, ElMain, ElScrollbar, ElTree } from 'element-plus'
import { Search, SearchProps } from '@/components/Search'
import { Table, TableProps } from '@/components/Table'
import { computed, PropType, ref, unref, watch } from 'vue'
import { useDesign } from '@/hooks/web/useDesign'
import { SideTreeProps } from '@/components/Container/types'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('container')

interface Tree {
  [key: string]: any
}

const props = defineProps({
  // 生成Search的布局结构数组
  search: {
    type: Object as PropType<SearchProps>,
    default: undefined
  },
  table: {
    type: Object as PropType<TableProps>,
    default: undefined
  },
  side: {
    type: Object as PropType<SideTreeProps>,
    default: undefined
  }
})
const emits = defineEmits(['register'])

const yip = ref()
const tableExpose = ref()
const filterText = ref('')
const treeRef = ref<InstanceType<typeof ElTree>>()
const treeReload = ref(false)

const handleSearch = (data: Recordable) => {
  unref(tableExpose).setQueryParams(data)
  unref(tableExpose).refresh()
}

const currentChange = (data: Recordable) => {
  unref(tableExpose).setQueryParams({
    [props.side!.alias]: data[unref(props.side!.nodeKey || 'id')]
  })
  unref(tableExpose).refresh()
}

const tableRegister = (objs: any) => {
  tableExpose.value = objs
  emits('register', unref(tableExpose))
}

// 移除原有的 sideHeight 和 tableHeight ref
const sideHeight = computed(() => {
  if (!yip.value) return '100%'
  const isInDialog =
    yip.value.closest('.useDialog-scrollbar') || yip.value.closest('.useDrawer-scrollbar')
  return isInDialog ? isInDialog.clientHeight - 1000 : yip.value.clientHeight
})

watch(filterText, (val) => {
  treeRef.value!.filter(val)
})

watch(
  () => props.side,
  (val: SideTreeProps) => {
    treeReload.value = !!val
  },
  { deep: true, immediate: true }
)

const filterNode = (value: string, data: Tree) => {
  if (!value) return true
  return data[unref(props.side!.props.label || 'label')].includes(value)
}
</script>

<template>
  <div ref="yip" :class="`${prefixCls} h-full overflow-hidden`">
    <el-container class="h-full">
      <el-aside v-if="unref(props.side)" width="200px" class="mr-10px">
        <div class="h-full overflow-hidden">
          <ContentWrap class="h-full">
            <ElInput v-model="filterText" clearable style="width: 158px" placeholder="请输入" />
            <ElScrollbar :height="sideHeight" class="mt-2">
              <ElTree
                v-if="treeReload"
                ref="treeRef"
                style="width: 250px"
                v-bind="unref(props.side)"
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
        <el-header v-if="unref(props.search)" class="h-auto! mb-10px overflow-hidden">
          <ContentWrap>
            <Search
              v-bind="unref(props.search)"
              @search="handleSearch"
              v-on="unref(props.search)?.on"
            />
          </ContentWrap>
        </el-header>
        <el-main v-if="unref(props.table)">
          <ContentWrap>
            <Table
              v-bind="unref(props.table)"
              @register="tableRegister"
              v-on="unref(props.table)?.on"
            />
          </ContentWrap>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="less" scoped>
:deep(.el-header) {
  --el-header-padding: 0 !important;
  --el-header-height: auto !important;
}

:deep(.el-main) {
  --el-main-padding: 0 !important;
}
</style>
