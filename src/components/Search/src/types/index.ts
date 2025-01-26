import { FormProps } from '@/components/Form'

export interface SearchProps {
  schema?: FormProps
  model?: Recordable
  on?: {
    register?: (...args: any[]) => void
    search?: (...args: any[]) => void
    reset?: (...args: any[]) => void
    expand?: (...args: any[]) => void
  }
}
