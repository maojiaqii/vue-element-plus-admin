import { defineStore } from 'pinia'
import { store } from '@/store'

interface WorkFlowState {
  tableId: string
  isTried: boolean
  promoterDrawer: boolean
  flowPermission1: Recordable
  approverDrawer: boolean
  approverConfig1: Recordable
  copyerDrawer: boolean
  copyerConfig1: Recordable
  conditionDrawer: boolean
  conditionsConfig1: Recordable
}

export const useWorkFlowStore = defineStore('workFlow', {
  state: (): WorkFlowState => {
    return {
      tableId: '',
      isTried: false,
      promoterDrawer: false,
      flowPermission1: {},
      approverDrawer: false,
      approverConfig1: {},
      copyerDrawer: false,
      copyerConfig1: {},
      conditionDrawer: false,
      conditionsConfig1: {
        conditionNodes: []
      }
    }
  },
  actions: {
    setTableId(payload: string) {
      this.tableId = payload
    },
    setIsTried(payload: boolean) {
      this.isTried = payload
    },
    setPromoter(payload: boolean) {
      this.promoterDrawer = payload
    },
    setFlowPermission(payload: Recordable) {
      this.flowPermission1 = payload
    },
    setApprover(payload: boolean) {
      this.approverDrawer = payload
    },
    setApproverConfig(payload: Recordable) {
      this.approverConfig1 = payload
    },
    setCopyer(payload: boolean) {
      this.copyerDrawer = payload
    },
    setCopyerConfig(payload: Recordable) {
      this.copyerConfig1 = payload
    },
    setCondition(payload: boolean) {
      this.conditionDrawer = payload
    },
    setConditionsConfig(payload: Recordable) {
      this.conditionsConfig1 = payload
    }
  },
  persist: true
})

export const useWorkFlowStoreWithOut = () => {
  return useWorkFlowStore(store)
}
