<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, onUpdated, PropType, ref, unref, watch } from 'vue'
import { useRenderSelect } from '@/components/Form/src/components/useRenderSelect'
import { useRenderRadio } from '@/components/Form/src/components/useRenderRadio'
import { useRenderCheckbox } from '@/components/Form/src/components/useRenderCheckbox'
import {
  setComponentEvents,
  setComponentProps,
  setFormLifecycle
} from '@/components/Form/src/helper'
import { FormSchema } from '@/components/Form'
import { componentMap } from '../helper/componentMap'
import { ElCol, ElRow, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'
import { isEmpty, isFunction } from '@/utils/is'
import { propTypes } from '@/utils/propTypes'
import { useI18n } from '@/hooks/web/useI18n'

const { renderSelectOptions } = useRenderSelect()
const { renderRadioOptions } = useRenderRadio()
const { renderCheckboxOptions } = useRenderCheckbox()
const { t } = useI18n()

// 接收表单项和其他相关属性
const props = defineProps({
  tableItems: {
    type: Array as PropType<FormSchema[]>,
    default: () => [{}]
  },
  tableItemProps: {
    type: Array as PropType<any[]>,
    default: () => []
  },
  scope: {
    type: Object as PropType<any>,
    default: () => {}
  },
  mode: propTypes.string.validate((v: string) => ['view', 'edit'].includes(v)).def('view'),
  columnType: propTypes.string.def(undefined),
  tableRef: {
    type: Object as PropType<ComponentRef<any>>,
    default: undefined
  }
})

const tableItemPropsRef = ref(setComponentProps(props.tableItems, true, props.mode))
const val = ref<any>(props.scope.row)
const onMountedRef = ref<Function[]>([])
const onUpdatedRef = ref<any[]>([])
const onUnmountedRef = ref<any[]>([])
const tableItems1 = ref<FormSchema[]>(
  props.columnType === 'operation' ? props.tableItems.slice(0, 2) : props.tableItems
)
const tableItems2 = ref<FormSchema[]>(
  props.columnType === 'operation' ? props.tableItems.slice(2) : []
)

watch(
  () => tableItemPropsRef.value,
  (val = {}) => {
    Object.assign(props.tableItemProps[props.scope.$index], val)
  },
  {
    immediate: true,
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

const setThisComponentEvents = (formItem: FormSchema) => {
  const onEvent = setComponentEvents(
    formItem.componentProps,
    props.scope.row,
    props.tableItemProps[props.scope.$index],
    {},
    {},
    {},
    props.tableRef
  )
  const lifecycles = setFormLifecycle(
    formItem.componentProps.lifecycle,
    props.scope.row,
    props.tableItemProps[props.scope.$index]
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
    <template v-for="formItem in tableItems1" :key="formItem.itemProps.prop">
      <ElCol
        v-if="tableItemProps[scope.$index][formItem.itemProps.prop].hidden"
        v-show="tableItemProps[scope.$index][formItem.itemProps.prop].display"
        v-bind="tableItemProps[scope.$index][formItem.itemProps.prop].colProps"
      >
        <component
          :is="componentMap[formItem.componentProps.component]"
          v-model="val[props.scope.column.property]"
          v-bind="tableItemProps[scope.$index][formItem.itemProps.prop].componentProps"
          v-on="setThisComponentEvents(formItem)"
        >
          <!-- 如果是select组件，自动渲染options-->
          <template v-if="isSelectComponent(formItem)">
            <template
              v-for="option in renderSelectOptions(
                tableItemProps[scope.$index][formItem.itemProps.prop]
              )"
              :key="option.key"
            >
              <component :is="option" />
            </template>
          </template>
          <!-- 如果是RADIO组件，自动渲染options-->
          <template v-if="isRadioComponent(formItem)">
            <template
              v-for="option in renderRadioOptions(
                tableItemProps[scope.$index][formItem.itemProps.prop]
              )"
              :key="option.key"
            >
              <component :is="option" />
            </template>
          </template>
          <!-- 如果是CHECKBOX组件，自动渲染options-->
          <template v-if="isCheckboxComponent(formItem)">
            <template
              v-for="option in renderCheckboxOptions(
                tableItemProps[scope.$index][formItem.itemProps.prop]
              )"
              :key="option.key"
            >
              <component :is="option" />
            </template>
          </template>
          <template
            v-for="(value, key) in tableItemProps[scope.$index][formItem.itemProps.prop]
              .componentProps.slots"
            :key="key"
            #[key]="{ data }"
          >
            <component v-if="value.component" :is="componentMap[value.component]" v-bind="value" />
            <div v-else-if="value.html" v-html="value.html"></div>
            <div v-else-if="isFunction(value)">{{ value(data) }}</div>
            <span v-else>{{ value.staticText }}</span>
          </template>
          <template
            v-if="tableItemProps[scope.$index][formItem.itemProps.prop].componentProps.staticText"
          >
            {{ tableItemProps[scope.$index][formItem.itemProps.prop].componentProps.staticText }}
          </template>
        </component>
      </ElCol>
    </template>
    <template v-if="tableItems2.length > 0">
      <ElCol :span="6" class="ml-2 mt-2">
        <ElDropdown trigger="click">
          <span class="el-dropdown-link">
            {{ t('common.more') }}
            <Icon icon="ep:arrow-down" />
          </span>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem v-for="formItem in tableItems2" :key="formItem.itemProps.prop">
                <BaseButton
                  v-bind="tableItemProps[scope.$index][formItem.itemProps.prop].componentProps"
                  v-on="setThisComponentEvents(formItem)"
                >
                  <template
                    v-for="(value, key) in tableItemProps[scope.$index][formItem.itemProps.prop]
                      .componentProps.slots"
                    :key="key"
                    #[key]="{ data }"
                  >
                    <component
                      v-if="value.component"
                      :is="componentMap[value.component]"
                      v-bind="value"
                    />
                    <div v-else-if="value.html" v-html="value.html"></div>
                    <div v-else-if="isFunction(value)">{{ value(data) }}</div>
                    <span v-else>{{ value.staticText }}</span>
                  </template>
                  <template
                    v-if="
                      tableItemProps[scope.$index][formItem.itemProps.prop].componentProps
                        .staticText
                    "
                  >
                    {{
                      tableItemProps[scope.$index][formItem.itemProps.prop].componentProps
                        .staticText
                    }}
                  </template>
                </BaseButton>
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </ElCol>
    </template>
  </ElRow>
</template>
