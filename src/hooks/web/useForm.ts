import type { Form, FormExpose } from '@/components/Form'
import type { ElForm, ElFormItem } from 'element-plus'
import { ref, unref } from 'vue'
import router from '@/router/index'
import type { RouteRecordRaw, Router } from 'vue-router'
import { isEmptyVal, isObject } from '@/utils/is'
import { useUserStore } from '@/store/modules/user'
import { useAppStore } from '@/store/modules/app'
import { usePermissionStore } from '@/store/modules/permission'
import { useCaptchaStore } from '@/store/modules/captcha'
import { loginApi, routersApi, tenancysApi } from '@/api/login'
import { UserLoginType } from '@/api/login/types'

const appStore = useAppStore()
const permissionStore = usePermissionStore()
const userStore = useUserStore()
const captchaStore = useCaptchaStore()

export const useForm = () => {
  // From实例
  const formRef = ref<typeof Form & FormExpose>()

  // ElForm实例
  const elFormRef = ref<ComponentRef<typeof ElForm>>()

  const useRouterRef = ref<Router>()

  /**
   * @param ref Form实例
   * @param elRef ElForm实例
   * @param useRouter
   */
  const register = (
    ref: typeof Form & FormExpose,
    elRef: ComponentRef<typeof ElForm>,
    useRouter: Router
  ) => {
    formRef.value = ref
    elFormRef.value = elRef
    useRouterRef.value = useRouter
  }

  const getForm = () => {
    const form = unref(formRef)
    if (!form) {
      console.error('The form is not registered. Please use the register method to register')
    }
    return form
  }

  // 一些内置的方法
  const methods = {
    /**
     * @description 获取表单组件的实例
     * @param field 表单项唯一标识
     * @returns component instance
     */
    getComponentExpose: (field: string) => {
      const form = getForm()
      return form?.getComponentExpose(field)
    },

    /**
     * @description 获取formItem组件的实例
     * @param field 表单项唯一标识
     * @returns formItem instance
     */
    getFormItemExpose: (field: string) => {
      const form = getForm()
      return form?.getFormItemExpose(field) as ComponentRef<typeof ElFormItem>
    },

    /**
     * @description 获取ElForm组件的实例
     * @returns ElForm instance
     */
    getElFormExpose: () => {
      getForm()
      return unref(elFormRef)
    },

    getFormExpose: async () => {
      getForm()
      return unref(formRef)
    },

    setFormConstantExpose: (filed: string, val: any) => {
      const form = getForm()
      form?.setFormConstant(filed, val)
    },

    getFormConstantExpose: () => {
      const form = getForm()
      return form?.formConstant
    },

    /**
     * @description 校验表单
     */
    formValidate: () => {
      const elFormReff = unref(elFormRef)
      return elFormReff?.validate()
    },

    /**
     * @description 获取表单数据
     * @returns form data
     */
    getFormData: <T = Recordable>(filterEmptyVal = true): T => {
      const form = getForm()
      const model = form?.formModel as any
      if (filterEmptyVal) {
        // 使用reduce过滤空值，并返回一个新对象
        return Object.keys(model).reduce((prev, next) => {
          const value = model[next]
          if (!isEmptyVal(value)) {
            if (isObject(value)) {
              if (Object.keys(value).length > 0) {
                prev[next] = value
              }
            } else {
              prev[next] = value
            }
          }
          return prev
        }, {}) as T
      } else {
        return model as T
      }
    },
    /**
     * @description 登录
     */
    login: async () => {
      const elFormReff = unref(elFormRef)
      const formReff = unref(formRef)
      await elFormReff?.validate(async (isValid) => {
        if (isValid) {
          const formData = formReff?.formModel as UserLoginType
          formData!.uuid = captchaStore.getUuid
          const res = await loginApi(formData)
          // 是否记住我
          if (unref(formData.remember)) {
            userStore.setLoginInfo({
              userCode: formData.userCode,
              password: formData.password,
              remember: true
            })
          } else {
            userStore.setLoginInfo(undefined)
          }
          userStore.setUserInfo(res.data)
          userStore.setRememberMe(unref(formData.remember))
          // 是否使用动态路由
          if (appStore.getDynamicRouter) {
            const resTenancys = await tenancysApi()
            const tenancys = resTenancys.data || []
            permissionStore.setTenancys(tenancys)
            if (tenancys.length > 0) {
              const currentTenancy = permissionStore.getCurrentTenancy
              const tenancy =
                currentTenancy &&
                tenancys.findIndex((e) => e.tenancy_id == currentTenancy.tenancy_id) !== -1
                  ? currentTenancy
                  : tenancys[0]
              const resRouter = await routersApi(tenancy.tenancy_id)
              if (resRouter.code == 200) {
                const routers = resRouter.data || []
                permissionStore.setCurrentTenancy(tenancy)
                userStore.setRoleRouters(routers)
                await permissionStore.generateRoutes('server', routers).catch(() => {})
              }
            }
          } else {
            await permissionStore.generateRoutes('static').catch(() => {})
          }
          permissionStore.getAddRouters.forEach((routes) => {
            router.addRoute(routes as RouteRecordRaw) // 动态添加可访问路由表
          })
          permissionStore.setIsAddRouters(true)
          router.push({
            // @ts-ignore
            path: router.currentRoute.value.query?.redirect || permissionStore.addRouters[0].path
          })
        }
      })
    }
  }

  return {
    formRegister: register,
    formMethods: methods
  }
}
