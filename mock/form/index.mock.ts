import { SUCCESS_CODE } from '@/constants'

const timeout = 1000

export default [
  // 字典接口
  {
    url: '/mock/form/login',
    method: 'get',
    timeout,
    response: () => {
      return {
        code: SUCCESS_CODE,
        data: [{
          field: 'title',
          colProps: {
            span: 24
          },
          formItemProps: {
            slots: {
              default: `<h2 class="text-2xl font-bold text-center w-[100%]">a</h2>`
            }
          }
        }]
      }
    }
  }
]