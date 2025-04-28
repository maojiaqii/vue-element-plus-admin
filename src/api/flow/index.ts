import request from '@/axios'
import { WorkflowDesign, WorkflowProcess } from '@/api/flow/types'

export const flowListApi = () => {
  return request.get({
    url: '/flow/flowList'
  })
}

export const saveWorkflowApi = (data: WorkflowDesign) => {
  return request.post({
    url: '/flow/saveWorkflow',
    data
  })
}

export const publishWorkflowApi = (data: object) => {
  return request.post({
    url: '/flow/publishWorkflow',
    data
  })
}

export const getFlowApi = (params: object) => {
  return request.get({
    url: '/flow/workflowDetail',
    params
  })
}

export const testWorkflowApi = (data: WorkflowProcess) => {
  return request.post({
    url: '/flow/testProcess',
    data
  })
}

export const processHistoryApi = (params: object) => {
  return request.get({
    url: '/flow/processHistory',
    params
  })
}
