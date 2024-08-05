import { AxiosResponse, InternalAxiosRequestConfig } from './types'
import { ElMessage } from 'element-plus'
import qs from 'qs'
import bcrypt from 'bcryptjs'
import { SUCCESS_CODE, TRANSFORM_REQUEST_DATA } from '@/constants'
import { useUserStore, useUserStoreWithOut } from '@/store/modules/user'
import { enCodePwd, objToFormData } from '@/utils'

const defaultRequestInterceptors = (config: InternalAxiosRequestConfig) => {
  const useUser = useUserStore()
  // 2. 带上token
  useUser.getToken && (config.headers[useUser.getTokenKey] = useUser.getToken)
  enCodePwd(config.data)
  if (
    config.method === 'post' &&
    config.headers['Content-Type'] === 'application/x-www-form-urlencoded'
  ) {
    config.data = qs.stringify(config.data)
  } else if (
    TRANSFORM_REQUEST_DATA &&
    config.method === 'post' &&
    config.headers['Content-Type'] === 'multipart/form-data'
  ) {
    config.data = objToFormData(config.data)
  } else if (
    TRANSFORM_REQUEST_DATA &&
    config.method === 'post' &&
    config.headers['Content-Type'] === 'application/json'
  ) {
    config.data = JSON.stringify(config.data)
    // 后端做了防篡改，添加sign
    config.headers['sign'] = bcrypt.hashSync(config.headers['timestamp'] + config.data)
  }
  if (config.method === 'get' && config.params) {
    config.paramsSerializer = (params) => qs.stringify(params)
  }
  return config
}

const defaultResponseInterceptors = (response: AxiosResponse) => {
  const useUser = useUserStore()
  const token = response.headers[useUser.getTokenKey] || response.data.token
  if (token) {
    useUser.setToken(token)
  }
  if (response?.config?.responseType === 'blob') {
    // 如果是文件流，直接过
    return response
  } else if (response.data.code === SUCCESS_CODE) {
    return response.data
  } else {
    ElMessage.error({
      dangerouslyUseHTMLString: true,
      message: `<p><b>${response?.data?.code}</b></p><p style="margin-top: 0.2rem; color: black">${response?.data?.msg}</p>`
    })
    if (response?.data?.code === 401) {
      const userStore = useUserStoreWithOut()
      userStore.logout()
    }
    return response.data
  }
}

export { defaultResponseInterceptors, defaultRequestInterceptors }
