<script setup lang="ts">
import { ref, watch, onMounted, PropType, reactive, nextTick, computed, unref } from 'vue'
import { ElUpload, ElTable, ElTableColumn, ElMessage, ElTag, ElPopconfirm } from 'element-plus'
import { propTypes } from '@/utils/propTypes'
import { useI18n } from '@/hooks/web/useI18n'
import { useConfigGlobal } from '@/hooks/web/useConfigGlobal'
import { useDesign } from '@/hooks/web/useDesign'
import { useUserStore } from '@/store/modules/user'
import { generateMD5 } from '@/components/Upload/help/md5'
import { mergeApi, uploadCheckApi, uploadApi, downLoadCountApi, downLoadFileApi } from '@/api/file'
import { isArray } from '@/utils/is'
import { formatToDateTime } from '@/utils/dateUtil'
import { FileInfo, UserFileInfo } from '@/components/Upload/help/types'
import { Icon } from '@/components/Icon'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('uploader')

const props = defineProps({
  modelValue: {
    type: Array as PropType<UserFileInfo[]>,
    default: () => []
  },
  /**
   * @description 分片大小2M/片
   */
  chunkSize: propTypes.number.def(2 * 1024 * 1024),
  /**
   * @description 最大自动失败重试上传次数
   */
  maxChunkRetries: propTypes.number.def(3),
  /**
   * @description 远程上传接口地址
   */
  action: propTypes.string.def('/api/file/uploader'),
  /**
   * @description 最大上传文件数量
   */
  limit: propTypes.number.def(Number.POSITIVE_INFINITY),
  /**
   * @description 同时上传文件数量
   */
  maxUpload: propTypes.number.def(3),
  disabled: propTypes.bool.def(false),
  /**
   * @description 只展示登录人自己上传的文件
   */
  showSelf: propTypes.bool.def(false)
})

const { configGlobal } = useConfigGlobal()
const useUser = useUserStore()
const { t } = useI18n()

const emits = defineEmits(['update:modelValue', 'change', 'fileAdded', 'fileComplete', 'fileError'])
const waitingQueue = reactive<any>([])
let threadCount = ref(0)
// 输入框的值
const valueRef = ref(props.modelValue)
const fileTableRef = ref()
const fileTable = ref(true)
const hoverTimeout = ref()
const hoverRow = ref()
const hoverRect = ref()
const isModalHovered = ref(false)

const tableValueRef = computed(() => {
  if (props.showSelf) {
    return valueRef.value.filter((_) => _.uploadUserCode == useUser.getUserInfo!.userCode)
  } else {
    return valueRef.value
  }
})

function onUploadChange(uploadFile: FileInfo) {
  if (uploadFile.status == 'ready') {
    uploadFile.uploadUserName = useUser.getUserInfo!.username
    uploadFile.uploadUserCode = useUser.getUserInfo!.userCode
    uploadFile.uploadTime = formatToDateTime()
    // 文件状态设为"计算MD5"
    uploadFile.status = 'md5'
    generateMD5(uploadFile, props.chunkSize, {
      onProgress(currentChunk: number, chunks: number) {
        // 实时展示MD5的计算进度
        fileTable.value = false
        uploadFile.progressNum = ((currentChunk / chunks) * 100).toFixed(2)
        nextTick(() => (fileTable.value = true))
      },
      async onSuccess(md5: string, chunks: number) {
        if (valueRef.value.find((e) => e.uniqueIdentifier == md5 && e.status != 'md5')) {
          const index = valueRef.value.findIndex((e) => e.uid == uploadFile.uid)
          if (index !== -1) {
            valueRef.value.splice(index, 1)
          }
          ElMessage.error(t('upload.fileExists', { fileName: uploadFile.name }))
        } else {
          uploadFile.status = 'waitingupload'
          uploadFile.uniqueIdentifier = md5
          uploadFile.chunks = chunks
          const res = await uploadCheckApi({
            chunkNumber: 1,
            chunkSize: props.chunkSize,
            currentChunkSize: props.chunkSize,
            totalSize: uploadFile.size!,
            identifier: md5,
            filename: uploadFile.name!,
            relativePath: uploadFile.name,
            totalChunks: chunks
          })
          if (res.code == 200) {
            if (res.data && isArray(res.data) && res.data.length < chunks) {
              uploadFile.skipSend = res.data
              waitingQueue.push(uploadFile)
            } else {
              fileTable.value = false
              uploadFile.status = 'success'
              await nextTick(() => (fileTable.value = true))
            }
            emits('fileAdded', uploadFile)
          } else {
            ElMessage.error(res.msg)
            emits('fileError', uploadFile)
            uploadFile.status = 'fail'
          }
        }
      },
      onError() {
        ElMessage.error(t('upload.readFileError', { fileName: uploadFile.name }))
        emits('fileError', uploadFile)
        uploadFile.status = 'fail'
      }
    })
  }
}

