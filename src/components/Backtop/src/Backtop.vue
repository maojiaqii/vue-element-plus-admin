<script setup lang="ts">
import { ElBacktop } from 'element-plus'
import { useDesign } from '@/hooks/web/useDesign'
import { Icon } from '@/components/Icon'
import { useAiChatStore } from '@/store/modules/aiChat'
import { computed } from 'vue'

const { getPrefixCls, variables } = useDesign()
const aiChatStore = useAiChatStore()

const prefixCls = getPrefixCls('backtop')

const isUseAi = computed(() => {
  return import.meta.env.VITE_USE_AI === 'true'
})

const toggleAiChat = () => {
  aiChatStore.toggleVisible()
}
</script>

<template>
  <div class="fixed-buttons">
    <div class="buttons-container">
      <div v-if="isUseAi" class="ai-chat-button" @click="toggleAiChat">
        <Icon icon="ri:robot-line" :size="20" />
      </div>
      <ElBacktop
        :class="prefixCls"
        :target="`.${variables.namespace}-layout-content-scrollbar .${variables.elNamespace}-scrollbar__wrap`"
        :bottom="96"
      />
    </div>
  </div>
</template>

<style lang="less" scoped>
.fixed-buttons {
  position: fixed;
  bottom: 40px;
  right: 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 999;

  :deep(.el-backtop) {
    position: static;
    transform: none;
    opacity: 1;
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;

    &.is-hidden {
      opacity: 0;
      transform: scale(0.8);
      pointer-events: none;
    }
  }
}

.buttons-container {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 30px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.ai-chat-button {
  width: 40px;
  height: 40px;
  background-color: var(--el-color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition:
    background-color 0.3s,
    transform 0.3s;

  &:hover {
    background-color: var(--el-color-primary-light-3);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
}
</style>
