import type { Form, FormExpose } from '@/components/Form'
import type { ElForm } from 'element-plus'
import { ref, unref, nextTick } from 'vue'
import router from '@/router/index'
import type { RouteRecordRaw, Router } from 'vue-router'
import { isEmptyVal, isObject } from '@/utils/is'
import { useUserStore } from '@/store/modules/user'
import { useAppStore } from '@/store/modules/app'
import { usePermissionStore } from '@/store/modules/permission'
import { useCaptchaStore } from '@/store/modules/captcha'
import { loginApi, routersApi } from '@/api/login'
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

  const getForm = async () => {
    await nextTick()
    const form = unref(formRef)
    if (!form) {
      console.error('The form is not registered. Please use the register method to register')
    }
    return form
  }

  // 一些内置的方法
  const methods = {
    /**
     * @description 获取表单数据
     * @returns form data
     */
    getFormData: async <T = Recordable>(filterEmptyVal = true): Promise<T> => {
      const form = await getForm()
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
            const resRouter = await routersApi()
            const routers = resRouter.data || []
            userStore.setRoleRouters(routers)
            await permissionStore.generateRoutes('server', routers).catch(() => {})
          } else {
            await permissionStore.generateRoutes('static').catch(() => {})
          }
          permissionStore.getAddRouters.forEach((routes) => {
            router.addRoute(routes as RouteRecordRaw) // 动态添加可访问路由表
          })
          permissionStore.setIsAddRouters(true)
          router.push({
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
