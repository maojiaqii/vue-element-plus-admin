<script setup lang="ts">
import { ref, computed, nextTick, unref } from 'vue'
import { ElButton, ElInput, ElScrollbar, ElAvatar, ElMessage, ElPopconfirm } from 'element-plus'
import { useI18n } from '@/hooks/web/useI18n'
import { Icon } from '@/components/Icon'
import { useAiChatStore } from '@/store/modules/aiChat'
import { useClipboard } from '@/hooks/web/useClipboard'
import { toAnyString } from '@/utils'
import { Infotip } from '@/components/Infotip'
import { marked } from 'marked'

const { t } = useI18n()
const aiChatStore = useAiChatStore()

const { copy, isSupported } = useClipboard()

// 输入框内容
const inputMessage = ref('')
// 消息容器引用
const messagesContainer = ref<HTMLElement | null>(null)

// 计算对话框样式
const dialogStyle = computed(() => {
  nextTick(() => {
    scrollToBottom()
  })
  return {
    transform: aiChatStore.visible ? 'translateY(0)' : 'translateY(100%)',
    opacity: aiChatStore.visible ? '1' : '0'
  }
})

const aiUrl = computed(() => {
  return import.meta.env.VITE_AI_URL
})

const aiModel = computed(() => {
  return import.meta.env.VITE_AI_MODEL
})

// 关闭对话框
const closeChat = () => {
  aiChatStore.setVisible(false)
}

// 添加新的响应类型
interface OllamaResponse {
  model: string
  created_at: string
  response: string
  done: boolean
  context: number[]
  total_duration?: number
  eval_count?: number
  prompt_eval_count?: number
}

// 添加新的状态变量
const expandedThinking = ref<Set<string>>(new Set())
const abortController = ref<AbortController | null>(null)
const isGenerating = ref(false)

// 在 sendMessage 方法中修改
const sendMessage = async () => {
  if (!inputMessage.value.trim()) return

  const iMessage = unref(inputMessage)

  // 清空输入框
  inputMessage.value = ''

  // 添加用户消息到历史记录
  aiChatStore.addMessage({
    role: 'user',
    content: iMessage,
    id: toAnyString()
  })

  // 开始加载状态
  aiChatStore.setLoading(true)
  const startTime = Date.now()
  let totalTokens = 0
  isGenerating.value = true
  abortController.value = new AbortController()

  try {
    // 准备请求数据
    const response = await fetch(aiUrl.value, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: aiModel.value,
        prompt: iMessage,
        stream: true
      }),
      signal: abortController.value.signal
    })

    if (!response.ok) {
      throw new Error('网络请求失败')
    }

    // 创建临时消息 ID
    const tempMessageId = toAnyString()
    aiChatStore.addMessage({
      role: 'assistant',
      content: '',
      id: tempMessageId
    })

    // 获取响应的 ReadableStream
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let accumulatedContent = ''
    let accumulatedThinking = ''
    let isInThinkingBlock = false

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // 解码响应数据
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(Boolean)
        for (const line of lines) {
          try {
            const data: OllamaResponse = JSON.parse(line)
            if (data.done) {
              const duration = (Date.now() - startTime) / 1000
              totalTokens = (data.eval_count || 0) + (data.prompt_eval_count || 0)
              aiChatStore.setMessageCost(tempMessageId, duration, totalTokens)
            }
            if (data.response) {
              const text = data.response.replace(/\\n/g, '\n').replace(/\\/g, '').trim()

              if (text) {
                // 检查是否包含思考标签的开始或结束
                if (text.includes('<think>')) {
                  expandedThinking.value.add(tempMessageId)
                  isInThinkingBlock = true
                } else if (text.includes('</think>')) {
                  isInThinkingBlock = false
                  // 自动收起思考内容
                  expandedThinking.value.delete(tempMessageId)
                  continue // 跳过结束标签
                }

                // 根据当前状态累积内容
                if (isInThinkingBlock) {
                  accumulatedThinking += text.replace('<think>', '')
                } else {
                  accumulatedContent += text
                }

                // 更新消息内容
                aiChatStore.updateMessage(
                  tempMessageId,
                  accumulatedContent.trim(),
                  accumulatedThinking.trim()
                )

                await nextTick()
                scrollToBottom()
              }
            }
          } catch (e) {
            console.error('解析响应数据失败:', e)
          }
        }
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('请求被中断')
    } else {
      console.error('请求失败:', error)
      ElMessage.error('与 AI 助手通信失败，请稍后重试')
    }
  } finally {
    isGenerating.value = false
    aiChatStore.setLoading(false)
    scrollToBottom()
  }
}

