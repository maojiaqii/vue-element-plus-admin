<script setup lang="ts">
import data from '@/assets/forms/search_demo.json'
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Search } from '@/components/Search'

const { t } = useI18n()

const handleSearch = async (data: any) => {
  console.log(data)
}
</script>

<template>
  <ContentWrap :title="t('searchDemo.search')" :message="t('searchDemo.searchDes')">
    <Search :schema="data" :expand-index="4" @search="handleSearch" @reset="handleSearch" />
  </ContentWrap>
</template>

<style lang="less" scoped>
.el-button {
  margin-top: 10px;
}
</style>
