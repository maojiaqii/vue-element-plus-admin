import request from '@/axios'
import type { UserType, UserLoginType } from './types'
import { Tenancy } from '@/../types/global'

interface RoleParams {
  roleName: string
}

export const loginApi = (data: UserLoginType): Promise<IResponse<UserType>> => {
  return request.post({ url: '/ua/login/userLogin', data })
}

export const tenancysApi = (): Promise<IResponse<Tenancy[]>> => {
  return request.get({ url: '/perms/myTenancys' })
}

export const routersApi = (
  currentTenancy: string
): Promise<IResponse<AppCustomRouteRecordRaw[]>> => {
  return request.get({ url: '/perms/myPermissions', params: { currentTenancy: currentTenancy } })
}

export const loginOutApi = (): Promise<IResponse> => {
  return request.get({ url: '/logout' })
}

export const getUserListApi = ({ params }: AxiosConfig) => {
  return request.get<{
    code: string
    data: {
      list: UserType[]
      total: number
    }
  }>({ url: '/mock/user/list', params })
}

export const getAdminRoleApi = (
  params: RoleParams
): Promise<IResponse<AppCustomRouteRecordRaw[]>> => {
  return request.get({ url: '/mock/role/list', params })
}

export const getTestRoleApi = (params: RoleParams): Promise<IResponse<string[]>> => {
  return request.get({ url: '/mock/role/list2', params })
}
