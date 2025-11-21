import request from '@/axios'

export const getFormPropsApi = (params: Recordable) => {
  return request.get({
    url: '/form/formProps',
    params
  })
}
