<template>
  <div
    class="initial-avatar"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: bgColor || generateColor(text),
      color,
      fontSize: `${fontSize}px`,
      ...customStyle
    }"
  >
    {{ getInitial(text) }}
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  // 传入的文本
  text: string
  // 背景颜色，不传则根据文本自动生成
  bgColor?: string
  // 文字颜色
  color?: string
  // 头像大小，单位px
  size?: number
  // 字体大小，单位px
  fontSize?: number
  // 自定义样式
  customStyle?: Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  bgColor: '',
  color: '#ffffff',
  size: 40,
  fontSize: 0,
  customStyle: () => ({})
})

const fontSize = computed(() => {
  if (props.fontSize) return props.fontSize
  return Math.floor(props.size / 2)
})

// 判断是否为中文字符
const isChinese = (char: string): boolean => {
  return /[\u4e00-\u9fa5]/.test(char)
}

// 获取首字符（支持中文和英文）
const getInitial = (text: string): string => {
  if (!text) return ''

  // 移除开头的空白字符
  const trimmedText = text.trim()
  if (!trimmedText) return ''

  const firstChar = trimmedText.charAt(0)

  // 如果是中文字符，直接返回
  if (isChinese(firstChar)) {
    return firstChar
  }

  // 英文字符转为大写
  return firstChar.toUpperCase()
}

// 根据字符串生成一个固定的颜色
const generateColor = (text: string): string => {
  if (!text) return '#e0e0e0'

  // 这里使用简单的哈希算法将字符串转换为颜色
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash)
  }

  // 将哈希值转换为颜色
  const colors = [
    '#1abc9c',
    '#2ecc71',
    '#3498db',
    '#9b59b6',
    '#34495e',
    '#16a085',
    '#27ae60',
    '#2980b9',
    '#8e44ad',
    '#2c3e50',
    '#f1c40f',
    '#e67e22',
    '#e74c3c',
    '#ecf0f1',
    '#95a5a6',
    '#f39c12',
    '#d35400',
    '#c0392b',
    '#bdc3c7',
    '#7f8c8d'
  ]

  // 使用绝对值确保索引为正
  const index = Math.abs(hash % colors.length)
  return colors[index]
}
</script>

<style scoped>
.initial-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 600;
  overflow: hidden;
  user-select: none;
}
</style>