function onUploadExceed() {
  ElMessage.error(t('upload.limitError', { limit: props.limit }))
}

async function startThread() {
  threadCount.value++

  async function uploading(uploadFile: FileInfo) {
    for (let i = 0; i < uploadFile.chunks; i++) {
      if (uploadFile.status !== 'waitingupload' && uploadFile.status !== 'uploading') {
        return
      }
      if (uploadFile.skipSend.includes(i)) {
        continue
      }
      let start = i * props.chunkSize
      let end =
        start + props.chunkSize >= uploadFile.size! ? uploadFile.size! : start + props.chunkSize
      const chunkFile = uploadFile.raw?.slice(start, end)
      let res = await uploadApi({
        chunkNumber: i,
        chunkSize: props.chunkSize,
        currentChunkSize: chunkFile?.size,
        totalSize: uploadFile.size!,
        identifier: uploadFile.uniqueIdentifier,
        filename: uploadFile.name!,
        relativePath: uploadFile.name,
        totalChunks: uploadFile.chunks,
        file: chunkFile
      })
      if (res.code != 200) {
        for (let z = 0; z < props.maxChunkRetries; z++) {
          res = await uploadApi({
            chunkNumber: i,
            chunkSize: props.chunkSize,
            currentChunkSize: chunkFile?.size,
            totalSize: uploadFile.size!,
            identifier: uploadFile.uniqueIdentifier,
            filename: uploadFile.name!,
            relativePath: uploadFile.name,
            totalChunks: uploadFile.chunks,
            file: chunkFile
          })
          if (res.code == 200) {
            break
          }
        }
        if (res.code != 200) {
          uploadFile.status = 'fail'
          ElMessage.error(t('upload.uploadFail', { fileName: uploadFile.name }))
          emits('fileError', uploadFile)
          return
        }
      }
      uploadFile.skipSend.push(i)
      uploadFile.progressNum = ((uploadFile.skipSend.length / uploadFile.chunks) * 100).toFixed(2)
    }
    if (uploadFile.skipSend.length == uploadFile.chunks) {
      uploadFile.status = 'merging'
      const res = await mergeApi({
        identifier: uploadFile.uniqueIdentifier
      })
      if (res.code === 200) {
        uploadFile.status = 'success'
        ElMessage.success(t('upload.uploadSuccess', { fileName: uploadFile.name }))
        emits('fileComplete', uploadFile)
      } else {
        uploadFile.status = 'fail'
        ElMessage.error(t('upload.uploadFail', { fileName: uploadFile.name }))
        emits('fileError', uploadFile)
      }
    }
  }

  function doDownLoad(uploadFile: FileInfo) {
    if (uploadFile.status !== 'waitingdownload' && uploadFile.status !== 'downloading') {
      return
    }
    let downNo = unref(uploadFile.download.downloadedCount)
    downLoadFileApi({
      fileIdentifier: uploadFile.uniqueIdentifier,
      no: downNo
    })
      .then((res) => {
        if (res.data?.size > 0) {
          uploadFile.download.data[downNo] = res.data
          uploadFile.download.downloadedCount = downNo + 1
          uploadFile.progressNum = (
            (uploadFile.download.downloadedCount / uploadFile.download.totalCount) *
            100
          ).toFixed(2)
        }
        if (uploadFile.download.downloadedCount !== uploadFile.download.totalCount) {
          doDownLoad(uploadFile)
        } else {
          const blob = new Blob(uploadFile.download.data)
          // 对于<a>标签，只有 Firefox 和 Chrome（内核） 支持 download 属性
          // IE10以上支持blob但是依然不支持download
          if ('download' in document.createElement('a')) {
            // 支持a标签download的浏览器
            const link = document.createElement('a') // 创建a标签
            link.download = uploadFile.name! // a标签添加属性
            link.style.display = 'none'
            link.href = URL.createObjectURL(blob)
            document.body.appendChild(link)
            link.click() // 执行下载
            URL.revokeObjectURL(link.href) // 释放url
            document.body.removeChild(link) // 释放标签
          } else {
            // 其他浏览器
            navigator.msSaveBlob(blob, uploadFile.name)
          }
          uploadFile.status = 'success'
        }
      })
      .catch(() => {
        ElMessage.error(t('upload.downloadFail', { fileName: uploadFile.name }))
      })
  }

  while (waitingQueue.length > 0) {
    const uploadFile = waitingQueue.shift() // 动态取任务
    if (uploadFile) {
      // 上传
      if (uploadFile.status == 'waitingupload' || uploadFile.status == 'uploading') {
        uploadFile.status = 'uploading'
        await uploading(uploadFile)
      }
      if (uploadFile.status == 'waitingdownload' || uploadFile.status == 'downloading') {
        uploadFile.status = 'downloading'
        if (!uploadFile.download) {
          uploadFile.download = {
            totalCount: null,
            downloadedCount: 0,
            data: []
          }
        }
        // 还没开始下载
        if (!uploadFile.download.totalCount) {
          const res = await downLoadCountApi({ fileIdentifier: hoverRow.value.uniqueIdentifier })
          if (res.code == 200) {
            uploadFile.download.totalCount = res.data
          } else {
            uploadFile.download.totalCount = 0
            uploadFile.status = 'downloadFail'
            ElMessage.error(t('upload.downloadFail', { fileName: uploadFile.name }))
          }
        }
        if (uploadFile.download.downloadedCount !== uploadFile.download.totalCount) {
          doDownLoad(uploadFile)
        }
      }
    }
  }
  threadCount.value--
}

