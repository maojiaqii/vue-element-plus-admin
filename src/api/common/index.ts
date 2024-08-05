import request from '@/axios'

// 获取验证码
export const getCaptchaApi = (type: string) => {
  return request.get({ url: `/ua/login/captchaImage?type=${type}` })
}

// 获取所有字典
export const getDictApi = () => {
  return request.get({ url: '/mock/dict/list' })
}

// 模拟获取某个字典
export const getDictOneApi = async () => {
  return request.get({ url: '/mock/dict/one' })
}
