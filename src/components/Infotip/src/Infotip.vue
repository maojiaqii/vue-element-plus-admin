<script setup lang="ts">
import { computed, PropType } from 'vue'
import { Highlight } from '@/components/Highlight'
import { Icon } from '@/components/Icon'
import { useDesign } from '@/hooks/web/useDesign'
import { propTypes } from '@/utils/propTypes'
import { InfoTipSchema } from './types'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('infotip')

const props = defineProps({
  title: propTypes.string.def(''),
  schema: {
    type: Array as PropType<Array<string | InfoTipSchema>>,
    required: true,
    default: () => []
  },
  showIndex: propTypes.bool.def(true),
  highlightColor: propTypes.string.def('var(--el-color-primary)'),
  type: propTypes
    .oneOf<'primary' | 'warning' | 'error'>(['primary', 'warning', 'error'])
    .def('primary')
})

const bgColor = computed(() =>
  props.type === 'primary'
    ? 'bg-[var(--el-color-primary-light-9)]'
    : props.type === 'warning'
      ? 'bg-[var(--el-color-warning-light-9)]'
      : 'bg-[var(--el-color-error-light-9)]'
)

const borderColor = computed(() =>
  props.type === 'primary'
    ? 'border-[var(--el-color-primary)]'
    : props.type === 'warning'
      ? 'border-[var(--el-color-warning)]'
      : 'border-[var(--el-color-error)]'
)

const iconColor = computed(() =>
  props.type === 'primary'
    ? 'var(--el-color-primary)'
    : props.type === 'warning'
      ? 'var(--el-color-warning)'
      : 'var(--el-color-error)'
)

const emit = defineEmits(['click'])

const keyClick = (key: string) => {
  emit('click', key)
}
</script>

<template>
  <div
    :class="[
      prefixCls,
      'p-x-20px p-y-10px border-1px rounded-[16px] border-solid',
      bgColor,
      borderColor
    ]"
  >
    <div v-if="title" :class="[`${prefixCls}__header`, 'flex items-center']">
      <Icon icon="bi:exclamation-circle-fill" :size="22" :color="iconColor" />
      <span :class="[`${prefixCls}__title`, 'pl-5px text-16px font-bold']">{{ title }}</span>
    </div>
    <div :class="`${prefixCls}__content`">
      <p v-for="(item, $index) in schema" :key="$index" class="text-14px mt-15px">
        <Highlight
          :keys="typeof item === 'string' ? [] : item.keys"
          :color="highlightColor"
          @click="keyClick"
        >
          {{ showIndex ? `${$index + 1}、` : '' }}{{ typeof item === 'string' ? item : item.label }}
        </Highlight>
      </p>
    </div>
  </div>
</template>
