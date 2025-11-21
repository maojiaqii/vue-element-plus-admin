<script setup lang="ts">
import { debounce } from 'lodash-es'
import { ContentWrap } from '@/components/ContentWrap'
import { ElScrollbar, ElContainer, ElAside, ElHeader, ElMain, ElInput, ElTree } from 'element-plus'
import { Search, SearchProps } from '@/components/Search'
import { Table, TableProps } from '@/components/Table'
import { nextTick, onMounted, onUnmounted, PropType, ref, unref, watch, computed } from 'vue'
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

// 添加一个 MutationObserver 来监听搜索区域的高度变化
const searchObserver = ref<MutationObserver | null>(null)

// 添加一个新的 ref 来跟踪搜索组件是否准备就绪
const searchReady = ref(false)

// 移除原有的 sideHeight 和 tableHeight ref
const sideHeight = computed(() => {
  if (!yip.value) return 50
  const isInDialog =
    yip.value.closest('.useDialog-scrollbar') || yip.value.closest('.useDrawer-scrollbar')
  const containerHeight = isInDialog ? isInDialog.clientHeight + 200 : yip.value.clientHeight + 170
  return containerHeight - 250
})

// 添加一个 ref 来存储搜索区域的高度
const searchAreaHeight = ref(0)

// 计算表格高度
const tableHeight = computed(() => {
  if (!yip.value) return 50
  const isInDialog =
    yip.value.closest('.useDialog-scrollbar') || yip.value.closest('.useDrawer-scrollbar')
  const containerHeight = isInDialog ? isInDialog.clientHeight : yip.value.clientHeight
  // 获取 ContentWrap 的 padding 和 margin
  const mainElement = yip.value.querySelector('.el-main')
  const contentWrapPadding = mainElement
    ? parseInt(getComputedStyle(mainElement).paddingTop) * 2
    : 0
  if (unref(props.search)) {
    // 考虑 header 的 margin-bottom
    const headerMargin = 10
    console.log(
      containerHeight - (searchAreaHeight.value + contentWrapPadding + headerMargin + 170)
    )
    return containerHeight - (searchAreaHeight.value + contentWrapPadding + headerMargin + 170)
  }
  return containerHeight - (contentWrapPadding + 100)
})

// 修改计算高度的函数
const calculateHeights = async () => {
  if (!yip.value) return

  await nextTick()

  if (unref(props.search)) {
    const searchElement = yip.value.querySelector('.el-header')
    if (searchElement) {
      // 获取整个 header 区域的实际高度
      const headerHeight = searchElement.getBoundingClientRect().height
      searchAreaHeight.value = headerHeight
    }
  } else {
    searchAreaHeight.value = 0
  }
}

// 修改 watch 部分
watch(
  () => props.search,
  () => {
    searchReady.value = false
    nextTick(() => {
      // 给一个短暂的延时确保组件完全渲染
      setTimeout(() => {
        searchReady.value = true
        initObserver()
        calculateHeights()
      }, 100)
    })
  },
  { immediate: true }
)

// 修改 onMounted
onMounted(() => {
  window.addEventListener('resize', debouncedResize)
  // 初始化时也需要等待搜索组件就绪
  if (props.search) {
    searchReady.value = false
    setTimeout(() => {
      searchReady.value = true
      initObserver()
      calculateHeights()
    }, 100)
  } else {
    searchReady.value = true
    initObserver()
    calculateHeights()
  }
})

// 添加一个初始化观察器的函数
const initObserver = () => {
  nextTick(() => {
    const searchElement = yip.value?.querySelector('.el-header')
    if (searchElement) {
      searchObserver.value = new MutationObserver(debouncedResize)
      searchObserver.value.observe(searchElement, {
        childList: true,
        subtree: true,
        attributes: true
      })
      calculateHeights()
    }
  })
}

// 修改 onMounted
onMounted(() => {
  window.addEventListener('resize', debouncedResize)
  initObserver()
})

// 添加对 search prop 的监听
watch(
  () => props.search,
  () => {
    nextTick(() => {
      initObserver()
    })
  },
  { immediate: true }
)

// 在 unmounted 时清理观察器
onUnmounted(() => {
  window.removeEventListener('resize', debouncedResize)
  debouncedResize.cancel()
  searchObserver.value?.disconnect()
})

// 使用防抖包装的 resize 处理函数
const debouncedResize = debounce(calculateHeights, 100)

const resizeM = () => {
  nextTick(() => {
    calculateHeights()
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
  if (!value) return true
  return data[unref(props.side!.props.label || 'label')].includes(value)
}

onMounted(() => {
  resizeM()
  window.addEventListener('resize', debouncedResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', debouncedResize)
  // 清除防抖函数
  debouncedResize.cancel()
})
</script>

<template>
  <div ref="yip" :class="`${prefixCls} h-full overflow-hidden`">
    <el-container class="h-full">
      <el-aside v-if="unref(props.side)" width="200px" class="mr-10px h-full overflow-hidden">
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
            <ElScrollbar max-height="100px">
              <Search
                v-bind="unref(props.search)"
                @search="handleSearch"
                v-on="unref(props.search)?.on"
                @mounted="calculateHeights"
              />
            </ElScrollbar>
          </ContentWrap>
        </el-header>
        <el-main v-if="unref(props.table)">
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
