import router from '@/router'

export const hasPermi = (value: string) => {
  const permission = (router.currentRoute.value.meta.permission || []) as string[]
  return !value || permission.includes(value)
}
