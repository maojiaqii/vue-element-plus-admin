import { useI18n } from '@/hooks/web/useI18n'
import {
  CheckboxOption,
  ColProps,
  FormProps,
  FormSchema,
  PlaceholderModel,
  RadioOption,
  SelectOption
} from '../types'
import { get, set } from 'lodash-es'
import { ElMessage, FormRules, FormItemRule } from 'element-plus'
import * as isUtil from '@/utils/is'
import { getDictDataApi } from '@/api/common'
import { createVNode, reactive } from 'vue'
import { Icon } from '@/components/Icon'
import { isCustomFunction } from '@/utils/is'
import { newFunction } from '@/utils/newFunction'
import { hasPermi } from '@/components/Permission'

const { t } = useI18n()

export const setFormRules = async (
  formRules: Recordable<string, FormItemRule[]> = {},
  formData: Recordable = {}
): Promise<FormRules> => {
  const values: Recordable<string, FormItemRule[]> = {}
  for (const key in formRules) {
    if (formRules[key] && isUtil.isArray(formRules[key])) {
      values[key] = []
      const theKeyFormRules = formRules[key] as FormItemRule[]
      for (const rule of theKeyFormRules) {
        isCustomFunction(rule.validator) &&
          newFunction(rule.validator, {
            formData: formData
          }).then((res) => {
            rule.validator = res.func
          })
        values[key].push(rule)
      }
    }
  }
  return values
}

export const setComponentProps = (
  schema: FormSchema[] = [],
  autoSetPlaceholder: boolean = true,
  mode: string = 'edit'
): Recordable => {
  const values: Recordable = reactive({})
  for (const col of schema) {
    values[col.itemProps.prop] = { hidden: true, display: true, componentProps: {}, colProps: {} }
    let placeholder: PlaceholderModel = {}
    if (autoSetPlaceholder) {
      placeholder = setTextPlaceholder(col)
    }

    values[col.itemProps.prop].componentProps = {
      options: [],
      ...placeholder,
      ...col.componentProps,
      disabled: true
    }

    if (
      values[col.itemProps.prop].componentProps.component === 'Button' &&
      isUtil.isString(values[col.itemProps.prop].componentProps.icon)
    ) {
      values[col.itemProps.prop].componentProps.icon = createVNode(Icon, {
        icon: values[col.itemProps.prop].componentProps.icon
      })
    }

    // slots属性值传递的是函数字符串,解析为函数
    for (const key in values[col.itemProps.prop].componentProps.slots) {
      const slot = values[col.itemProps.prop].componentProps.slots[key]
      isCustomFunction(slot) &&
        newFunction(slot).then((res) => {
          values[col.itemProps.prop].componentProps.slots[key] = res.func
        })
    }

    // 异步加载 options
    setRemoteOptions(col).then((remoteOptions) => {
      if (remoteOptions.options) {
        // 动态更新异步加载的 options
        set(values[col.itemProps.prop].componentProps, 'options', remoteOptions.options)
      }
    })

    values[col.itemProps.prop].colProps = {
      ...setGridProp(col.colProps)
    }

    if (values[col.itemProps.prop].componentProps.on) {
      delete values[col.itemProps.prop].componentProps.on
    }

    if (!values[col.itemProps.prop].componentProps.style) {
      values[col.itemProps.prop].componentProps.style = { width: '100%' }
    }

    if (col.hidden === false) {
      values[col.itemProps.prop].hidden = false
    } else {
      values[col.itemProps.prop].hidden = hasPermi(col.permi)
    }
    col.display === false && (values[col.itemProps.prop].display = false)
    !col.componentProps.disabled && (values[col.itemProps.prop].componentProps.disabled = false)
    mode !== 'edit' && (values[col.itemProps.prop].componentProps.disabled = true)
  }
  return values
}

/**
 *
 * @param formMethods
 * @param item 传入的组件属性
 * @param formData 表单数据对象
 * @param formItems 所有表单数据项
 * @param parentFormData 父级表单数据对象
 * @param parentFormItems 父级表单数据项
 * @param parentComponent 父级表单
 */
export const setComponentEvents = (
  item: Recordable,
  formData: Recordable,
  formItems: any,
  formMethods?: any,
  parentFormData?: Recordable,
  parentFormItems?: Recordable,
  parentComponent?: Recordable
): Recordable => {
  const onEvents = item?.on || {}
  const newOnEvents: Recordable = {}
  for (const key in onEvents) {
    const event = onEvents[key]
    isCustomFunction(event) &&
      (newOnEvents[`${key}`] = () => {
        newFunction(event, {
          formData: formData,
          formItems: formItems,
          ...formMethods,
          parentFormData: parentFormData,
          parentFormItems: parentFormItems,
          parentComponent: parentComponent
        }).then((res) => (res.params ? res.func(res.params) : res.func()))
      })
  }
  return newOnEvents
}

