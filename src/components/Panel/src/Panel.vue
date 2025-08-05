<script setup lang="ts">
import { CountTo } from '@/components/CountTo'
import { Icon } from '@/components/Icon'
import type { IconTypes } from '@/components/Icon'
import { useDesign } from '@/hooks/web/useDesign'
import { propTypes } from '@/utils/propTypes'
import { PropType } from 'vue'

const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('panel')

defineProps({
  icon: {
    type: Object as PropType<IconTypes>
  },
  title: propTypes.string.def(''),
  value: propTypes.number.def(0)
})
</script>
<template>
  <div :class="`${prefixCls}__item flex justify-between`">
    <div>
      <slot name="icon">
        <div :class="`${prefixCls}__item--icon p-16px inline-block rounded-6px`">
          <Icon :size="40" v-bind="icon" />
        </div>
      </slot>
    </div>
    <div class="flex flex-col justify-between">
      <slot name="title">
        <div :class="`${prefixCls}__item--text text-16px text-gray-500 text-right`">{{
          title
        }}</div>
      </slot>
      <slot>
        <CountTo class="text-20px font-700 text-right" :end-val="value" />
      </slot>
    </div>
  </div>
</template>
