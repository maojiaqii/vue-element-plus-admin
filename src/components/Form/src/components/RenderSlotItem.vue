<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, onUpdated, PropType, ref, unref } from 'vue'
import { useRenderSelect } from '@/components/Form/src/components/useRenderSelect'
import { useRenderRadio } from '@/components/Form/src/components/useRenderRadio'
import { useRenderCheckbox } from '@/components/Form/src/components/useRenderCheckbox'
import {
  initModel,
  setComponentEvents,
  setComponentProps,
  setFormLifecycle
} from '@/components/Form/src/helper'
import { FormSchema } from '@/components/Form'
import { componentMap } from '@/components/Form/src/helper/componentMap'
import { ElCheckbox, ElCol, ElRow, FormProps } from 'element-plus'
import { isArray, isEmpty, isFunction } from '@/utils/is'
import { useI18n } from '@/hooks/web/useI18n'

const { renderSelectOptions } = useRenderSelect()
const { renderRadioOptions } = useRenderRadio()
const { renderCheckboxOptions } = useRenderCheckbox()

// 接收表单项和其他相关属性
const props = defineProps({
  slotItems: {
    type: Array as PropType<FormSchema[]>,
    default: () => [{}]
  },
  parentFormModel: {
    type: Object,
    default: () => {}
  },
  parentFormItemProps: {
    type: Object,
    default: () => {}
  }
})

const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()

const slotItemPropsRef = ref(setComponentProps(props.slotItems))
const formModelRef = ref(initModel(unref(slotItemPropsRef) as FormProps, {}))
const parentFormModelRef = ref(props.parentFormModel)
const parentFormItemPropsRef = ref(props.parentFormItemProps)
const onMountedRef = ref<Function[]>([])
const onUpdatedRef = ref<any[]>([])
const onUnmountedRef = ref<any[]>([])

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

const setThisComponentEvents = (formItem: FormSchema) => {
  const onEvent = setComponentEvents(
    formItem.componentProps,
    unref(formModelRef),
    unref(slotItemPropsRef),
    {},
    unref(parentFormModelRef),
    unref(parentFormItemPropsRef)
  )
  const lifecycles = setFormLifecycle(
    formItem.componentProps.lifecycle,
    unref(formModelRef),
    unref(slotItemPropsRef),
    {},
    unref(parentFormModelRef),
    unref(parentFormItemPropsRef)
  )
  if (lifecycles.mounted !== void 0 && isFunction(lifecycles.mounted)) {
    onMountedRef.value.push(lifecycles.mounted)
  }
  if (lifecycles.updated !== void 0 && isFunction(lifecycles.updated)) {
    onUpdatedRef.value.push(lifecycles.updated)
  }
  if (lifecycles.unmounted !== void 0 && isFunction(lifecycles.unmounted)) {
    onUnmountedRef.value.push(lifecycles.unmounted)
  }
  return onEvent
}

onMounted(() => {
  nextTick(() => {
    if (!isEmpty(unref(onMountedRef))) {
      unref(onMountedRef).map((v) => {
        v()
      })
    }
  })
})

onUpdated(() => {
  nextTick(() => {
    if (!isEmpty(unref(onUpdatedRef))) {
      unref(onUpdatedRef).map((v) => {
        v()
      })
    }
  })
})

onUnmounted(() => {
  nextTick(() => {
    if (!isEmpty(unref(onUnmountedRef))) {
      unref(onUnmountedRef).map((v) => {
        v()
      })
    }
  })
})
</script>
<template>
  <ElRow>
    <template v-for="formItem in slotItems" :key="formItem.itemProps.prop">
      <ElCol
        v-if="slotItemPropsRef[formItem.itemProps.prop].hidden"
        v-show="slotItemPropsRef[formItem.itemProps.prop].display"
        v-bind="slotItemPropsRef[formItem.itemProps.prop].colProps"
      >
        <component
          v-if="formItem.componentProps.component.toUpperCase() == 'CHECKBOX'"
          :is="ElCheckbox"
          v-model="formModelRef[formItem.itemProps.prop]"
          v-bind="slotItemPropsRef[formItem.itemProps.prop].componentProps"
          :label="t(slotItemPropsRef[formItem.itemProps.prop].componentProps.label)"
          v-on="setThisComponentEvents(formItem)"
        />
        <component
          v-else
          :is="componentMap[formItem.componentProps.component]"
          v-model="formModelRef[formItem.itemProps.prop]"
          v-bind="slotItemPropsRef[formItem.itemProps.prop].componentProps"
          v-on="setThisComponentEvents(formItem)"
        >
          <!-- 如果是select组件，自动渲染options-->
          <template v-if="isSelectComponent(formItem)">
            <template
              v-for="option in renderSelectOptions(slotItemPropsRef[formItem.itemProps.prop])"
              :key="option.key"
            >
              <component :is="option" />
            </template>
          </template>
          <!-- 如果是RADIO组件，自动渲染options-->
          <template v-if="isRadioComponent(formItem)">
            <template
              v-for="option in renderRadioOptions(slotItemPropsRef[formItem.itemProps.prop])"
              :key="option.key"
            >
              <component :is="option" />
            </template>
          </template>
          <!-- 如果是CHECKBOX组件，自动渲染options-->
          <template v-if="isCheckboxComponent(formItem)">
            <template
              v-for="option in renderCheckboxOptions(slotItemPropsRef[formItem.itemProps.prop])"
              :key="option.key"
            >
              <component :is="option" />
            </template>
          </template>
          <template
            v-for="(value, key) in slotItemPropsRef[formItem.itemProps.prop].componentProps.slots"
            :key="key"
            #[key]="{ data }"
          >
            <RenderSlotItem
              v-if="isArray(value)"
              :slotItems="value"
              :parent-form-model="formModelRef"
              :parent-form-item-props="slotItemPropsRef"
            />
            <div v-else-if="value.html" v-html="value.html"></div>
            <div v-else-if="isFunction(value)">{{ value(data) }}</div>
            <span v-else>{{ value.staticText }}</span>
          </template>
          <template v-if="slotItemPropsRef[formItem.itemProps.prop].componentProps.staticText">
            {{ slotItemPropsRef[formItem.itemProps.prop].componentProps.staticText }}
          </template>
        </component>
      </ElCol>
    </template>
  </ElRow>
</template>
