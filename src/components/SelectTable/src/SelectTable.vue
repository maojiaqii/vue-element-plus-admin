<script setup lang="ts">
import { ref, onMounted, unref } from 'vue'
import { ElMessage, ElDrawer } from 'element-plus'
import { BaseButton } from '@/components/Button'
import { propTypes } from '@/utils/propTypes'
import { useConfigGlobal } from '@/hooks/web/useConfigGlobal'
import { useDesign } from '@/hooks/web/useDesign'
import { getDictDataApi, getFormInfoApi, getTableInfoApi } from '@/api/common'
import { listToTree } from '@/utils/tree'
import { ContainerA } from '@/components/Container'

const { getPrefixCls } = useDesign()
const { configGlobal } = useConfigGlobal()
const prefixCls = getPrefixCls('select-table')

const props = defineProps({
  modelValue: {
    type: [Array<Recordable>, Object]
  },
  side: propTypes.string.def(undefined),
  search: propTypes.string.def(undefined),
  table: propTypes.string.def(undefined),
  multiple: propTypes.bool.def(true)
})
const emit = defineEmits(['select'])

const searchInfo = ref()
const tableInfo = ref()
const sideInfo = ref()
const tableExpose = ref()
const visible = ref(false)

const tableRegister = (objs: any) => {
  tableExpose.value = objs
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
  if (unref(tableExpose).getSelectRows().length === 0) {
    ElMessage.warning('未选择数据！')
    return
  }
  if (!props.multiple && unref(tableExpose).getSelectRows().length > 1) {
    ElMessage.error('请选择一条数据！')
    return
  } else {
    if (props.multiple) {
      emit('select', unref(tableExpose).getSelectRows())
    } else {
      emit('select', unref(tableExpose).getSelectRows()[0])
    }
  }
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
      <ContainerA
        :search="searchInfo"
        :table="tableInfo"
        :side="sideInfo"
        @register="tableRegister"
        class="h-full"
      />
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
