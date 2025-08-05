<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, onUpdated, PropType, ref, unref, watch } from 'vue'
import { useRenderSelect } from './useRenderSelect'
import { useRenderRadio } from './useRenderRadio'
import { useRenderCheckbox } from './useRenderCheckbox'
import { useI18n } from '@/hooks/web/useI18n'
import { setComponentEvents, setFormLifecycle } from '@/components/Form/src/helper'
import { ElCheckbox } from 'element-plus'
import { FormSchema } from '@/components/Form'
import { Table } from '@/components/Table'
import { componentMap } from '../helper/componentMap'
import { isArray, isFunction } from '@/utils/is'
import RenderSlotItem from '@/components/Form/src/components/RenderSlotItem.vue'

const { renderSelectOptions } = useRenderSelect()
const { renderRadioOptions } = useRenderRadio()
const { renderCheckboxOptions } = useRenderCheckbox()
const { t } = useI18n()

// 接收表单项和其他相关属性
const props = defineProps({
  formItem: {
    type: Object as PropType<FormSchema>,
    default: () => {}
  },
  modelValue: {
    type: Object,
    default: () => {}
  },
  formItemProps: {
    type: Object,
    default: () => {}
  },
  formMethods: Object,
  formComponents: {
    type: Object,
    default: () => {}
  }
})

const emit = defineEmits([
  'update:formComponents',
  'update:formItemComponents',
  'update:modelValue'
])

const formModelRef = ref(unref(props.modelValue))
const formComponentsRef = ref(unref(props.formComponents))
const formComponentEventsRef = ref<Recordable<string, Function>>(
  setComponentEvents(
    unref(props.formItem)?.componentProps,
    unref(formModelRef),
    unref(props.formItemProps),
    unref(props.formMethods)
  )
)
const lifecycle = ref(
  setFormLifecycle(
    unref(props.formItem)?.componentProps.lifecycle,
    unref(formModelRef),
    unref(props.formItemProps),
    unref(props.formMethods)
  )
)

watch(
  () => unref(formModelRef),
  (val = {}) => {
    emit('update:modelValue', val)
  },
  {
    deep: true
  }
)

watch(
  () => unref(formComponentsRef),
  (val = {}) => {
    emit('update:formComponents', val)
  },
  {
    deep: true
  }
)

// 判断是否是Select组件
const isSelectComponent = (formItem: FormSchema) => {
  return formItem.componentProps.component.toUpperCase() === 'SELECT'
}

// 判断是否是Radio组件
const isRadioComponent = (formItem: FormSchema) => {
  return formItem.componentProps.component.toUpperCase().startsWith('RADIO')
}

// 判断是否是Checkbox组件
const isCheckboxComponent = (formItem: FormSchema) => {
  return formItem.componentProps.component.toUpperCase().startsWith('CHECKBOX')
}

// 判断是否是Transfer组件
const isTransferComponent = (formItem: FormSchema) => {
  return formItem.componentProps.component.toUpperCase().startsWith('TRANSFER')
}

const setComponentRefMap = (ref: any, filed: string) => {
  formComponentsRef.value[filed] = ref
}

onMounted(() => {
  nextTick(() => {
    if (unref(lifecycle)?.mounted !== void 0 && isFunction(unref(lifecycle)?.mounted)) {
      unref(lifecycle).mounted()
    }
  })
})

onUpdated(() => {
  nextTick(() => {
    if (unref(lifecycle)?.updated !== void 0 && isFunction(unref(lifecycle)?.updated)) {
      unref(lifecycle).updated()
    }
  })
})

onUnmounted(() => {
  nextTick(() => {
    if (unref(lifecycle)?.unmounted !== void 0 && isFunction(unref(lifecycle)?.unmounted)) {
      unref(lifecycle).unmounted()
    }
  })
})
</script>
<template>
  <component
    v-if="formItem.componentProps.component.toUpperCase() == 'CHECKBOX'"
    :is="ElCheckbox"
    v-model="formModelRef[formItem.itemProps.prop]"
    v-bind="formItemProps[formItem.itemProps.prop].componentProps"
    :label="t(formItemProps?.[formItem.itemProps.prop].componentProps.label)"
    v-on="formComponentEventsRef"
  />
  <component
    v-else-if="
      formItem.componentProps.component.toUpperCase() == 'TABLE' &&
      formItem.componentProps.tableCode &&
      renderTableProps(formItem.componentProps.tableCode)
    "
    :is="Table"
    v-model="formModelRef[formItem.itemProps.prop]"
    v-bind="formItemProps[formItem.itemProps.prop].componentProps"
    :label="t(formItemProps?.[formItem.itemProps.prop].componentProps.label)"
    v-on="formComponentEventsRef"
  />
  <component
    v-else
    :is="componentMap[formItem?.componentProps.component]"
    :ref="(el: any) => setComponentRefMap(el, formItem?.itemProps.prop)"
    v-model="formModelRef[formItem?.itemProps.prop]"
    v-bind="formItemProps[formItem.itemProps.prop].componentProps"
    v-on="formComponentEventsRef"
  >
    <!-- 如果是select组件，自动渲染options-->
    <template v-if="isSelectComponent(formItem)">
      <template
        v-for="option in renderSelectOptions(formItemProps[formItem.itemProps.prop])"
        :key="option.key"
      >
        <component :is="option" />
      </template>
    </template>
    <!-- 如果是RADIO组件，自动渲染options-->
    <template v-if="isRadioComponent(formItem)">
      <template
        v-for="option in renderRadioOptions(formItemProps[formItem.itemProps.prop])"
        :key="option.key"
      >
        <component :is="option" />
      </template>
    </template>
    <!-- 如果是CHECKBOX组件，自动渲染options-->
    <template v-if="isCheckboxComponent(formItem)">
      <template
        v-for="option in renderCheckboxOptions(formItemProps[formItem.itemProps.prop])"
        :key="option.key"
      >
        <component :is="option" />
      </template>
    </template>
    <!-- 如果是Transfer组件，自动渲染options-->
    <!--suppress VueUnrecognizedSlot -->
    <template v-if="isTransferComponent(formItem)" #default="{ option }">
      <span> {{ option.label }} </span>
    </template>
    <template
      v-for="(value, key) in formItemProps[formItem.itemProps.prop].componentProps.slots"
      :key="key"
      #[key]="{ data }"
    >
      <RenderSlotItem
        v-if="isArray(value)"
        :slotItems="value"
        :parent-form-model="formModelRef"
        :parent-form-item-props="formItemProps"
      />
      <div v-else-if="value.html" v-html="value.html"></div>
      <div v-else-if="isFunction(value)">{{ value(data) }}</div>
      <span v-else>{{ value.staticText }}</span>
    </template>
    <template v-if="formItemProps[formItem.itemProps.prop].componentProps.staticText">
      {{ formItemProps[formItem.itemProps.prop].componentProps.staticText }}
    </template>
  </component>
</template>
