import * as isUtil from '@/utils/is'
import { getDictDataApi, getJsInfoApi } from '@/api/common'
import createDialog from '@/hooks/web/useDialog'
import createDrawer from '@/hooks/web/useDrawer'
import request from '@/axios'
import SparkMD5 from 'spark-md5'
import * as treeUtil from '@/utils/tree'
import {
  ElMessage,
  ElMessageBox,
  ElNotification,
  MessageProps,
  NotificationProps
} from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { useI18n } from '@/hooks/web/useI18n'
import { FuncTypes } from '../../types/global'

const userStore = useUserStore()
const { t } = useI18n()

declare interface JsTypes {
  js: string
  params?: Recordable
}

const message = (msgProp: MessageProps) => {
  ElMessage.closeAll()
  setTimeout(() => {
    ElMessage(msgProp)
  }, 100)
}

const notification = (msgProp: NotificationProps) => {
  ElNotification.closeAll()
  setTimeout(() => {
    ElNotification(msgProp)
  }, 100)
}

const initTreeComponentData = (dictCode: string): Promise<Array<Recordable>> => {
  return new Promise((resolve) => {
    getDictDataApi({ dictCode: dictCode })
      .then((res) => {
        if (res.code == 200) {
          const dict = res.data
          resolve(
            treeUtil.listToTree(dict.data, {
              id: dict.dictValue,
              pid: dict.dictPid
            })
          )
        } else {
          ElMessage({ type: 'error', message: '获取数据失败！' })
          resolve([])
        }
      })
      .catch(() => {
        resolve([])
      })
  })
}

export const newFunction = (click: any, binds?: Recordable): Promise<FuncTypes> => {
  return new Promise((resolve) => {
    if (isUtil.isObject(click)) {
      const clickObj = click as JsTypes
      getJsInfoApi({ code: clickObj.js }).then((res) => {
        if (res.code === 200) {
          resolve({
            func: new Function('return ' + res.data?.js).bind({
              ...binds,
              createDialog: createDialog,
              createDrawer: createDrawer,
              message: message,
              notification: notification,
              messageBox: ElMessageBox,
              userStore: userStore,
              request: request,
              isUtil: isUtil,
              treeUtil: treeUtil,
              t: t,
              sparkMD5: new SparkMD5(),
              initTreeComponentData: initTreeComponentData
            })(),
            params: clickObj.params || {}
          })
        } else {
          ElMessage({ type: 'error', message: res.msg })
          resolve({ func: new Function() })
        }
      })
    } else if (isUtil.isString(click)) {
      resolve({
        func: new Function('return ' + click).bind({
          ...binds,
          createDialog: createDialog,
          createDrawer: createDrawer,
          message: message,
          notification: notification,
          userStore: userStore,
          request: request,
          isUtil: isUtil,
          treeUtil: treeUtil,
          t: t,
          sparkMD5: new SparkMD5(),
          initTreeComponentData: initTreeComponentData
        })()
      })
    } else if (isUtil.isFunction(click)) {
      const clickF = click as Function
      resolve({
        func: clickF.bind({
          ...binds,
          createDialog: createDialog,
          createDrawer: createDrawer,
          message: message,
          notification: notification,
          userStore: userStore,
          request: request,
          isUtil: isUtil,
          treeUtil: treeUtil,
          t: t,
          sparkMD5: new SparkMD5(),
          initTreeComponentData: initTreeComponentData
        })
      })
    }
  })
}
