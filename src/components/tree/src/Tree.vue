<script setup lang="ts">
import { ref, useAttrs, unref, onMounted, nextTick, watch } from 'vue'
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
  includeHalfChecked: propTypes.bool.def(false)
})

const { configGlobal } = useConfigGlobal()

const emit = defineEmits(['update:modelValue'])

const query = ref('')
const valueRef = ref(props.modelValue)
const treeRef = ref<InstanceType<typeof ElTreeV2>>()

// 监听 modelValue 变化，更新内部 valueRef
watch(
  () => props.modelValue,
  (newVal) => {
    valueRef.value = newVal
    // 如果树已经初始化，则同步选中状态
    if (treeRef.value) {
      nextTick(() => {
        updateTreeCheckedState()
      })
    }
  },
  { deep: true }
)

// 更新树的选中状态
const updateTreeCheckedState = () => {
  if (!treeRef.value) return

  // 先清空所有选中状态
  const allKeys = treeRef.value.getCheckedKeys(false)
  allKeys.forEach((key) => {
    treeRef.value!.setChecked(key, false)
  })

  // 设置新的选中状态
  valueRef.value.forEach((key) => {
    treeRef.value!.setChecked(key, true)
  })
}

const checkChange = () => {
  if (!treeRef.value) return
  const checkedKeys = treeRef.value.getCheckedKeys(false)
  const halfcheckedKeys = unref(props.includeHalfChecked) ? treeRef.value.getHalfCheckedKeys() : []
  emit('update:modelValue', [...checkedKeys, ...halfcheckedKeys])
}

// 在组件挂载后，等待树组件渲染完成再同步选中状态
onMounted(() => {
  nextTick(() => {
    if (treeRef.value && valueRef.value.length > 0) {
      updateTreeCheckedState()
      checkChange()
    }
  })
})

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
      :default-checked-keys="valueRef"
      show-checkbox
      :filter-method="filterMethod"
      @check="checkChange"
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
