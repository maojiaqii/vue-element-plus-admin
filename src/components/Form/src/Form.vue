<script setup lang="ts">
import { ElCollapseTransition, ElTooltip, ElForm, ElFormItem, ElRow, ElCol } from 'element-plus'
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
  setDividerCollapses,
  initModel
} from '@/components/Form/src/helper'
import { componentMap } from './helper/componentMap'
import { useRenderSelect } from './components/useRenderSelect'
import { useRenderRadio } from './components/useRenderRadio'
import { useRenderCheckbox } from './components/useRenderCheckbox'
import { FormProps } from '@/components/Form'
import { useI18n } from '@/hooks/web/useI18n'
import { useRouter } from 'vue-router'
import ActionButton from '@/components/Search/src/components/ActionButton.vue'
import { propTypes } from '@/utils/propTypes'
const { formRegister, formMethods } = useForm()
const { getPrefixCls } = useDesign()
const { t } = useI18n()
const { renderSelectOptions } = useRenderSelect()
const { renderRadioOptions } = useRenderRadio()
const { renderCheckboxOptions } = useRenderCheckbox()

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
  },
  // 是否描述列表表单
  isDescription: propTypes.bool.def(false),
  // 列表标题显示位置
  direction: propTypes.oneOf(['horizontal', 'vertical']).def('horizontal'),
  // 是否是查询条件表单
  isSearch: propTypes.bool.def(false),
  // 伸缩的界限字段
  expandIndex: propTypes.number.def(-1)
})

const emit = defineEmits(['register', 'search', 'reset', 'expand'])

const formModel = ref<Recordable>(props.model)
const formItemProps = reactive(
  setComponentProps(props.schema?.formItems, props.schema?.autoSetPlaceholder)
)
const dividerCollapses = ref(setDividerCollapses(props.schema?.formItems))
const formRules = ref(setFormRules(props.schema?.formValidators))
const lifecycle = ref(
  setFormLifecycle(props.schema?.lifecycle, formMethods, formModel, formItemProps)
)
// 存储表单实例
const formComponents = ref({})
// 存储form-item实例
const formItemComponents = ref({})
const expanded = ref(true)

const getGroupIndex = (index: string) => {
  let groupIndex = ''
  for (let key in formItemProps) {
    if (formItemProps[key].componentProps.component === 'Divider') {
      groupIndex = key
    }
    if (key === index) {
      break
    }
  }
  return groupIndex === '' ? index : groupIndex
}

const toggleGroupVisibility = (groupIndex: string) => {
  dividerCollapses.value[groupIndex] = !dividerCollapses.value[groupIndex]
}

const onExpand = () => {
  expanded.value = !unref(expanded)
  if (props.expandIndex > 0 && !unref(expanded)) {
    Object.keys(formItemProps).map((v, i) => {
      formItemProps[v].display = i < props.expandIndex
    })
  } else {
    for (let key in formItemProps) {
      if (formItemProps.hasOwnProperty(key)) {
        formItemProps[key].display = true
      }
    }
  }
  emit('expand', expanded)
}

const reset = () => {
  unref(elFormRef)?.resetFields()
  formModel.value = initModel(formItemProps, unref(props.model))
  emit('reset')
}

