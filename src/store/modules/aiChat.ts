import { defineStore } from 'pinia'
import { store } from '@/store'

interface AiChatMessage {
  role: 'user' | 'assistant'
  content: string
  thinking?: string
  id: string
  duration?: number
  tokens?: number
}

interface AiChatState {
  visible: boolean
  animating: boolean
  loading: boolean
  messages: AiChatMessage[]
}

export const useAiChatStore = defineStore('aiChat', {
  state: (): AiChatState => {
    return {
      visible: false,
      animating: false,
      loading: false,
      messages: []
    }
  },
  actions: {
    setVisible(visible: boolean) {
      this.visible = visible
      if (visible) {
        this.animating = true
      } else {
        // 延迟关闭动画状态，确保过渡效果完成
        setTimeout(() => {
          this.animating = false
        }, 300)
      }
    },
    toggleVisible() {
      this.setVisible(!this.visible)
    },
    addMessage(message: AiChatMessage) {
      this.messages.push(message)
    },
    setLoading(loading: boolean) {
      this.loading = loading
    },
    updateMessage(id: string, content: string, thinking?: string) {
      const messageIndex = this.messages.findIndex((msg) => msg.id === id)
      if (messageIndex !== -1) {
        this.messages[messageIndex].content = content
        if (thinking !== undefined) {
          this.messages[messageIndex].thinking = thinking
        }
      }
    },
    setMessageCost(id: string, duration: number, tokens: number) {
      const messageIndex = this.messages.findIndex((msg) => msg.id === id)
      if (messageIndex !== -1) {
        this.messages[messageIndex].duration = duration
        this.messages[messageIndex].tokens = tokens
      }
    },
    deleteMessage(index: number) {
      this.messages.splice(index, 1);
    },
    clearMessages() {
      this.messages = []
    }
  },
  persist: true
})

export const useAiChatStoreWithOut = () => {
  return useAiChatStore(store)
}
