import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'
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
  ElTreeSelect,
  ElTag
} from 'element-plus'
import { InputPassword } from '@/components/InputPassword'
import { Editor } from '@/components/Editor'
import { CodeEditor } from '@/components/CodeEditor'
import { IconPicker } from '@/components/IconPicker'
import { IAgree } from '@/components/IAgree'
import { Captcha } from '@/components/Captcha'
import { Upload } from '@/components/Upload'
import { BaseButton } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { CharAvatar } from '@/components/CharAvatar'
import { ImageCropping } from '@/components/ImageCropping'
import { Infotip } from '@/components/Infotip'
import { Tree } from '@/components/Tree'
import { Table } from '@/components/Table'
import { WorkFlow, FlowTimeline } from '@/components/WorkFlow'
import { SelectTable } from '@/components/SelectTable'
import { SubForm } from '@/components/SubForm'

// 创建一个懒加载的 Table 组件
const AsyncTable = defineAsyncComponent(() =>
  import('@/components/Table').then((mod) => ({ default: mod.Table }))
)

const AsyncSubForm = defineAsyncComponent(() =>
  import('@/components/SubForm').then((mod) => ({ default: mod.SubForm }))
)

const componentMap: Recordable<string, Component> = {
  Input: ElInput,
  InputNumber: ElInputNumber,
  InputPassword: InputPassword,
  Switch: ElSwitch,
  Rate: ElRate,
  Slider: ElSlider,
  RadioGroup: ElRadioGroup,
  RadioButton: ElRadioGroup,
  Checkbox: ElCheckbox,
  CheckboxGroup: ElCheckboxGroup,
  CheckboxButton: ElCheckboxGroup,
  Autocomplete: ElAutocomplete,
  Select: ElSelect,
  Cascader: ElCascader,
  TimePicker: ElTimePicker,
  DatePicker: ElDatePicker,
  ColorPicker: ElColorPicker,
  Transfer: ElTransfer,
  TimeSelect: ElTimeSelect,
  TreeSelect: ElTreeSelect,
  SelectV2: ElSelectV2,
  Editor: Editor,
  CodeEditor: CodeEditor,
  IconPicker: IconPicker,
  IAgree: IAgree,
  Captcha: Captcha,
  Upload: Upload,
  Divider: ElDivider,
  Button: BaseButton,
  Icon: Icon,
  Tag: ElTag,
  Table: Table,
  ImageCropping: ImageCropping,
  Infotip: Infotip,
  Tree: Tree,
  CharAvatar: CharAvatar,
  WorkFlow: WorkFlow,
  FlowTimeline: FlowTimeline,
  SelectTable: SelectTable,
  SubForm: SubForm
}

export { componentMap }
