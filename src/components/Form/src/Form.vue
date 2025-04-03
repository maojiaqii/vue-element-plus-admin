<script setup lang="ts">
import {
  ElCollapseTransition,
  ElPopover,
  ElForm,
  ElFormItem,
  ElRow,
  ElCol,
  ElTooltip,
  ElScrollbar
} from 'element-plus'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import { onMounted, ref, unref, PropType, onUpdated, onUnmounted, nextTick } from 'vue'
import { useForm } from '@/hooks/web/useForm'
import { useDesign } from '@/hooks/web/useDesign'
import {
  setComponentProps,
  setFormRules,
  setFormLifecycle,
  setDividerCollapses,
  initModel
} from '@/components/Form/src/helper'
import { FormProps } from '@/components/Form'
import { useI18n } from '@/hooks/web/useI18n'
import { useRouter } from 'vue-router'
import ActionButton from '@/components/Search/src/components/ActionButton.vue'
import RenderFormItem from '@/components/Form/src/components/RenderFormItem.vue'
import { isArray, isFunction } from '@/utils/is'
import RenderSlotItem from '@/components/Form/src/components/RenderSlotItem.vue'
const { formRegister, formMethods } = useForm()
import { Icon } from '@/components/Icon'
const { getPrefixCls } = useDesign()
const { t } = useI18n()

const prefixCls = getPrefixCls('form')

// element form 实例
const elFormRef = ref<ComponentRef<typeof ElForm>>()

const props = defineProps({
  schema: {
    type: Object as PropType<FormProps>,
    default: () => ({
      autoSetPlaceholder: true,
      mode: 'edit', // 表单模式
      isSearch: false, // 是否是查询条件表单
      expandIndex: 3, // 伸缩的界限字段
      isDescription: false, // 是否描述列表表单
      direction: 'horizontal', // 列表标题显示位置
      dividerType: 'lines' // 列表标题显示位置
    })
  },
  model: {
    type: Object as PropType<any>,
    default: () => ({})
  },
  constant: {
    type: Object as PropType<any>,
    default: () => ({})
  }
})

const emit = defineEmits(['register', 'search', 'reset', 'expand'])

const formItemProps = ref(
  setComponentProps(unref(props.schema.formItems), unref(props.schema.autoSetPlaceholder))
)
const formModel = ref<Recordable>(initModel(unref(formItemProps) as FormProps, unref(props.model)))
const formConstant = ref(props.constant || {})
const dividerCollapses = ref(setDividerCollapses(unref(props.schema.formItems)))
const formRules = ref()
const lifecycle = ref(
  setFormLifecycle(
    unref(props.schema.lifecycle),
    unref(formModel),
    unref(formItemProps),
    unref(formMethods),
    {},
    {}
  )
)
// 存储表单实例
const formComponents = ref({})
// 存储form-item实例
const formItemComponents = ref({})
const formMode = ref(props.schema.mode || 'edit')
const expanded = ref(true)
const expandIndex = ref(props.schema.expandIndex || 3)
// 添加hover状态变量
const isHovered = ref('')
// 添加当前激活的tab
const activeTab = ref('')

