import { defineStore } from 'pinia'
import { store } from '@/store'

interface captchaInfo {
  uuid: string | undefined
  captcha: string | undefined
}

export const useCaptchaStore = defineStore('captcha', {
  state: (): captchaInfo => {
    return {
      uuid: undefined,
      captcha: undefined
    }
  },
  getters: {
    getUuid(): string | undefined {
      return this.uuid
    },
    getCaptcha(): string | undefined {
      return this.captcha
    }
  },
  actions: {
    setUuid(uuid: string | undefined): void {
      this.uuid = uuid
    },
    setCaptcha(captcha: string | undefined): void {
      this.captcha = captcha
    }
  },
  persist: true
})

export const useCaptchaStoreWithOut = () => {
  return useCaptchaStore(store)
}
