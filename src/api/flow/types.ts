export type WorkflowDesign = {
  flowId?: string
  flowCode: string
  flowName: string
  flowVersion?: number
  isNew: boolean
  status: number
  remark?: string
  nodes?: Recordable[]
}

export type WorkflowProcess = {
  flowCode?: string
  processInstanceId?: string
  taskId?: number
  businessKey?: string
  formData?: Recordable
}
