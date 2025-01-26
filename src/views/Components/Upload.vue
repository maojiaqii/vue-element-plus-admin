<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Upload } from '@/components/Upload'
import { ref } from 'vue'
import { UserFileInfo } from '@/components/Upload/help/types'

const { t } = useI18n()

const files = ref<UserFileInfo[]>([
  {
    name: 'uTools-5.2.0 (1) (1) (1).exe',
    status: 'success',
    size: 68309368,
    uploadUserCode: 'admin',
    uploadUserName: '系统管理员',
    uploadTime: '2024-11-22 15:12:27',
    uniqueIdentifier: '5b34d8dd3b8d5a7869bb78ccf0226032'
  },
  {
    name: 'a1.exe',
    status: 'success',
    size: 68309368,
    uploadUserCode: 'admin1',
    uploadUserName: '系统管理员1',
    uploadTime: '2024-11-22 15:12:27',
    uniqueIdentifier: '5b34d8dd3b8d5a7869bb78ccf0226032'
  }
])
</script>

<template>
  <ContentWrap :title="t('router.uploader')">
    <Upload v-model="files" disabled show-self />
  </ContentWrap>
</template>
