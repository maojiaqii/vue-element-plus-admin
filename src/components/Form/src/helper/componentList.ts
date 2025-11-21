import { FormSchema } from '@/components/Form'
// 所有可用组件集合
const componentList: FormSchema[] = [
  {
    itemProps: {
      prop: '',
      label: '文本框',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 12,
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12
    },
    componentProps: {
      component: 'Input',
      disabled: false,
      showPassword: false,
      type: 'text',
      clearable: true,
      others: {
        defValue: undefined
      },
      slots: {
        prefix: undefined,
        suffix: undefined,
        prepend: undefined,
        append: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '文本框',
      type: 'Input',
      icon: 'tdesign:component-input'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '数字框',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 12,
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12
    },
    componentProps: {
      component: 'InputNumber',
      disabled: false,
      precision: 0,
      others: {
        defValue: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '数字框',
      type: 'InputNumber',
      icon: 'ant-design:field-number-outlined'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '开关',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 12,
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12
    },
    componentProps: {
      component: 'Switch',
      disabled: false,
      others: {
        defValue: undefined,
        style: '--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949',
        activeValue: 1,
        inactiveValue: 0,
        activeText: '',
        inactiveText: ''
      },
      slots: {
        prefix: undefined,
        suffix: undefined,
        prepend: undefined,
        append: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '开关',
      type: 'Switch',
      icon: 'ep:open'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '评分',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 12,
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12
    },
    componentProps: {
      component: 'Rate',
      disabled: false,
      others: {
        defValue: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '评分',
      type: 'Rate',
      icon: 'ant-design:star-outlined'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '滑块',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 12,
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12
    },
    componentProps: {
      component: 'Slider',
      disabled: false,
      others: {
        defValue: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '滑块',
      type: 'Slider',
      icon: 'tdesign:git-commit'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '单选',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 12,
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12
    },
    componentProps: {
      component: 'RadioGroup',
      options: [],
      query: {},
      disabled: false,
      others: {
        defValue: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '单选',
      type: 'RadioGroup',
      icon: 'tdesign:component-radio'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '多选',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 12,
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12
    },
    componentProps: {
      component: 'CheckboxGroup',
      options: [],
      query: {},
      disabled: false,
      others: {
        defValue: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '多选',
      type: 'CheckboxGroup',
      icon: 'tdesign:component-checkbox'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '穿梭框',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 12,
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12
    },
    componentProps: {
      component: 'Transfer',
      data: [],
      disabled: false,
      others: {
        defValue: undefined,
        props: {
          key: 'value',
          label: 'label'
        }
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '穿梭框',
      type: 'Transfer',
      icon: 'ep:switch'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '下拉选择',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 12,
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12
    },
    componentProps: {
      component: 'Select',
      options: [],
      query: {},
      clearable: true,
      multiple: false,
      disabled: false,
      others: {
        defValue: undefined
      },
      slots: {
        default: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '下拉选择',
      type: 'Select',
      icon: 'tdesign:component-dropdown'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '时间选择',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 12,
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12
    },
    componentProps: {
      component: 'TimePicker',
      clearable: true,
      disabled: false,
      others: {
        defValue: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '时间选择',
      type: 'TimePicker',
      icon: 'tdesign:time'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '日期选择',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 12,
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12
    },
    componentProps: {
      component: 'DatePicker',
      type: 'date',
      valueFormat: '',
      clearable: true,
      disabled: false,
      others: {
        defValue: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '日期选择',
      type: 'DatePicker',
      icon: 'tdesign:calendar-1'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '颜色选择',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 12,
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12
    },
    componentProps: {
      component: 'ColorPicker',
      showAlpha: true,
      disabled: false,
      others: {
        defValue: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '颜色选择',
      type: 'ColorPicker',
      icon: 'ant-design:bg-colors-outlined'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '树形选择',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 12,
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12
    },
    componentProps: {
      component: 'TreeSelect',
      data: [],
      multiple: false,
      disabled: false,
      clearable: true,
      others: {
        defValue: undefined
      },
      slots: {
        default: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '树形选择',
      type: 'TreeSelect',
      icon: 'tdesign:tree-list'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '树形控件',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 12,
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12
    },
    componentProps: {
      component: 'Tree',
      data: [],
      multiple: false,
      disabled: false,
      others: {},
      slots: {
        default: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '树形控件',
      type: 'Tree',
      icon: 'tdesign:tree-list'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '表格',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 24,
      xs: 24,
      sm: 24,
      md: 24,
      lg: 24,
      xl: 24
    },
    componentProps: {
      component: 'Table',
      isDetail: false,
      tableCode: '',
      others: {},
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '表格',
      type: 'Table',
      icon: 'tdesign:component-grid'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '表格挑选',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 12,
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12
    },
    componentProps: {
      component: 'SelectTable',
      multiple: false,
      table: '',
      search: '',
      side: undefined,
      on: {
        select: '(selectedData) => {\n  console.log(selectedData)\n}'
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '表格挑选',
      type: 'SelectTable',
      icon: 'tdesign:component-grid'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '富文本',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 24,
      xs: 24,
      sm: 24,
      md: 24,
      lg: 24,
      xl: 24
    },
    componentProps: {
      component: 'Editor',
      disabled: false,
      others: {
        height: '30vh',
        defValue: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '富文本',
      type: 'Editor',
      icon: 'ant-design:file-word-twotone'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '代码编辑',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 24,
      xs: 24,
      sm: 24,
      md: 24,
      lg: 24,
      xl: 24
    },
    componentProps: {
      component: 'CodeEditor',
      language: 'javascript',
      disabled: false,
      others: {
        height: '30vh',
        defValue: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '代码编辑',
      type: 'CodeEditor',
      icon: 'tdesign:code'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '子表单',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 24,
      xs: 24,
      sm: 24,
      md: 24,
      lg: 24,
      xl: 24
    },
    componentProps: {
      component: 'SubForm',
      isDetail: false,
      formCode: '',
      others: {},
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '子表单',
      type: 'SubForm',
      icon: 'tdesign:component-grid'
    }
  },
  {
    itemProps: {
      prop: ''
    },
    componentProps: {
      component: 'Divider',
      title: '',
      collapses: false
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '分割线',
      type: 'Divider',
      icon: 'tdesign:component-divider-vertical'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '图标选择',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 12,
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12
    },
    componentProps: {
      component: 'IconPicker',
      disabled: false,
      others: {
        defValue: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '图标选择',
      type: 'IconPicker',
      icon: 'tdesign:cat'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '我同意',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 12,
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12
    },
    componentProps: {
      component: 'IAgree',
      text: '',
      link: [],
      others: {},
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '我同意',
      type: 'IAgree',
      icon: 'tdesign:user-checked'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '验证码',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 12,
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12
    },
    componentProps: {
      component: 'Captcha',
      type: 'math',
      others: {
        defValue: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '验证码',
      type: 'Captcha',
      icon: 'tdesign:secured'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '文件上传',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 24,
      xs: 24,
      sm: 24,
      md: 24,
      lg: 24,
      xl: 24
    },
    componentProps: {
      component: 'Upload',
      disabled: false,
      others: {
        defValue: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '文件上传',
      type: 'Upload',
      icon: 'ant-design:cloud-upload-outlined'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '按钮',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 12,
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12
    },
    componentProps: {
      component: 'Button',
      disabled: false,
      staticText: '',
      others: {},
      on: {
        click: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '按钮',
      type: 'Button',
      icon: 'tdesign:button'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '标签',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 12,
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12
    },
    componentProps: {
      component: 'Tag',
      disabled: false,
      staticText: '',
      type: 'primary',
      others: {},
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '标签',
      type: 'Tag',
      icon: 'tdesign:tag'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '图片截取',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 24,
      xs: 24,
      sm: 24,
      md: 24,
      lg: 24,
      xl: 24
    },
    componentProps: {
      component: 'ImageCropping',
      disabled: false,
      others: {
        defValue: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '图片截取',
      type: 'ImageCropping',
      icon: 'ant-design:picture-outlined'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '提示说明',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 24,
      xs: 24,
      sm: 24,
      md: 24,
      lg: 24,
      xl: 24
    },
    componentProps: {
      component: 'Infotip',
      title: '提醒',
      schema: [
        {
          label: '',
          keys: []
        }
      ],
      others: {},
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '提示说明',
      type: 'Infotip',
      icon: 'tdesign:tips'
    }
  },
  {
    itemProps: {
      prop: '',
      label: '字符头像',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    colProps: {
      span: 12,
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12
    },
    componentProps: {
      component: 'CharAvatar',
      text: '',
      others: {},
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '字符头像',
      type: 'CharAvatar',
      icon: 'tdesign:copyright'
    }
  }
]
// 我的待办查询条件默认添加的字段
const formTodo: FormSchema[] = [
  {
    colProps: {
      span: 6,
      lg: 6,
      md: 12,
      sm: 12,
      xl: 6,
      xs: 24
    },
    itemProps: {
      prop: 'flowStartUser',
      label: '申请人',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    componentProps: {
      component: 'Input',
      disabled: false,
      showPassword: false,
      type: 'text',
      clearable: true,
      others: {
        defValue: undefined
      },
      slots: {
        prefix: undefined,
        suffix: undefined,
        prepend: undefined,
        append: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '文本框',
      type: 'Input',
      icon: 'tdesign:component-input'
    }
  },
  {
    colProps: {
      span: 6,
      lg: 6,
      md: 12,
      sm: 12,
      xl: 6,
      xs: 24
    },
    itemProps: {
      prop: 'flowIsReject',
      label: '是否退回',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    componentProps: {
      component: 'Select',
      options: [
        {
          label: '否',
          value: 0
        },
        {
          label: '是',
          value: 1
        }
      ],
      query: {},
      clearable: true,
      multiple: false,
      disabled: false,
      others: {
        defValue: undefined
      },
      slots: {
        default: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '下拉选择',
      type: 'Select',
      icon: 'tdesign:component-dropdown'
    }
  },
  {
    colProps: {
      span: 6,
      lg: 6,
      md: 12,
      sm: 12,
      xl: 6,
      xs: 24
    },
    itemProps: {
      prop: 'minFlowStartTime',
      label: '申请时间（小）',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    componentProps: {
      type: 'date',
      component: 'DatePicker',
      valueFormat: 'YYYY-MM-DD',
      clearable: true,
      disabled: false,
      others: {
        defValue: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '日期选择',
      type: 'DatePicker',
      icon: 'tdesign:calendar-1'
    }
  },
  {
    colProps: {
      span: 6,
      lg: 6,
      md: 12,
      sm: 12,
      xl: 6,
      xs: 24
    },
    itemProps: {
      prop: 'maxFlowStartTime',
      label: '申请时间（大）',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    componentProps: {
      type: 'date',
      component: 'DatePicker',
      valueFormat: 'YYYY-MM-DD',
      clearable: true,
      disabled: false,
      others: {
        defValue: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '日期选择',
      type: 'DatePicker',
      icon: 'tdesign:calendar-1'
    }
  }
]
// 我的已办查询条件默认添加的字段
const formDone: FormSchema[] = [
  {
    colProps: {
      span: 6,
      lg: 6,
      md: 12,
      sm: 12,
      xl: 6,
      xs: 24
    },
    itemProps: {
      prop: 'flowStartUser',
      label: '申请人',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    componentProps: {
      component: 'Input',
      disabled: false,
      showPassword: false,
      type: 'text',
      clearable: true,
      others: {
        defValue: undefined
      },
      slots: {
        prefix: undefined,
        suffix: undefined,
        prepend: undefined,
        append: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '文本框',
      type: 'Input',
      icon: 'tdesign:component-input'
    }
  },
  {
    colProps: {
      span: 6,
      lg: 6,
      md: 12,
      sm: 12,
      xl: 6,
      xs: 24
    },
    itemProps: {
      prop: 'flowIsEnd',
      label: '是否办结',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    componentProps: {
      component: 'Select',
      options: [
        {
          label: '未办结',
          value: 0
        },
        {
          label: '已办结',
          value: 1
        }
      ],
      query: {},
      clearable: true,
      multiple: false,
      disabled: false,
      others: {
        defValue: undefined
      },
      slots: {
        default: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '下拉选择',
      type: 'Select',
      icon: 'tdesign:component-dropdown'
    }
  },
  {
    colProps: {
      span: 6,
      lg: 6,
      md: 12,
      sm: 12,
      xl: 6,
      xs: 24
    },
    itemProps: {
      prop: 'minFlowStartTime',
      label: '申请时间（小）',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    componentProps: {
      type: 'date',
      component: 'DatePicker',
      valueFormat: 'YYYY-MM-DD',
      clearable: true,
      disabled: false,
      others: {
        defValue: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '日期选择',
      type: 'DatePicker',
      icon: 'tdesign:calendar-1'
    }
  },
  {
    colProps: {
      span: 6,
      lg: 6,
      md: 12,
      sm: 12,
      xl: 6,
      xs: 24
    },
    itemProps: {
      prop: 'maxFlowStartTime',
      label: '申请时间（大）',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    componentProps: {
      type: 'date',
      component: 'DatePicker',
      valueFormat: 'YYYY-MM-DD',
      clearable: true,
      disabled: false,
      others: {
        defValue: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '日期选择',
      type: 'DatePicker',
      icon: 'tdesign:calendar-1'
    }
  }
]
// 我发起的查询条件默认添加的字段
const formOwn: FormSchema[] = [
  {
    colProps: {
      span: 6,
      lg: 6,
      md: 12,
      sm: 12,
      xl: 6,
      xs: 24
    },
    itemProps: {
      prop: 'flowStartUser',
      label: '申请人',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    componentProps: {
      component: 'Input',
      disabled: false,
      showPassword: false,
      type: 'text',
      clearable: true,
      others: {
        defValue: undefined
      },
      slots: {
        prefix: undefined,
        suffix: undefined,
        prepend: undefined,
        append: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '文本框',
      type: 'Input',
      icon: 'tdesign:component-input'
    }
  },
  {
    colProps: {
      span: 6,
      lg: 6,
      md: 12,
      sm: 12,
      xl: 6,
      xs: 24
    },
    itemProps: {
      prop: 'flowIsEnd',
      label: '是否办结',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    componentProps: {
      component: 'Select',
      options: [
        {
          label: '未办结',
          value: 0
        },
        {
          label: '已办结',
          value: 1
        }
      ],
      query: {},
      clearable: true,
      multiple: false,
      disabled: false,
      others: {
        defValue: undefined
      },
      slots: {
        default: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '下拉选择',
      type: 'Select',
      icon: 'tdesign:component-dropdown'
    }
  },
  {
    colProps: {
      span: 6,
      lg: 6,
      md: 12,
      sm: 12,
      xl: 6,
      xs: 24
    },
    itemProps: {
      prop: 'minFlowStartTime',
      label: '申请时间（小）',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    componentProps: {
      type: 'date',
      component: 'DatePicker',
      valueFormat: 'YYYY-MM-DD',
      clearable: true,
      disabled: false,
      others: {
        defValue: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '日期选择',
      type: 'DatePicker',
      icon: 'tdesign:calendar-1'
    }
  },
  {
    colProps: {
      span: 6,
      lg: 6,
      md: 12,
      sm: 12,
      xl: 6,
      xs: 24
    },
    itemProps: {
      prop: 'maxFlowStartTime',
      label: '申请时间（大）',
      tip: undefined,
      slots: {
        default: undefined,
        label: undefined,
        error: undefined
      },
      others: {}
    },
    componentProps: {
      type: 'date',
      component: 'DatePicker',
      valueFormat: 'YYYY-MM-DD',
      clearable: true,
      disabled: false,
      others: {
        defValue: undefined
      },
      on: {
        change: ''
      },
      lifecycle: {
        mounted: undefined,
        updated: undefined,
        unmounted: undefined
      }
    },
    hidden: true,
    display: true,
    permi: undefined,
    componentInfo: {
      title: '日期选择',
      type: 'DatePicker',
      icon: 'tdesign:calendar-1'
    }
  }
]

export { componentList, formTodo, formDone, formOwn }