// 添加停止生成方法
const stopGeneration = () => {
  if (abortController.value) {
    abortController.value.abort()
    abortController.value = null
  }
}

// 添加清空聊天方法
const clearChat = () => {
  aiChatStore.clearMessages()
}

// 监听Enter键发送消息
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (!messagesContainer.value) return
  const container = messagesContainer.value.$el.querySelector('.el-scrollbar__wrap')
  container.style.scrollBehavior = 'smooth' // 添加平滑滚动效果
  container.scrollTop = container.scrollHeight
}

// 复制消息内容
const copyMessage = (content: string) => {
  if (isSupported) {
    copy(content)
    ElMessage.success(t('common.copySuccess'))
  } else {
    ElMessage.error(t('common.copyError'))
  }
}

// 删除消息
const deleteMessage = (index: number) => {
  aiChatStore.deleteMessage(index)
}

// 添加切换思考内容显示的方法
const toggleThinking = (messageId: string) => {
  if (expandedThinking.value.has(messageId)) {
    expandedThinking.value.delete(messageId)
  } else {
    expandedThinking.value.add(messageId)
  }
}
</script>

<template>
  <div class="ai-chat-container" v-if="aiChatStore.visible || aiChatStore.animating">
    <div class="ai-chat-dialog" :style="dialogStyle">
      <div class="ai-chat-header">
        <span>{{ t('ai.title') }}</span>
        <div class="ai-chat-close" @click="closeChat">
          <Icon icon="ri:close-line" :size="18" />
        </div>
      </div>

      <ElScrollbar class="ai-chat-messages" ref="messagesContainer">
        <Infotip
          v-if="aiChatStore.messages.length === 0"
          :show-index="false"
          :title="t('ai.hello')"
          :schema="[
            {
              label: t('ai.welcome')
            }
          ]"
        />
        <div
          v-for="(message, index) in aiChatStore.messages"
          :key="index"
          :class="['ai-chat-message', `ai-chat-message-${message.role}`]"
        >
          <ElAvatar
            :size="32"
            :icon="message.role === 'assistant' ? 'ri:robot-line' : 'ri:user-line'"
          />
          <div class="ai-chat-message-content-wrapper">
            <div
              v-if="message.role === 'assistant'"
              class="ai-chat-message-thinking"
              :class="{ 'thinking-collapsed': !expandedThinking.has(message.id) }"
              @click="toggleThinking(message.id)"
            >
              <div class="thinking-header">
                <Icon icon="ri:mind-map" :size="14" />
                <span>思考过程</span>
                <Icon
                  :icon="
                    expandedThinking.has(message.id) ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'
                  "
                  :size="14"
                  class="thinking-toggle"
                />
              </div>
              <div class="thinking-content">{{ message.thinking }}</div>
            </div>
            <div class="ai-chat-message-content">
              <span v-if="message.content && message.role !== 'assistant'">{{
                message.content
              }}</span>
              <span
                v-else-if="message.content && message.role === 'assistant'"
                v-html="marked(message.content)"
              ></span>
              <div v-else class="ai-chat-message-content ai-chat-loading">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div
                v-if="message.duration && message.tokens && message.role === 'assistant'"
                class="message-stats"
              >
                <span>{{ message.duration.toFixed(1) }}s</span>
                <span>{{ message.tokens }} tokens</span>
              </div>
            </div>
            <div class="ai-chat-message-actions">
              <Icon
                v-if="isSupported"
                color="var(--top-header-text-color)"
                icon="ri:file-copy-line"
                :size="16"
                @click="copyMessage(message.content)"
                title="复制"
                class="cursor-pointer"
              />
              <ElPopconfirm title="确定删除?" @confirm="deleteMessage(index)">
                <template #reference>
                  <Icon
                    icon="ri:delete-bin-line"
                    color="var(--top-header-text-color)"
                    :size="16"
                    title="删除"
                    class="cursor-pointer"
                  />
                </template>
              </ElPopconfirm>
            </div>
          </div>
        </div>
      </ElScrollbar>

      <!-- 修改输入区域的按钮组 -->
      <div class="ai-chat-input">
        <ElInput
          v-model="inputMessage"
          :placeholder="t('ai.inputPlaceholder')"
          type="textarea"
          :rows="3"
          resize="none"
          @keydown="handleKeyDown"
        />
        <div class="ai-chat-buttons">
          <ElButton
            :type="isGenerating ? 'info' : 'success'"
            @click="isGenerating ? stopGeneration() : sendMessage()"
            :disabled="aiChatStore.loading && !isGenerating"
          >
            <Icon :icon="isGenerating ? 'tdesign:stop-circle' : 'ri:send-plane-fill'" />
          </ElButton>
          <ElPopconfirm title="确定清空聊天内容?" @confirm="clearChat">
            <template #reference>
              <ElButton type="danger">
                <Icon icon="ri:delete-bin-line" />
              </ElButton>
            </template>
          </ElPopconfirm>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.ai-chat-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 2006;
}