function formatSize(size: number) {
  if (size < 1024) return `${size.toFixed(0)} B`
  else if (size < 1024 * 1024) return `${(size / 1024.0).toFixed(2)} KB`
  else if (size < 1024 * 1024 * 1024) return `${(size / 1024.0 / 1024.0).toFixed(2)} MB`
  else return `${(size / 1024.0 / 1024.0 / 1024.0).toFixed(2)} GB`
}

function rowStyle(row: any) {
  if (row.row.progressNum && row.row.progressNum != '100.00') {
    // 动态为每行设置背景样式
    const progress = row.row.progressNum
    if (row.row.status == 'md5') {
      return {
        position: 'relative',
        background: `linear-gradient(to right, #e6a23c ${progress}%, #fff ${progress}%)`
      }
    }
    return {
      position: 'relative',
      background: `linear-gradient(to right, #67c23a ${progress}%, #fff ${progress}%)`
    }
  }
  return ''
}

function handleMouseEnter(row: any, column: any, cell: HTMLTableCellElement, event: Event) {
  clearTimeout(hoverTimeout.value)
  hoverTimeout.value = setTimeout(() => {
    hoverRow.value = row
    hoverRect.value = event.target!.getBoundingClientRect()
  }, 250)
}

function handleMouseLeave() {
  clearTimeout(hoverTimeout.value)
  hoverTimeout.value = setTimeout(() => {
    if (!isModalHovered.value && !document.querySelector('.el-popconfirm')) {
      hoverRow.value = null
      hoverRect.value = null
    }
  }, 250)
}

function handleModalEnter() {
  isModalHovered.value = true // 标记悬停在模态框
}

function handleModalLeave() {
  isModalHovered.value = false // 取消悬停标记
  handleMouseLeave() // 调用隐藏逻辑
}

function pauseAct() {
  hoverRow.value.status = 'pause' + hoverRow.value.status.replace('ing', '')
}

function startAct() {
  hoverRow.value.status = hoverRow.value.status.replace('pause', 'waiting')
  waitingQueue.push(hoverRow.value)
}

function deleteAct() {
  const index = valueRef.value.findIndex(
    (e) => e.uniqueIdentifier == hoverRow.value.uniqueIdentifier
  )
  if (index !== -1) {
    valueRef.value.splice(index, 1)
  }
  const index1 = waitingQueue.findIndex(
    (e) => e.uniqueIdentifier == hoverRow.value.uniqueIdentifier
  )
  if (index1 !== -1) {
    waitingQueue.splice(index1, 1)
  }
  hoverRow.value = null
}

async function downloadAct() {
  hoverRow.value.status = 'waitingdownload'
  const index1 = waitingQueue.findIndex(
    (e) => e.uniqueIdentifier == hoverRow.value.uniqueIdentifier
  )
  if (index1 === -1) {
    waitingQueue.push(hoverRow.value)
  }
}

function previewAct() {
  ElMessage.warning(t('common.withoutFunction'))
}

const modalStyle = computed(() => {
  if (!hoverRect.value) return {}
  const { top, height } = hoverRect.value
  return {
    position: 'absolute',
    top: `${top - fileTableRef.value?.$el.getBoundingClientRect().top}px`,
    right: '0',
    width: '100%',
    height: `${height}px`,
    backgroundColor: '#cccccc52',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    zIndex: 10,
    transition: 'opacity 0.3s ease',
    opacity: hoverRow.value ? 1 : 0 // 控制透明度
  }
})

// 监听
watch(
  () => valueRef.value,
  (val: Array<any>) => {
    const pickedData: UserFileInfo[] = val.map(
      ({ name, size, status, uploadUserCode, uploadUserName, uploadTime, uniqueIdentifier }) => ({
        name,
        size,
        status,
        uploadUserCode,
        uploadUserName,
        uploadTime,
        uniqueIdentifier
      })
    )
    emits('update:modelValue', pickedData)
  },
  { deep: true, immediate: true }
)

