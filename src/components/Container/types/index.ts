import { TreeOptionProps } from 'element-plus/es/components/tree-v2/src/types'

export interface SideTreeProps {
  alias: string
  nodeKey: string
  data: Recordable<string, any>[]
  props: TreeOptionProps
}
