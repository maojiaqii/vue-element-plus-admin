import { createVNode, render, reactive, ref, unref, nextTick, VNode } from 'vue'
import { ElDrawer, ElScrollbar, ElConfigProvider } from 'element-plus'
import { Form } from '@/components/Form'
import { Container } from '@/components/Container'
import { Icon } from '@/components/Icon'
import { BaseButton } from '@/components/Button'
import { toAnyString } from '@/utils'
import { isCustomFunction } from '@/utils/is'
import { newFunction } from '@/utils/newFunction'
import { hasPermi } from '@/components/Permission'
import { useLocaleStore } from '@/store/modules/locale'

function createDrawer(options: Recordable) {
  const localeStore = useLocaleStore()
  return new Promise((resolve) => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const closeFunc = ref()

    const state = reactive({
      ...options,
      width: options.size || options.width || '50%',
      destroyOnClose: true,
      lockScroll: true,
      closeOnClickModal: false,
      showClose: false,
      appendToBody: true,
      buttons: options.buttons || []
    })

    const dialogWidth = ref(state.width)
    const fullscreem = ref(false)
    const contentRef = ref()
    const dialogClass = 'M' + toAnyString()
    const footerVNodes: VNode[] = []

    const closeDrawer = () => {
      closeFunc.value.close()
      resolve(unref(contentRef))
    }

    const toggleFull = async () => {
      fullscreem.value = !fullscreem.value
      await nextTick()
      const dia = document.querySelector(`.${dialogClass}`)
      if (dia) {
        fullscreem.value
          ? dia.style.setProperty('width', '100%', 'important')
          : dia.style.setProperty('width', state.width, 'important')
      }
    }

    const register = async (expose: any) => {
      contentRef.value = expose
    }

    const renderClick = (click?: string | Function) => {
      isCustomFunction(click) &&
        newFunction(click, { contentRef: unref(contentRef), closeDialog: closeDrawer }).then(
          (res) => (res.params ? res.func(res.params) : res.func())
        )
    }

    const vnode = createVNode(
      ElConfigProvider,
      {
        locale: localeStore.getCurrentLocale.elLocale
      },
      {
        default: () =>
          createVNode(
            ElDrawer,
            {
              modelValue: true,
              ...state,
              size: dialogWidth.value,
              class: dialogClass
            },
            {
              header: (close) => {
                closeFunc.value = close
                return createVNode(
                  'div',
                  { class: 'flex justify-between items-center h-54px pl-15px pr-15px relative' },
                  [
                    options.title,
                    createVNode(
                      'div',
                      {
                        class:
                          'h-54px flex justify-between items-center absolute top-[50%] right-15px translate-y-[-50%]'
                      },
                      [
                        createVNode(Icon, {
                          class: 'cursor-pointer is-hover !h-54px mr-10px',
                          icon: unref(fullscreem)
                            ? 'radix-icons:exit-full-screen'
                            : 'radix-icons:enter-full-screen',
                          color: 'var(--el-color-info)',
                          hoverColor: 'var(--el-color-primary)',
                          onClick: () => {
                            toggleFull()
                          }
                        }),
                        createVNode(Icon, {
                          class: 'cursor-pointer is-hover !h-54px',
                          icon: 'ep:close',
                          color: 'var(--el-color-info)',
                          hoverColor: 'var(--el-color-primary)',
                          onClick: () => {
                            closeDrawer()
                          }
                        })
                      ]
                    )
                  ]
                )
              },
              default: () => {
                const vNodes: VNode[] = []
                if (options.content) {
                  for (const con of options.content) {
                    let component: any = undefined
                    if (con.type === 'form') {
                      component = Form
                    } else if (con.type === 'container') {
                      component = Container
                    } else {
                      throw new Error(`无法识别的内容类型： ${con.type}`)
                    }
                    component &&
                      vNodes.push(
                        createVNode(component, {
                          ...con.props,
                          onRegister: (expose: any) => register(expose)
                        })
                      )
                  }
                }
                return createVNode(
                  ElScrollbar,
                  { style: { height: '100%' }, class: 'useDrawer-scrollbar' },
                  {
                    default: () => {
                      return createVNode('div', {}, vNodes)
                    }
                  }
                )
              },
              footer: () => {
                if (state.buttons.length > 0) {
                  for (const con of state.buttons) {
                    const binds = { ...unref(con) }
                    if (hasPermi(binds.permi)) {
                      binds.icon && (binds.icon = createVNode(Icon, { icon: binds.icon }))
                      footerVNodes.push(
                        createVNode(
                          BaseButton,
                          { ...binds, onClick: () => renderClick(binds.on?.click) },
                          {
                            default: () => binds.staticText
                          }
                        )
                      )
                    }
                  }
                  return createVNode('div', { class: 'dialog-footer' }, footerVNodes)
                } else {
                  return undefined
                }
              }
            }
          )
      }
    )

    render(vnode, container)

    // 使用 nextTick 在渲染后操作 DOM
    nextTick(() => {
      const header = document.querySelector(`.${dialogClass} > .el-drawer__header`)
      header!.style.marginBottom = 0
      const footer = document.querySelector(`.${dialogClass} > .el-drawer__footer`)
      if (footer && footerVNodes.length === 0) {
        footer.style.display = 'none' // 隐藏 footer
      }
    }).then()
  })
}

export default createDrawer