watch(
  () => waitingQueue,
  () => {
    if (threadCount.value < props.maxUpload) {
      Array.from({ length: props.maxUpload - threadCount.value }, () => startThread())
    }
  },
  { deep: true, immediate: true }
)

onMounted(() => {})
</script>

<template>
  <div :class="`${prefixCls}__upload_container`">
    <el-table
      ref="fileTableRef"
      v-if="fileTable"
      :data="tableValueRef"
      border
      stripe
      style="width: 100%; position: relative"
      height="250"
      max-height="250"
      :row-style="rowStyle"
      :class="`${prefixCls}__upload_table`"
      @cell-mouse-enter="handleMouseEnter"
      @cell-mouse-leave="handleMouseLeave"
    >
      <el-table-column prop="name" :label="t('upload.fileName')" show-overflow-tooltip />
      <el-table-column prop="size" :label="t('upload.fileSize')" width="150">
        <template #default="scope">
          {{ formatSize(scope.row.size) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="t('upload.fileStatus')" width="150">
        <template #default="scope">
          <el-tag
            :type="
              scope.row.status === 'success'
                ? 'success'
                : scope.row.status === 'fail'
                  ? 'danger'
                  : scope.row.status === 'waitingupload' || scope.row.status === 'pause'
                    ? 'warning'
                    : scope.row.status === 'md5' ||
                        scope.row.status === 'merging' ||
                        scope.row.status === 'uploading'
                      ? 'primary'
                      : 'info'
            "
            disable-transitions
            >{{
              `${t(`upload.${scope.row.status}`)}${scope.row.progressNum && scope.row.progressNum != '100.00' ? ' ' + scope.row.progressNum + '%' : ''}`
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="uploadUserName" :label="t('upload.uploadUser')" width="150" />
      <el-table-column prop="uploadTime" :label="t('upload.uploadTime')" width="200" />
    </el-table>
    <!-- 模态操作按钮 -->
    <div
      v-if="hoverRow"
      @mouseenter="handleModalEnter"
      @mouseleave="handleModalLeave"
      :style="modalStyle"
    >
      <base-button
        v-if="
          (hoverRow.status == 'pauseupload' || hoverRow.status == 'pausedownload') &&
          !props.disabled
        "
        type="primary"
        @click="startAct"
        >开始</base-button
      >
      <base-button
        v-if="
          (hoverRow.status == 'uploading' || hoverRow.status == 'downloading') && !props.disabled
        "
        type="primary"
        @click="pauseAct"
        >暂停</base-button
      >
      <ElPopconfirm title="确定删除?" @confirm="deleteAct">
        <template #reference>
          <base-button v-if="hoverRow.status != 'md5' && !props.disabled" type="primary"
            >删除</base-button
          >
        </template>
      </ElPopconfirm>
      <base-button
        v-if="hoverRow.status == 'success' || hoverRow.status == 'downloadFail'"
        type="primary"
        @click="downloadAct"
        >下载</base-button
      >
      <base-button
        v-if="hoverRow.status == 'success' || hoverRow.status == 'downloadFail'"
        type="primary"
        @click="previewAct"
        >查看</base-button
      >
    </div>
    <el-upload
      v-if="!props.disabled"
      v-model:file-list="valueRef"
      v-bind="$attrs"
      :show-file-list="false"
      :drag="false"
      :auto-upload="false"
      :limit="props.limit"
      :class="[prefixCls, `${prefixCls}--${configGlobal?.size}`]"
      :on-change="onUploadChange"
      :on-exceed="onUploadExceed"
    >
      <base-button type="primary" circle :class="`${prefixCls}__upload_btn`">
        <Icon icon="ep:plus" />
      </base-button>
    </el-upload>
  </div>
</template>

<style lang="less" scoped>
@prefix-cls: ~'@{namespace}-uploader';

.@{prefix-cls} {
  &__upload_table {
    :deep(tbody tr) {
      transition: background-color 0.3s ease; /* 平滑过渡 */
    }
  }

  &__upload_container {
    position: relative;
    width: 100%;
    height: 250px;
  }

  &__operation-modal {
    transition: opacity 0.3s ease;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    padding: 10px;
  }

  &__operation-modal el-button {
    margin: 0 5px;
  }

  &__upload_btn {
    position: absolute;
    right: 10px;
    bottom: 10px;
    z-index: 5;
  }

  &__image {
    height: var(--el-component-size);
    border-radius: var(--el-border-radius-base);
    border: none;
    cursor: pointer;
    vertical-align: middle;
  }

  &--mini > &__image {
    border-radius: var(--el-border-radius-small);
  }
}
</style>
