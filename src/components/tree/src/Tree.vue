<script setup lang="ts">
import { ref, useAttrs, unref, nextTick, watch } from 'vue'
import { ElInput, ElTreeV2 } from 'element-plus'
import { propTypes } from '@/utils/propTypes'
import { useConfigGlobal } from '@/hooks/web/useConfigGlobal'
import { useDesign } from '@/hooks/web/useDesign'
import { TreeNodeData } from 'element-plus/es/components/tree-v2/src/types'

const { getPrefixCls } = useDesign()
const attrs = useAttrs()
const prefixCls = getPrefixCls('tree-v2')
const props = defineProps({
  modelValue: propTypes.arrayOf(propTypes.any).def([]),
  leafOnly: propTypes.bool.def(false),
  includeHalfChecked: propTypes.bool.def(false)
})
const { configGlobal } = useConfigGlobal()
const emit = defineEmits(['update:modelValue'])
const query = ref('')
const treeRef = ref<InstanceType<typeof ElTreeV2>>()

const checkChange = () => {
  if (!treeRef.value) return
  const checkedKeys = treeRef.value.getCheckedKeys(unref(props.leafOnly))
  console.log(checkedKeys)
  const halfcheckedKeys = unref(props.includeHalfChecked) ? treeRef.value.getHalfCheckedKeys() : []
  console.log(halfcheckedKeys)
  emit('update:modelValue', [...checkedKeys, ...halfcheckedKeys])
}

const onQueryChanged = (query: string) => {
  if (treeRef.value) {
    treeRef.value.filter(query)
  }
}

const filterMethod = (query: string, node: TreeNodeData) => {
  return attrs.props?.label
    ? node[attrs.props?.label]?.toString().includes(query)
    : node.label?.toString().includes(query)
}

// 监听数据加载完成
watch(
  () => attrs.data,
  (newData) => {
    if (newData?.length) {
      nextTick(() => {
        // 确保树实例存在
        if (treeRef.value) {
          // 同步勾选状态
          treeRef.value.setCheckedKeys(props.modelValue)
          nextTick(() => {
            // 触发检查
            checkChange()
          })
        }
      })
    }
  },
  { immediate: true }
)
</script>

<template>
  <div :class="[prefixCls, `${prefixCls}--${configGlobal?.size}`, 'h-full']">
    <el-input
      :class="`${prefixCls}__input`"
      clearable
      v-model="query"
      placeholder="请输入过滤内容"
      @input="onQueryChanged"
    />
    <el-tree-v2
      ref="treeRef"
      :class="`${prefixCls}__tree`"
      v-bind="$attrs"
      show-checkbox
      :filter-method="filterMethod"
      @check-change="checkChange"
    />
  </div>
</template>

<style lang="less" scoped>
@prefix-cls: ~'@{namespace}-treeV2';

.@{prefix-cls} {
  &__input {
    width: 100% !important;
  }

  &__tree {
    width: 100% !important;
    height: 100% !important;
  }
}
</style>
