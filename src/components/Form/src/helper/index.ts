import { useI18n } from '@/hooks/web/useI18n'
import { ColProps, FormProps, FormSchema, PlaceholderModel } from '../types'
import { get, set } from 'lodash-es'
import { ElMessage, MessageProps, ElNotification, NotificationProps, FormRules } from 'element-plus'
import { useValidator } from '@/hooks/web/useValidator'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const { t } = useI18n()
// @ts-ignore
const { required, lengthRange, notSpace, notSpecialCharacters, phone, email, maxlength, check } =
  useValidator()

export const setFormRules = (formRules: Recordable = {}): FormRules => {
  const values = {}
  for (const key in formRules) {
    if (formRules[key] && Array.isArray(formRules[key])) {
      values[key] = []
      for (const rule of formRules[key]) {
        values[key]!.push(eval(rule))
      }
    }
  }
  return values
}

export const setComponentProps = (
  schema: FormSchema[] = [],
  autoSetPlaceholder: boolean = true
): Recordable => {
  const values: Recordable = {}
  for (const col of schema) {
    values[col.itemProps.prop] = { hidden: true, display: true, componentProps: {}, colProps: {} }
    let placeholder: PlaceholderModel = {}
    if (autoSetPlaceholder) {
      placeholder = setTextPlaceholder(col)
    }

    values[col.itemProps.prop].componentProps = {
      ...placeholder,
      ...col.componentProps,
      disabled: true
    }

    values[col.itemProps.prop].colProps = {
      ...setGridProp(col.colProps)
    }

    if (values[col.itemProps.prop].componentProps.on) {
      delete values[col.itemProps.prop].componentProps.on
    }

    if (values[col.itemProps.prop].componentProps.slots) {
      delete values[col.itemProps.prop].componentProps.slots
    }

    if (!values[col.itemProps.prop].componentProps.style) {
      values[col.itemProps.prop].componentProps.style = { width: '100%' }
    }

    col.hidden === false && (values[col.itemProps.prop].hidden = false)
    col.display === false && (values[col.itemProps.prop].display = false)
    !col.componentProps.disabled && (values[col.itemProps.prop].componentProps.disabled = false)
  }
  return values
}

/**
 *
 * @param formMethods
 * @param item 传入的组件属性
 * @param formData 表单数据对象
 * @param formItems 所有表单数据项
 */
export const setComponentEvents = (
  formMethods: any,
  item: Recordable,
  formData: Recordable,
  formItems: any
): Recordable => {
  const onEvents = item?.on || {}
  const newOnEvents: Recordable = {}
  for (const key in onEvents) {
    if (onEvents[key]) {
      newOnEvents[`${key}`] = new Function('return ' + onEvents[key]).bind({
        ...formMethods,
        formData: formData,
        formItems: formItems,
        userStore: userStore,
        message: message,
        notification: notification
      })()
    }
  }
  console.log(newOnEvents)
  return newOnEvents
}

/**
 *
 * @param item 对应组件数据
 * @returns 返回提示信息对象
 * @description 用于自动设置placeholder
 */
export const setTextPlaceholder = (item: FormSchema): PlaceholderModel => {
  const textMap = ['Input', 'Autocomplete', 'InputNumber', 'InputPassword', 'Captcha']
  const selectMap = ['Select', 'TimePicker', 'DatePicker', 'TimeSelect', 'SelectV2']
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

const message = (msgProp: MessageProps) => {
  ElMessage(msgProp)
}

const notification = (msgProp: NotificationProps) => {
  ElNotification(msgProp)
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
            : schema[key].componentProps.defaultValue !== void 0
              ? schema[key].componentProps.defaultValue.startsWith('${') &&
                schema[key].componentProps.defaultValue.endsWith('}')
                ? eval(
                    schema[key].componentProps.defaultValue.substring(
                      2,
                      schema[key].componentProps.defaultValue.length - 1
                    )
                  )
                : schema[key].componentProps.defaultValue
              : undefined
        )
      }
    }
  }
  return model
}

export const setFormLifecycle = (
  lifecycle: Recordable = {},
  formMethods: any,
  formData: Recordable = {},
  formItems: any
): Recordable => {
  const values = {}
  for (const key in lifecycle) {
    if (lifecycle[key] !== void 0) {
      values[`${key}`] = new Function('return ' + lifecycle[key]).bind({
        ...formMethods,
        formData: formData,
        formItems: formItems,
        userStore: userStore,
        message: message,
        notification: notification
      })()
    }
  }
  return values
}
