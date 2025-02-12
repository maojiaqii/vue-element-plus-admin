<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { ElScrollbar, ElContainer, ElAside, ElHeader, ElMain, ElInput, ElTree } from 'element-plus'
import { Search, SearchProps } from '@/components/Search'
import { Table, TableProps } from '@/components/Table'
import { nextTick, onMounted, onUnmounted, PropType, ref, unref, watch } from 'vue'
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
const sideHeight = ref(50)
const tableExpose = ref()
const tableHeight = ref(50)
const searchHeight = ref(200)
const filterText = ref('')
const treeRef = ref<InstanceType<typeof ElTree>>()
const treeReload = ref(false)

const expand = (expand: boolean) => {
  searchHeight.value = expand ? 250 : 200
}

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

const resizeM = () => {
  sideHeight.value = 50
  tableHeight.value = 50
  nextTick(() => {
    sideHeight.value = yip.value?.clientHeight - 50
    tableHeight.value = yip.value?.clientHeight - unref(searchHeight) - 50
  })
}

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
  console.log(value, data)
  if (!value) return true
  return data[unref(props.side!.props.label || 'label')].includes(value)
}

onMounted(() => {
  resizeM()
  window.addEventListener('resize', () => resizeM())
})

onUnmounted(() => {
  window.removeEventListener('resize', () => resizeM())
})
</script>

<template>
  <div ref="yip" :class="`${prefixCls} h-full`">
    <el-container>
      <el-aside v-if="unref(props.side)" width="200px" class="mr-10px">
        <div>
          <ContentWrap class="h-full">
            <ElInput v-model="filterText" clearable style="width: 158px" placeholder="请输入" />
            <ElScrollbar :height="sideHeight">
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
      <el-container>
        <el-header v-if="unref(props.search)">
          <ContentWrap>
            <ElScrollbar max-height="80px">
              <Search
                v-bind="unref(props.search)"
                @search="handleSearch"
                @expand="expand"
                v-on="unref(props.search)?.on"
              />
            </ElScrollbar>
          </ContentWrap>
        </el-header>
        <el-main v-if="unref(props.table)" class="mt-10px">
          <ContentWrap>
            <Table
              :height="tableHeight"
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
