export interface UserLoginType {
  uuid?: string | undefined
  userCode: string
  password: string
  captchaCode?: string
  remember: boolean
}

export interface UserType {
  uuid?: string | undefined
  userCode: string
  username: string
  password: string
  captchaCode?: string
  role: string
  roleId: string
}
