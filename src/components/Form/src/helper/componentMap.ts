import type { Component } from 'vue'
import {
  ElCascader,
  ElCheckbox,
  ElCheckboxGroup,
  ElColorPicker,
  ElDatePicker,
  ElInput,
  ElInputNumber,
  ElRadioGroup,
  ElRate,
  ElSelect,
  ElSelectV2,
  ElSlider,
  ElSwitch,
  ElTimePicker,
  ElTimeSelect,
  ElTransfer,
  ElAutocomplete,
  ElDivider,
  ElTreeSelect
} from 'element-plus'
import { InputPassword } from '@/components/InputPassword'
import { Editor } from '@/components/Editor'
import { JsonEditor } from '@/components/JsonEditor'
import { IconPicker } from '@/components/IconPicker'
import { IAgree } from '@/components/IAgree'
import { Captcha } from '@/components/Captcha'
import { BaseButton } from '@/components/Button'
import { Icon } from '@/components/Icon'

const componentMap: Recordable<Component, string> = {
  RadioGroup: ElRadioGroup,
  RadioButton: ElRadioGroup,
  Checkbox: ElCheckbox,
  CheckboxGroup: ElCheckboxGroup,
  CheckboxButton: ElCheckboxGroup,
  Input: ElInput,
  Autocomplete: ElAutocomplete,
  InputNumber: ElInputNumber,
  Select: ElSelect,
  Cascader: ElCascader,
  Switch: ElSwitch,
  Slider: ElSlider,
  TimePicker: ElTimePicker,
  DatePicker: ElDatePicker,
  Rate: ElRate,
  ColorPicker: ElColorPicker,
  Transfer: ElTransfer,
  Divider: ElDivider,
  TimeSelect: ElTimeSelect,
  SelectV2: ElSelectV2,
  InputPassword: InputPassword,
  Editor: Editor,
  TreeSelect: ElTreeSelect,
  JsonEditor: JsonEditor,
  IconPicker: IconPicker,
  IAgree: IAgree,
  Captcha: Captcha,
  Button: BaseButton,
  Icon: Icon
}

export { componentMap }
