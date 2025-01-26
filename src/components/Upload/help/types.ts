import { UploadUserFile, UploadStatus } from 'element-plus'

export interface FileInfo extends Partial<UploadUserFile> {
  status: UploadState
  progressNum?: string
  chunks: number
  skipSend: number[]
  uploadUserCode: string
  uploadUserName: string
  uploadTime: string
  uniqueIdentifier: string
  download: FileDownloadInfo
}

export interface FileDownloadInfo {
  totalCount: number
  downloadedCount: number
  data: any[]
}

export declare type UserFileInfo = Pick<
  FileInfo,
  | 'uid'
  | 'name'
  | 'size'
  | 'status'
  | 'uploadUserCode'
  | 'uploadUserName'
  | 'uploadTime'
  | 'uniqueIdentifier'
>

export declare type UploadState =
  | UploadStatus
  | 'md5'
  | 'waitingupload'
  | 'waitingdownload'
  | 'merging'
  | 'pauseupload'
  | 'pausedownload'
  | 'downloading'
