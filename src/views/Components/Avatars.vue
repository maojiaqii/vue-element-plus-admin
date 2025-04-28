<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Avatars, AvatarItem } from '@/components/Avatars'
import { CharAvatar } from '@/components/CharAvatar'
import { ref } from 'vue'

const { t } = useI18n()

const data = ref<AvatarItem[]>([
  {
    name: 'Lily',
    url: 'https://avatars.githubusercontent.com/u/3459374?v=4'
  },
  {
    name: 'Amanda',
    url: 'https://avatars.githubusercontent.com/u/3459375?v=4'
  },
  {
    name: 'Daisy',
    url: 'https://avatars.githubusercontent.com/u/3459376?v=4'
  },
  {
    name: 'Olivia',
    url: 'https://avatars.githubusercontent.com/u/3459377?v=4'
  },
  {
    name: 'Tina',
    url: 'https://avatars.githubusercontent.com/u/3459378?v=4'
  },
  {
    name: 'Kitty',
    url: 'https://avatars.githubusercontent.com/u/3459323?v=4'
  },
  {
    name: 'Helen',
    url: 'https://avatars.githubusercontent.com/u/3459324?v=4'
  },
  {
    name: 'Sophia',
    url: 'https://avatars.githubusercontent.com/u/3459325?v=4'
  },
  {
    name: 'Wendy',
    url: 'https://avatars.githubusercontent.com/u/3459326?v=4'
  }
])
</script>

<template>
  <ContentWrap :title="t('router.avatars')" :message="t('avatarsDemo.title')">
    <Avatars :data="data" />
  </ContentWrap>
  <ContentWrap title="首字符头像" message="根据字符串第一个字符生成头像" class="m-t-10px">
    <h3>基本用法</h3>
    <div class="avatar-row">
      <CharAvatar text="Admin" />
      <CharAvatar text="User" />
      <CharAvatar text="Guest" />
      <CharAvatar text="John Doe" />
      <CharAvatar text="Vue Admin" />
    </div>

    <h3>中文支持</h3>
    <div class="avatar-row">
      <CharAvatar text="张三" />
      <CharAvatar text="李四" />
      <CharAvatar text="王五" />
      <CharAvatar text="赵六" />
      <CharAvatar text="中文测试" />
    </div>

    <h3>自定义大小</h3>
    <div class="avatar-row">
      <CharAvatar text="S" :size="30" />
      <CharAvatar text="M" :size="40" />
      <CharAvatar text="L" :size="50" />
      <CharAvatar text="XL" :size="60" />
      <CharAvatar text="XXL" :size="70" />
    </div>

    <h3>自定义颜色</h3>
    <div class="avatar-row">
      <CharAvatar text="A" bgColor="#f44336" />
      <CharAvatar text="B" bgColor="#2196f3" />
      <CharAvatar text="C" bgColor="#4caf50" />
      <CharAvatar text="D" bgColor="#ff9800" />
      <CharAvatar text="E" bgColor="#9c27b0" />
    </div>

    <h3>中文自定义样式</h3>
    <div class="avatar-row">
      <CharAvatar text="北" bgColor="#ff5722" :size="50" />
      <CharAvatar text="上" bgColor="#2196f3" :size="50" />
      <CharAvatar text="广" bgColor="#4caf50" :size="50" />
      <CharAvatar text="深" bgColor="#9c27b0" :size="50" />
    </div>

    <h3>自定义样式</h3>
    <div class="avatar-row">
      <CharAvatar text="X" :customStyle="{ borderRadius: '4px' }" />
      <CharAvatar
        text="Y"
        :customStyle="{ border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }"
      />
      <CharAvatar text="Z" :customStyle="{ textTransform: 'lowercase' }" />
      <CharAvatar
        text="中"
        :customStyle="{ borderRadius: '4px', border: '2px solid #4caf50' }"
      />
    </div>
  </ContentWrap>
</template>

<style scoped>
.avatar-row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}
</style>