const search = async () => {
  await unref(elFormRef)?.validate(async (isValid) => {
    if (isValid) {
      emit('search')
    }
  })
}

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
  emit('register', formMethods)
  // onExpand()
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
    <div
      :class="[
        prefixCls,
        'px-20px p-b-20px bg-[var(--el-color-white)] dark:bg-[var(--el-bg-color)] dark:border-[var(--el-border-color)] dark:border-1px'
      ]"
    >
      <ElRow>
        <template v-for="formItem in schema?.formItems" :key="formItem.itemProps.prop">
          <div
            v-if="formItem.componentProps.component === 'Divider'"
            :class="`${prefixCls}-header`"
            class="w-full m-b-20px relative h-50px flex justify-between items-center layout-border__bottom px-10px cursor-pointer"
            @click="toggleGroupVisibility(getGroupIndex(formItem.itemProps.prop))"
          >
            <div :class="[`${prefixCls}-header__title`, 'relative font-18px font-bold ml-10px']">
              <div class="flex items-center">
                {{ formItem.componentProps.title }}
                <ElTooltip
                  v-if="formItem.componentProps.message"
                  :content="formItem.componentProps.message"
                  placement="right"
                >
                  <Icon icon="bi:question-circle-fill" class="ml-5px" :size="14" />
                </ElTooltip>
              </div>
            </div>
            <Icon
              :icon="
                dividerCollapses[getGroupIndex(formItem.itemProps.prop)]
                  ? 'ep:arrow-down'
                  : 'ep:arrow-up'
              "
            />
          </div>
          <ElCollapseTransition>
            <ElCol
              v-if="
                formItem.componentProps.component !== 'Divider' &&
                formItemProps[formItem.itemProps.prop].hidden
              "
              v-show="
                (Object.keys(dividerCollapses).length !== 0 &&
                  dividerCollapses[getGroupIndex(formItem.itemProps.prop)] &&
                  formItemProps[formItem.itemProps.prop].display) ||
                (Object.keys(dividerCollapses).length === 0 &&
                  formItemProps[formItem.itemProps.prop].display)
              "
              v-bind="formItemProps[formItem.itemProps.prop].colProps"
            >
              <div
                v-if="isDescription"
                class="bg-[var(--el-fill-color-light)] outline-1px outline-[var(--el-border-color-lighter)] outline-solid flex-1"
                :class="direction === 'horizontal' ? 'flex items-stretch' : ''"
              >
                <div
                  class="text-left px-8px py-11px font-700 color-[var(--el-text-color-regular)]"
                  :class="
                    direction === 'horizontal'
                      ? 'w-120px border-r-1px border-r-[var(--el-border-color-lighter)] border-r-solid'
                      : 'border-b-1px border-b-[var(--el-border-color-lighter)] border-b-solid'
                  "
                >
                  {{ t(formItem.itemProps.label as string) }}
                </div>
                <div
                  class="flex-1 px-8px p-t-11px bg-[var(--el-bg-color)] color-[var(--el-text-color-primary)] text-size-14px"
                  :class="direction === 'horizontal' ? '' : 'p-b-1px'"
                >
                  <ElFormItem
                    v-if="formItem.componentProps.component"
                    :ref="(el: any) => setFormItemRefMap(el, formItem.itemProps.prop)"
                    v-bind="formItem.itemProps"
                    label=""
                  >
                    <component
                      :is="componentMap[formItem.componentProps.component]"
                      :ref="(el: any) => setComponentRefMap(el, formItem.itemProps.prop)"
                      v-model="formModel[formItem.itemProps.prop]"
                      v-bind="formItemProps[formItem.itemProps.prop].componentProps"
                      v-on="
                        setComponentEvents(
                          formMethods,
                          formItem.componentProps,
                          formModel,
                          formItemProps
                        )
                      "
                    >
                      <!-- 如果是select组件，自动渲染options-->
                      <template
                        v-if="
                          'SELECT' === formItem.componentProps.component.toUpperCase() &&
                          formItem.componentProps.options
                        "
                      >
                        <template v-for="option in renderSelectOptions(formItem)" :key="option.key">
                          <component :is="option" />
                        </template>
                      </template>
                      <!-- 如果是RADIO组件，自动渲染options-->
                      <template
                        v-if="
                          formItem.componentProps.component.toUpperCase().startsWith('RADIO') &&
                          formItem.componentProps.options
                        "
                      >
                        <template v-for="option in renderRadioOptions(formItem)" :key="option.key">
                          <component :is="option" />
                        </template>
                      </template>
                      <!-- 如果是CHECKBOX组件，自动渲染options-->
                      <template
                        v-if="
                          formItem.componentProps.component.toUpperCase().startsWith('CHECKBOX') &&
                          formItem.componentProps.options
                        "
                      >
                        <template
                          v-for="option in renderCheckboxOptions(formItem)"
                          :key="option.key"
                        >
                          <component :is="option" />
                        </template>
                      </template>
                      <template
                        v-for="(value, key) in formItem.componentProps.slots"
                        :key="key"
                        #[key]
                      >
                        <component
                          v-if="value.component"
                          :is="componentMap[value.component]"
                          v-bind="value"
                        />
                        <div v-else-if="value.html" v-html="value.html"></div>
                      </template>
                    </component>
                  </ElFormItem>
                </div>
              </div>
              <ElFormItem
                class="px-10px"
                v-else-if="formItem.componentProps.component"
                :ref="(el: any) => setFormItemRefMap(el, formItem.itemProps.prop)"
                v-bind="formItem.itemProps"
                :label="t(formItem.itemProps.label as string)"
              >
                <component
                  :is="componentMap[formItem.componentProps.component]"
                  :ref="(el: any) => setComponentRefMap(el, formItem.itemProps.prop)"
                  v-model="formModel[formItem.itemProps.prop]"
                  v-bind="formItemProps[formItem.itemProps.prop].componentProps"
                  v-on="
                    setComponentEvents(
                      formMethods,
                      formItem.componentProps,
                      formModel,
                      formItemProps
                    )
                  "
                >
                  <!-- 如果是select组件，自动渲染options-->
                  <template
                    v-if="
                      'SELECT' === formItem.componentProps.component.toUpperCase() &&
                      formItem.componentProps.options
                    "
                  >
                    <template v-for="option in renderSelectOptions(formItem)" :key="option.key">
                      <component :is="option" />
                    </template>
                  </template>
                  <!-- 如果是RADIO组件，自动渲染options-->
                  <template
                    v-if="
                      formItem.componentProps.component.toUpperCase().startsWith('RADIO') &&
                      formItem.componentProps.options
                    "
                  >
                    <template v-for="option in renderRadioOptions(formItem)" :key="option.key">
                      <component :is="option" />
                    </template>
                  </template>
                  <!-- 如果是CHECKBOX组件，自动渲染options-->
                  <template
                    v-if="
                      formItem.componentProps.component.toUpperCase().startsWith('CHECKBOX') &&
                      formItem.componentProps.options
                    "
                  >
                    <template v-for="option in renderCheckboxOptions(formItem)" :key="option.key">
                      <component :is="option" />
                    </template>
                  </template>
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
          </ElCollapseTransition>
        </template>
        <ElCol
          class="px-10px"
          :class="isDescription ? 'py-10px' : ''"
          v-if="isSearch"
          :xl="6"
          :lg="6"
          :md="12"
          :sm="12"
          :xs="24"
        >
          <ActionButton
            :show-expand="expandIndex > 0"
            :expanded="expanded"
            @expand="onExpand"
            @reset="reset"
            @search="search"
          />
        </ElCol>
      </ElRow>
    </div>
  </ElForm>
</template>

<style lang="less" scoped>
@prefix-cls: ~'@{namespace}-descriptions';

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

.@{prefix-cls}-header {
  &__title {
    &::after {
      position: absolute;
      top: 3px;
      left: -10px;
      width: 4px;
      height: 70%;
      background: var(--el-color-primary);
      content: '';
    }
  }
}
</style>
