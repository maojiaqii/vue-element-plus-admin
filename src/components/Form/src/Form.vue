<script setup lang="ts">
import { ElForm, ElFormItem, ElRow, ElCol } from 'element-plus'
import {
  onMounted,
  ref,
  unref,
  PropType,
  reactive,
  watch,
  onUpdated,
  onUnmounted,
  nextTick
} from 'vue'
import { useForm } from '@/hooks/web/useForm'
import { useDesign } from '@/hooks/web/useDesign'
import {
  setComponentProps,
  setComponentEvents,
  setFormRules,
  setFormLifecycle,
  initModel
} from '@/components/Form/src/helper'
import { componentMap } from './helper/componentMap'
import { FormProps } from '@/components/Form'
import { useRouter } from 'vue-router'

const { formRegister, formMethods } = useForm()
const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('form')

// element form 实例
const elFormRef = ref<ComponentRef<typeof ElForm>>()

const props = defineProps({
  schema: {
    type: Object as PropType<FormProps>,
    default: undefined
  },
  model: {
    type: Object as PropType<any>,
    default: () => ({})
  }
})

const formModel = ref<Recordable>(props.model)
const formItemProps = reactive(
  setComponentProps(props.schema?.formItems, props.schema?.autoSetPlaceholder)
)
const formRules = ref(setFormRules(props.schema?.formValidators))
const lifecycle = ref(
  setFormLifecycle(props.schema?.lifecycle, formMethods, formModel, formItemProps)
)
// 存储表单实例
const formComponents = ref({})
// 存储form-item实例
const formItemComponents = ref({})

/**
 * @description: 获取表单组件实例
 * @param filed 表单字段
 */
const getComponentExpose = (filed: string) => {
  return unref(formComponents)[filed]
}

/**
 * @description: 获取formItem实例
 * @param filed 表单字段
 */
const getFormItemExpose = (filed: string) => {
  return unref(formItemComponents)[filed]
}

const setComponentRefMap = (ref: any, filed: string) => {
  formComponents.value[filed] = ref
}

const setFormItemRefMap = (ref: any, filed: string) => {
  formItemComponents.value[filed] = ref
}

defineExpose({
  getComponentExpose,
  getFormItemExpose,
  formModel
})

// 监听表单结构化数组，重新生成formModel
watch(
  () => formItemProps,
  (schema = {}) => {
    formModel.value = initModel(schema, unref(formModel))
  },
  {
    immediate: true,
    deep: true
  }
)

onMounted(() => {
  formRegister(unref(elFormRef)?.$parent, unref(elFormRef), useRouter())
  nextTick(() => {
    if (unref(lifecycle)?.onMounted !== void 0) {
      unref(lifecycle).onMounted()
    }
  })
})

onUpdated(() => {
  nextTick(() => {
    if (unref(lifecycle)?.onUpdated !== void 0) {
      unref(lifecycle).onUpdated()
    }
  })
})

onUnmounted(() => {
  nextTick(() => {
    if (unref(lifecycle)?.onUnmounted !== void 0) {
      unref(lifecycle).onUnmounted()
    }
  })
})
</script>

<template>
  <ElForm ref="elFormRef" v-bind="schema" :model="formModel" :rules="formRules" :class="prefixCls">
    <ElRow :gutter="20">
      <template v-for="formItem in schema?.formItems" :key="formItem.itemProps.prop">
        <ElCol
          v-if="formItemProps[formItem.itemProps.prop].hidden"
          v-show="formItemProps[formItem.itemProps.prop].display"
          v-bind="formItemProps[formItem.itemProps.prop].colProps"
        >
          <ElFormItem
            v-if="formItem.componentProps.component"
            :ref="(el: any) => setFormItemRefMap(el, formItem.itemProps.prop)"
            v-bind="formItem.itemProps"
          >
            <component
              :is="componentMap[formItem.componentProps.component]"
              :ref="(el: any) => setComponentRefMap(el, formItem.itemProps.prop)"
              v-model="formModel[formItem.itemProps.prop]"
              v-bind="formItemProps[formItem.itemProps.prop].componentProps"
              v-on="
                setComponentEvents(formMethods, formItem.componentProps, formModel, formItemProps)
              "
            >
              <template v-for="(value, key) in formItem.componentProps.slots" :key="key" #[key]>
                <component
                  v-if="value.component"
                  :is="componentMap[value.component]"
                  v-bind="value"
                />
                <div v-else-if="value.html" v-html="value.html"></div>
              </template>
            </component>
          </ElFormItem>
          <div v-else v-html="formItem.componentProps.slots.default.html"></div>
        </ElCol>
      </template>
    </ElRow>
  </ElForm>
</template>

<style lang="less" scoped>
.@{elNamespace}-form.@{namespace}-form .@{elNamespace}-row {
  margin-right: 0 !important;
  margin-left: 0 !important;
}

.@{elNamespace}-form--inline {
  :deep(.el-form-item__content) {
    & > :first-child {
      min-width: 229.5px;
    }
  }
  .@{elNamespace}-input-number {
    // 229.5px是兼容el-input-number的最小宽度,
    min-width: 229.5px;
  }
}
</style>
