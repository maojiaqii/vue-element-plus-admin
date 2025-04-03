import router from '@/router'

export const hasButtonPermi = (value: string | undefined) => {
  const permission = (router.currentRoute.value.meta.permission?.buttons || []) as string[]
  return !value || permission.includes(value) || permission.includes('*')
}

export const hasColumnPermi = (value: string | undefined) => {
  const permission = (router.currentRoute.value.meta.permission?.columns || []) as string[]
  return !value || permission.includes(value) || permission.includes('*')
}

export const hasFieldPermi = (value: string | undefined) => {
  const permission = (router.currentRoute.value.meta.permission?.fields || []) as string[]
  return !value || permission.includes(value) || permission.includes('*')
}
