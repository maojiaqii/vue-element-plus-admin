import request from '@/axios'

export const getLoginFormApi = () => {
  return request.get({ url: '/mock/form/login' })
}
