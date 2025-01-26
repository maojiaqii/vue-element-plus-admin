import Form from './src/Form.vue'
export type {
  ComponentName,
  InputComponentProps,
  AutocompleteComponentProps,
  InputNumberComponentProps,
  SelectOption,
  SelectComponentProps,
  SelectV2ComponentProps,
  CascaderComponentProps,
  SwitchComponentProps,
  RateComponentProps,
  ColorPickerComponentProps,
  TransferComponentProps,
  RadioOption,
  RadioGroupComponentProps,
  RadioButtonComponentProps,
  CheckboxOption,
  CheckboxGroupComponentProps,
  DividerComponentProps,
  DatePickerComponentProps,
  DateTimePickerComponentProps,
  TimePickerComponentProps,
  TimeSelectComponentProps,
  ColProps,
  FormSetProps,
  FormItemProps,
  FormSchema,
  FormProps,
  PlaceholderModel,
  InputPasswordComponentProps,
  TreeSelectComponentProps
} from './src/types'

export interface FormExpose {
  formModel: Recordable
  getComponentExpose: (field: string) => any
  getFormItemExpose: (field: string) => any
  formConstant: Recordable
  setFormConstant: (field: string, val: any) => any
}

export { Form }
