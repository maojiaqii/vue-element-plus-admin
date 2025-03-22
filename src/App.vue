<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { useAppStore } from '@/store/modules/app'
import { ConfigGlobal } from '@/components/ConfigGlobal'
import { useDesign } from '@/hooks/web/useDesign'
import { loginOutApi } from '@/api/login'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('app')

const appStore = useAppStore()

const currentSize = computed(() => appStore.getCurrentSize)

const greyMode = computed(() => appStore.getGreyMode)

const userStore = useUserStore()

const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  e.preventDefault()
  const confirmText = '确定要退出系统吗？'
  e.returnValue = confirmText

  // 由于浏览器安全策略的限制，现代浏览器中 beforeunload 事件中的 confirm 对话框会被浏览器自己的确认框替代
  // 如果用户点击了确认，才执行登出操作
  if (confirm(confirmText)) {
    loginOutApi()
    userStore.reset()
  }
  return confirmText
}

onMounted(() => {
  appStore.initTheme()
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<template>
  <ConfigGlobal :size="currentSize">
    <RouterView :class="greyMode ? `${prefixCls}-grey-mode` : ''" />
  </ConfigGlobal>
</template>

<style lang="less">
@prefix-cls: ~'@{namespace}-app';

.size {
  width: 100%;
  height: 100%;
}

html,
body {
  padding: 0 !important;
  margin: 0;
  overflow: hidden;
  .size;

  #app {
    .size;
  }
}

.@{prefix-cls}-grey-mode {
  filter: grayscale(100%);
}
</style>