.ai-chat-dialog {
  width: 500px;
  height: 700px;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  overflow: hidden;
}

.ai-chat-header {
  padding: 12px 16px;
  background-color: var(--el-color-primary);
  color: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ai-chat-close {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.ai-chat-message {
  display: flex;
  margin-bottom: 16px;
  gap: 8px;
}

.ai-chat-message-assistant {
  align-items: flex-start;
}

.ai-chat-message-user {
  flex-direction: row-reverse;
}

.ai-chat-message-content-wrapper {
  position: relative;
  max-width: 80%;
  display: flex;
  flex-direction: column;
}

.ai-chat-message-content {
  padding: 10px 12px;
  border-radius: 8px;
  word-break: break-word;
}

// 添加新的样式
.thinking-collapsed {
  cursor: pointer;

  .thinking-content {
    display: none;
  }
}

.thinking-header {
  cursor: pointer;

  .thinking-toggle {
    margin-left: auto;
  }
}

.message-stats {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);

  span {
    opacity: 0.8;
  }
}

.ai-chat-message-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
  justify-content: flex-start;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.ai-chat-message-user .ai-chat-message-actions {
  justify-content: flex-end;
}

.ai-chat-message-content-wrapper:hover .ai-chat-message-actions {
  opacity: 1;
}

.ai-chat-message-actions .icon {
  cursor: pointer;
  color: var(--el-text-color-secondary);
  transition: color 0.2s;
  padding: 2px;
  border-radius: 4px;
  background-color: var(--el-bg-color-page);
}

.ai-chat-message-actions .icon:hover {
  color: var(--el-color-primary);
  background-color: var(--el-fill-color-light);
}

.ai-chat-message-assistant .ai-chat-message-content {
  background-color: var(--el-color-primary-light-9);
}

.ai-chat-message-user .ai-chat-message-content {
  background-color: var(--el-color-primary-light-7);
}

.ai-chat-message-user .ai-chat-message-actions .icon {
  color: var(--el-text-color-secondary);
}

.ai-chat-message-user .ai-chat-message-actions .icon:hover {
  color: var(--el-color-primary);
}

.ai-chat-input {
  padding: 12px;
  border-top: 1px solid var(--el-border-color-light);
  display: flex;
  gap: 8px;
}

.ai-chat-input .el-textarea {
  flex: 1;
}

.ai-chat-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
}

.ai-chat-loading span {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: var(--el-color-primary);
  border-radius: 50%;
  margin: 0 3px;
  animation: ai-chat-loading 1.4s infinite ease-in-out both;
}

.ai-chat-message-thinking {
  margin-bottom: 8px;
  background-color: var(--el-color-info-light-9);
  border-radius: 6px;
  overflow: hidden;
}

.thinking-header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: var(--el-color-info-light-8);
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.thinking-content {
  padding: 8px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
}

.ai-chat-loading span:nth-child(1) {
  animation-delay: -0.32s;
}

.ai-chat-loading span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes ai-chat-loading {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

// 添加按钮组样式
.ai-chat-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  .el-button {
    margin-left: 0 !important;
  }
}
</style>
