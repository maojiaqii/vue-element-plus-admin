<script setup lang="ts">
import { ElRow, ElCol, ElCard, ElSkeleton } from 'element-plus'
import { useDesign } from '@/hooks/web/useDesign'
import { useI18n } from '@/hooks/web/useI18n'
import { ref, reactive } from 'vue'
import { getCountApi } from '@/api/dashboard/analysis'
import type { AnalysisTotalTypes } from '@/api/dashboard/analysis/types'
import { Panel } from '@/components/Panel'

const { t } = useI18n()

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('panel')

const loading = ref(true)

let totalState = reactive<AnalysisTotalTypes>({
  users: 0,
  messages: 0,
  moneys: 0,
  shoppings: 0
})

const getCount = async () => {
  const res = await getCountApi()
    .catch(() => {})
    .finally(() => {
      loading.value = false
    })
  totalState = Object.assign(totalState, res?.data || {})
}

getCount()
</script>

<template>
  <ElRow :gutter="20" justify="space-between" :class="prefixCls">
    <ElCol :xl="6" :lg="6" :md="12" :sm="12" :xs="24">
      <ElCard shadow="hover" class="mb-20px">
        <ElSkeleton :loading="loading" animated :rows="2">
          <template #default>
            <Panel
              :icon="{ icon: 'svg-icon:peoples', color: '#40c9c6' }"
              :title="t('analysis.newUser')"
              :value="102400"
            />
          </template>
        </ElSkeleton>
      </ElCard>
    </ElCol>

    <ElCol :xl="6" :lg="6" :md="12" :sm="12" :xs="24">
      <ElCard shadow="hover" class="mb-20px">
        <ElSkeleton :loading="loading" animated :rows="2">
          <template #default>
            <Panel
              :icon="{ icon: 'svg-icon:message', color: '#36a3f7' }"
              :title="t('analysis.unreadInformation')"
              :value="81212"
            />
          </template>
        </ElSkeleton>
      </ElCard>
    </ElCol>

    <ElCol :xl="6" :lg="6" :md="12" :sm="12" :xs="24">
      <ElCard shadow="hover" class="mb-20px">
        <ElSkeleton :loading="loading" animated :rows="2">
          <template #default>
            <Panel
              :icon="{ icon: 'svg-icon:money', color: '#f4516c' }"
              :title="t('analysis.transactionAmount')"
              :value="9280"
            />
          </template>
        </ElSkeleton>
      </ElCard>
    </ElCol>

    <ElCol :xl="6" :lg="6" :md="12" :sm="12" :xs="24">
      <ElCard shadow="hover" class="mb-20px">
        <ElSkeleton :loading="loading" animated :rows="2">
          <template #default>
            <Panel
              :icon="{ icon: 'svg-icon:shopping', color: '#34bfa3' }"
              :title="t('analysis.totalShopping')"
              :value="13600"
            />
          </template>
        </ElSkeleton>
      </ElCard>
    </ElCol>
  </ElRow>
</template>
