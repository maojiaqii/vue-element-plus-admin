import SparkMD5 from 'spark-md5'
import { FileInfo } from '@/components/Upload/help/types'

/**
 * 分段计算MD5
 * @param file {File}
 * @param chunkSize
 * @param options {Object} - onProgress | onSuccess | onError
 */
export function generateMD5(file: FileInfo, chunkSize: number, options = {}) {
  const fileReader = new FileReader()
  const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
  const fileSize = file.size!
  const fileRaw = file.raw
  const chunks = Math.ceil(fileSize / chunkSize)
  let currentChunk = 0
  const spark = new SparkMD5.ArrayBuffer()
  fileReader.readAsArrayBuffer(blobSlice.call(fileRaw, 0, chunkSize))
  const loadNext = () => {
    const start = currentChunk * chunkSize
    const end = start + chunkSize >= fileSize ? file.size : start + chunkSize
    fileReader.readAsArrayBuffer(blobSlice.call(fileRaw, start, end))
  }
  fileReader.onload = (e) => {
    const f = e.target.result as ArrayBuffer
    spark.append(f)
    if (currentChunk < chunks) {
      currentChunk++
      loadNext()
      if (options.onProgress) options.onProgress(currentChunk, chunks)
    } else {
      const md5 = spark.end()
      // md5计算完毕
      if (options.onSuccess) options.onSuccess(md5, chunks)
    }
  }
  fileReader.onerror = function () {
    if (options.onError) options.onError()
  }
}
