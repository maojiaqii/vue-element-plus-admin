import request from '@/axios'
import { Dict, UiInfo } from '@/api/common/types'
import { TableSearch } from '@/api/table/types'

// 获取验证码
export const getCaptchaApi = (type: string) => {
  return request.get({ url: `/ua/login/captchaImage?type=${type}` })
}

export const getDictDataApi = (data: Dict) => {
  return request.post({
    url: '/data/dictData',
    data
  })
}

export const getTableDataApi = (data: TableSearch) => {
  return request.post({
    url: '/data/tableData',
    data
  })
}

export const getFormInfoApi = (params: UiInfo) => {
  return request.get({
    url: '/ui/formInfo',
    params
  })
}

export const getTableInfoApi = (params: UiInfo) => {
  return request.get({
    url: '/ui/tableInfo',
    params
  })
}

export const getJsInfoApi = (params: UiInfo) => {
  return request.get({
    url: '/ui/jsInfo',
    params
  })
}
