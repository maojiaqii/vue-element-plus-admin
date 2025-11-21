<script setup lang="ts">
import data from '@/assets/json/search_demo.json'
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Search } from '@/components/Search'

const { t } = useI18n()

const handleSearch = async (data: any) => {
  console.log(data)
}

const register = (methods: any) => {
  console.log(methods.getFormData())
}
</script>

<template>
  <ContentWrap :title="t('searchDemo.search')" :message="t('searchDemo.searchDes')">
    <Search :schema="data" @search="handleSearch" @reset="handleSearch" @register="register" />
  </ContentWrap>
</template>

<style lang="less" scoped>
.el-button {
  margin-top: 10px;
}
</style>
