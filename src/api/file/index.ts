import { Chunk } from '@/api/file/types'
import request from '@/axios'

export const uploadCheckApi = (params: Chunk) => {
  return request.get({
    url: '/file/uploader',
    params
  })
}

export const uploadApi = (data: Chunk) => {
  return request.post({
    url: '/file/uploader',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 文件合并
export const mergeApi = (params: object) => {
  return request.get({ url: '/file/merge', params })
}

export const getFileInfoApi = (params: object) => {
  return request.get({
    url: '/file/getInfo',
    params
  })
}

export const downLoadFileApi = (params: object) => {
  return request.get({
    url: '/file/downLoad',
    params,
    responseType: 'blob'
  })
}

export const downLoadCountApi = (params: object) => {
  return request.get({
    url: '/file/downLoadCount',
    params
  })
}
