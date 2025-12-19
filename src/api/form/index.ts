import request from '@/axios'

export const getFormPropsApi = (params: Recordable) => {
  return request.get({
    url: '/form/formProps',
    params
  })
}

export const saveFormPropsApi = (data: Recordable) => {
  return request.post({
    url: '/form/save',
    data
  })
}

export const deleteFormPropsApi = (data: Recordable) => {
  return request.post({
    url: '/form/delete',
    data
  })
}
