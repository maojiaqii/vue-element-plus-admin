<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { ElScrollbar } from 'element-plus'
import { Search, SearchProps } from '@/components/Search'
import { Table, TableProps } from '@/components/Table'
import { PropType, ref, unref } from 'vue'
import { useDesign } from '@/hooks/web/useDesign'
import { propTypes } from '@/utils/propTypes'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('container')

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
  side: propTypes.any.def(undefined)
})
const emits = defineEmits(['register'])

const tableExpose = ref()
const maxHeights = ref(525)

const handleSearch = (data: Recordable) => {
  unref(tableExpose).setQueryParams(data)
  unref(tableExpose).refresh()
}

const tableRegister = (objs: any) => {
  tableExpose.value = objs
  emits('register', unref(tableExpose))
}

const expand = (expand: boolean) => {
  maxHeights.value = expand ? 425 : 475
}
</script>

<template>
  <div class="h-full">
    <ContentWrap v-if="unref(props.search)">
      <ElScrollbar max-height="12vh">
        <Search
          v-bind="unref(props.search)"
          @search="handleSearch"
          @expand="expand"
          v-on="unref(props.search)?.on"
        />
      </ElScrollbar>
    </ContentWrap>

    <ContentWrap v-if="unref(props.table)" :class="`${prefixCls}  mt-10px`">
      <ElScrollbar>
        <Table
          :maxHeight="maxHeights"
          v-bind="unref(props.table)"
          @register="tableRegister"
          v-on="unref(props.table)?.on"
        />
      </ElScrollbar>
    </ContentWrap>
  </div>
</template>