const getGroupIndex = (index: string) => {
  let groupIndex = ''
  for (let key in formItemProps.value) {
    if (formItemProps.value[key].componentProps.component === 'Divider') {
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
  if (unref(expandIndex) > 0 && !unref(expanded)) {
    Object.keys(formItemProps.value).map((v, i) => {
      formItemProps.value[v].display = i < unref(expandIndex)
    })
  } else {
    for (let key in formItemProps.value) {
      if (formItemProps.value.hasOwnProperty(key)) {
        formItemProps.value[key].display = true
      }
    }
  }
  emit('expand', unref(expanded))
}

const reset = () => {
  unref(elFormRef)?.resetFields()
  formModel.value = initModel(unref(formItemProps) as FormProps, unref(props.model))
  emit('reset', unref(formModel))
}

const search = async () => {
  await unref(elFormRef)?.validate(async (isValid) => {
    if (isValid) {
      emit('search', unref(formModel))
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

const setFormItemRefMap = (ref: any, filed: string) => {
  formItemComponents.value[filed] = ref
}

const setFormConstant = (filed: string, val: any) => {
  formConstant.value[filed] = val
}

// 获取所有divider项
const getDividerItems = () => {
  const dividers: any[] = []
  for (const formItem of props.schema.formItems) {
    if (formItem.componentProps.component === 'Divider') {
      dividers.push({
        key: formItem.itemProps.prop,
        title: formItem.componentProps.title,
        prop: formItem.itemProps.prop,
        message: formItem.componentProps.message
      })
    }
  }
  return dividers
}

// 处理tab切换
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
  // 切换tab时，更新dividerCollapses状态
  for (const key in dividerCollapses.value) {
    dividerCollapses.value[key] = key !== tabName
  }
}

defineExpose({
  getComponentExpose,
  getFormItemExpose,
  setFormConstant,
  formModel,
  formConstant
})

onMounted(() => {
  // 如果是tabs模式，设置默认激活的tab
  if (props.schema.dividerType === 'tabs') {
    const dividers = getDividerItems()
    if (dividers.length > 0) {
      activeTab.value = dividers[0].prop
      // 初始化时只显示第一个tab的内容
      for (const key in dividerCollapses.value) {
        dividerCollapses.value[key] = key !== dividers[0].prop
      }
    }
  }
  setFormRules(unref(props.schema.formValidators), unref(formModel)).then((res) => {
    formRules.value = res
  })
  formRegister(unref(elFormRef)?.$parent, unref(elFormRef), useRouter())
  emit('register', formMethods)
  unref(props.schema.isSearch) && onExpand()
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
  <ElForm ref="elFormRef" v-bind="schema" :model="formModel" :rules="formRules" :class="prefixCls">
    <div
      :class="[
        prefixCls,
        'rounded-[16px] bg-[var(--el-bg-color-overlay)]',
        { 'has-tabs': schema.dividerType === 'tabs' }
      ]"
    >
      <!-- Tabs模式的导航栏 -->
      <div v-if="schema.dividerType === 'tabs'" class="tabs-container">
        <ElScrollbar class="tabs-scrollbar">
          <div class="tabs-nav">
            <div
              v-for="item in getDividerItems()"
              :key="item.prop"
              :class="[
                'tab-item',
                'rounded-t-[16px] relative h-50px shadow-[0_8px_16px_-2px_rgba(64,158,255,0.15)] hover:shadow-[0_8px_32px_-4px_rgba(64,158,255,0.25)] flex justify-between items-center px-10px cursor-pointer',
                activeTab === item.prop ? 'active' : ''
              ]"
              :style="{
                backgroundColor:
                  activeTab === item.prop
                    ? 'var(--left-menu-bg-active-color)'
                    : 'var(--el-bg-color)',
                color:
                  activeTab === item.prop
                    ? 'var(--left-menu-text-active-color)'
                    : 'var(--el-text-color-regular)'
              }"
              @mouseenter="isHovered = item.prop"
              @mouseleave="isHovered = ''"
              @click="handleTabChange(item.prop)"
            >
              <div
                :class="[
                  `${prefixCls}-header__title`,
                  'relative font-18px font-bold ml-10px duration-300 ease-in-out',
                  isHovered === item.prop ? 'translate-x-1.5' : 'translate-x--1.5'
                ]"
              >
                <div class="flex items-center">
                  {{ item.title }}
                  <ElTooltip v-if="item.message" :content="item.message" placement="right">
                    <Icon icon="bi:question-circle-fill" class="ml-5px" :size="14" />
                  </ElTooltip>
                </div>
              </div>
              <Icon :icon="activeTab === item.prop ? 'ep:arrow-up' : 'ep:arrow-down'" />
            </div>
          </div>
        </ElScrollbar>
      </div>
      <ElRow>
        <template v-for="(formItem, key) in schema.formItems" :key="formItem.itemProps.prop">
          <!-- Lines模式下的Divider或Tabs模式下隐藏Divider -->
          <!-- 修改 Lines 模式下的 Divider -->
          <div
            v-if="formItem.componentProps.component === 'Divider'"
            :class="[`${prefixCls}-header`, schema.dividerType === 'lines' ? 'sticky-divider' : '']"
            class="rounded-t-[16px] w-full m-b-20px relative h-50px shadow-[0_8px_16px_-2px_rgba(64,158,255,0.15)] hover:shadow-[0_8px_32px_-4px_rgba(64,158,255,0.25)] flex justify-between items-center layout-border__bottom px-10px cursor-pointer"
            :style="{
              backgroundColor: 'var(--left-menu-bg-active-color)',
              color: 'var(--left-menu-text-active-color)',
              display: schema.dividerType === 'tabs' ? 'none' : 'flex'
            }"
            @mouseenter="isHovered = formItem.itemProps.prop"
            @mouseleave="isHovered = ''"
            @click="toggleGroupVisibility(getGroupIndex(formItem.itemProps.prop))"
          >
            <div
              :class="[
                `${prefixCls}-header__title`,
                'relative font-18px font-bold ml-10px duration-300 ease-in-out',
                isHovered === formItem.itemProps.prop ? 'translate-x-1.5' : 'translate-x--1.5'
              ]"
            >
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
          <ElCollapseTransition v-else>
            <ElCol
              v-if="formItemProps[formItem.itemProps.prop].hidden"
              v-show="
                (schema.dividerType === 'tabs' &&
                  activeTab === getGroupIndex(formItem.itemProps.prop) &&
                  formItemProps[formItem.itemProps.prop].display) ||
                (schema.dividerType !== 'tabs' &&
                  ((Object.keys(dividerCollapses).length !== 0 &&
                    !dividerCollapses[getGroupIndex(formItem.itemProps.prop)] &&
                    formItemProps[formItem.itemProps.prop].display) ||
                    (Object.keys(dividerCollapses).length === 0 &&
                      formItemProps[formItem.itemProps.prop].display)))
              "
              v-bind="formItemProps[formItem.itemProps.prop].colProps"
            >
              <div
                v-if="schema.isDescription"
                class="bg-[var(--el-fill-color-light)] outline-1px outline-[var(--el-border-color-lighter)] outline-solid flex-1"
                :class="schema.direction === 'vertical' ? '' : 'flex items-stretch'"
              >
                <div
                  class="text-left px-8px py-11px font-700 color-[var(--el-text-color-regular)]"
                  :class="
                    schema.direction === 'vertical'
                      ? 'border-b-1px border-b-[var(--el-border-color-lighter)] border-b-solid'
                      : 'w-120px border-r-1px border-r-[var(--el-border-color-lighter)] border-r-solid'
                  "
                >
                  {{ t(formItem.itemProps.label as string) }}
                </div>
                <div
                  class="flex-1 px-8px p-t-11px bg-[var(--el-bg-color)] color-[var(--el-text-color-primary)] text-size-14px"
                  :class="schema.direction === 'vertical' ? 'p-b-1px' : ''"
                >
                  <ElFormItem
                    v-if="formItem.componentProps.component"
                    :ref="(el: any) => setFormItemRefMap(el, formItem.itemProps.prop)"
                    v-bind="formItem.itemProps"
                    label=""
                  >
                    <RenderFormItem
                      v-model="formModel"
                      :formItem="formItem"
                      :formItemProps="formItemProps"
                      :form-methods="formMethods"
                      :form-components="formComponents"
                    />
                  </ElFormItem>
                </div>
              </div>
              <ElFormItem
                class="px-10px"
                v-else-if="formItem.componentProps.component"
                :ref="(el: any) => setFormItemRefMap(el, formItem.itemProps.prop)"
                v-bind="formItem.itemProps"
              >
                <template #label="{ label }">
                  <template v-if="formItem.itemProps.slots?.label">
                    <RenderSlotItem
                      v-if="isArray(formItem.itemProps.slots?.label)"
                      :slotItems="formItem.itemProps.slots?.label"
                      :parent-form-model="formModel"
                      :parent-form-item-props="formItemProps"
                    />
                    <span
                      v-else-if="formItem.itemProps.slots?.label.html"
                      v-html="formItem.itemProps.slots?.label.html"
                    ></span>
                  </template>
                  <span v-else>{{ t(label as string) }}</span>
                  <ElPopover v-if="formMode == 'demo'" placement="right" width="50vh">
                    <template #reference>
                      <Icon class="ml-5px mt-10px" icon="bi:question-circle-fill" :size="14" />
                    </template>
                    <ElScrollbar height="40vh">
                      <VueJsonPretty
                        :highlightMouseoverNode="true"
                        :data="schema.formItems![key]"
                      />
                    </ElScrollbar>
                  </ElPopover>
                </template>
                <RenderFormItem
                  v-model="formModel"
                  :formItem="formItem"
                  :formItemProps="formItemProps"
                  :form-methods="formMethods"
                  :form-components="formComponents"
                />
              </ElFormItem>
              <div v-else v-html="formItem.componentProps.slots.default.html"></div>
            </ElCol>
          </ElCollapseTransition>
        </template>
        <ElCol
          class="px-10px"
          :class="schema.isDescription ? 'py-10px' : ''"
          v-if="schema.isSearch"
          :xl="6"
          :lg="6"
          :md="12"
          :sm="12"
          :xs="24"
        >
          <ActionButton
            :show-expand="
              unref(expandIndex) > 0 &&
              schema.formItems?.length !== undefined &&
              schema.formItems?.length > unref(expandIndex)
            "
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

// Tabs样式
.has-tabs {
  position: relative;
}

.tabs-container {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 10px 10px 0;
  margin-bottom: 15px;
  background-color: var(--el-bg-color-overlay);
  border-radius: 16px 16px 0 0;
}

.tabs-scrollbar {
  overflow-x: auto;
  white-space: nowrap;
}

.tabs-nav {
  display: flex;
  flex-wrap: nowrap;
  margin-bottom: 10px;
  gap: 10px;
}

.tab-item {
  min-width: 150px;
  transition: all 0.3s;

  &.active {
    border-bottom: 2px solid var(--el-color-primary);
  }

  .@{prefix-cls}-header__title {
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

// 添加 sticky divider 样式
.sticky-divider {
  position: sticky;
  top: 0;
  z-index: 9;
  background-color: var(--left-menu-bg-active-color) !important;
}
</style>