export const setFormLifecycle = (
  lifecycle: Recordable = {},
  formData: Recordable = {},
  formItems: any,
  formMethods?: any,
  parentFormData?: Recordable,
  parentFormItems?: Recordable
): Recordable => {
  const values = {}
  for (const key in lifecycle) {
    const event = lifecycle[key]
    isCustomFunction(event) &&
      (values[`${key}`] = () => {
        newFunction(event, {
          formData: formData,
          formItems: formItems,
          ...formMethods,
          parentFormData: parentFormData,
          parentFormItems: parentFormItems
        }).then((res) => (res.params ? res.func(res.params) : res.func()))
      })
  }
  return values
}

/**
 *
 * @param item 对应组件数据
 * @returns 返回提示信息对象
 * @description 用于自动设置placeholder
 */
export const setTextPlaceholder = (item: FormSchema): PlaceholderModel => {
  const textMap = ['Input', 'Autocomplete', 'InputNumber', 'InputPassword', 'Captcha']
  const selectMap = ['Select', 'TimePicker', 'DatePicker', 'TimeSelect', 'SelectV2', 'TreeSelect']
  if (item?.componentProps?.component?.placeholder) {
    return {}
  }
  if (textMap.includes(item?.componentProps?.component)) {
    return {
      placeholder: t('common.inputText')
    }
  }
  if (selectMap.includes(item?.componentProps?.component)) {
    // 一些范围选择器
    const twoTextMap = ['datetimerange', 'daterange', 'monthrange', 'datetimerange', 'daterange']
    if (
      twoTextMap.includes((item?.componentProps.type || item?.componentProps.isRange) as string)
    ) {
      return {
        startPlaceholder: t('common.startTimeText'),
        endPlaceholder: t('common.endTimeText'),
        rangeSeparator: '-'
      }
    } else {
      return {
        placeholder: t('common.selectText')
      }
    }
  }
  return {}
}

/**
 *
 * @param item 对应组件数据
 * @returns 返回数据集
 * @description 用于从数据库获取控件options（数据集）
 */
export const setRemoteOptions = async (
  item: FormSchema
): Promise<{ options?: CheckboxOption[] | RadioOption[] | SelectOption[] }> => {
  const optionsMap = [
    'Select',
    'SelectV2',
    'CheckboxGroup',
    'RadioGroup',
    'RadioButton',
    'CheckboxButton'
  ]
  if (optionsMap.includes(item?.componentProps?.component) && item?.componentProps?.query) {
    item.componentProps.loading = true
    const placeholder = { options: [] } // 占位默认值
    const res = await getDictDataApi(item?.componentProps?.query)
    if (res.code != 200) {
      ElMessage.error(res.msg)
    } else {
      placeholder.options = res.data?.data
    }
    return placeholder
  }
  return {}
}

/**
 *
 * @param col 内置栅格
 * @returns 返回栅格属性
 * @description 合并传入进来的栅格属性
 */
export const setGridProp = (col: ColProps = {}): ColProps => {
  const colProps: ColProps = {
    // 如果有span，代表用户优先级更高，所以不需要默认栅格
    ...(col.span
      ? {}
      : {
          xs: 24,
          sm: 12,
          md: 12,
          lg: 12,
          xl: 12
        }),
    ...col
  }
  return colProps
}

/**
 *
 * @param schema Form表单结构化数组
 * @param formModel FormMoel
 * @returns FormMoel
 * @description 生成对应的formModel
 */
export const initModel = (schema: FormProps, formModel: Recordable) => {
  const model: Recordable = { ...formModel }
  for (const key in schema) {
    if (schema[key]) {
      if (!schema[key].hidden) {
        delete model[key]
      } else if (
        schema[key].componentProps.component &&
        schema[key].componentProps.component !== 'Divider' &&
        schema[key].componentProps.component !== 'Button'
      ) {
        const hasField = get(model, key)
        // 如果先前已经有值存在，则不进行重新赋值，而是采用现有的值
        set(
          model,
          key,
          hasField !== void 0
            ? get(model, key)
            : schema[key].componentProps.defValue !== void 0
              ? isUtil.isString(schema[key].componentProps.defValue) &&
                schema[key].componentProps.defValue.startsWith('${') &&
                schema[key].componentProps.defValue.endsWith('}')
                ? eval(
                    schema[key].componentProps.defValue.substring(
                      2,
                      schema[key].componentProps.defValue.length - 1
                    )
                  )
                : schema[key].componentProps.defValue
              : undefined
        )
      }
    }
  }
  return model
}

export const setDividerCollapses = (formItems: any): Recordable => {
  const values = {}
  for (const col of formItems) {
    if (col.componentProps.component === 'Divider') {
      values[col.itemProps.prop] = !!col.componentProps.collapses
    }
  }
  return values
}
