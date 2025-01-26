<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { CodeEditor } from '@/components/CodeEditor'
import { useI18n } from '@/hooks/web/useI18n'
import { ref } from 'vue'

const { t } = useI18n()

const defaultData = ref(
  '{\n' +
    '      "itemProps": {\n' +
    '        "prop": "divider16"\n' +
    '      },\n' +
    '      "componentProps": {\n' +
    '        "component": "Divider",\n' +
    '        "title": "编辑器",\n' +
    '        "message": "第三方编辑器组件",\n' +
    '        "collapses": true\n' +
    '      }\n' +
    '    }'
)
</script>

<template>
  <ContentWrap :title="t('richText.jsonEditor')" :message="t('richText.jsonEditorDes')">
    <CodeEditor v-model="defaultData" language="json" height="60vh" />
  </ContentWrap>
</template>
