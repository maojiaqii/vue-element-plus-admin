<script setup lang="ts">
import { useIcon } from '@/hooks/web/useIcon'
import { propTypes } from '@/utils/propTypes'
import { useI18n } from '@/hooks/web/useI18n'

const emit = defineEmits(['search', 'reset', 'expand'])

const { t } = useI18n()

defineProps({
  showSearch: propTypes.bool.def(true),
  showReset: propTypes.bool.def(true),
  showExpand: propTypes.bool.def(false),
  expanded: propTypes.bool.def(false),
  searchLoading: propTypes.bool.def(false),
  resetLoading: propTypes.bool.def(false)
})

const onSearch = () => {
  emit('search')
}

const onReset = () => {
  emit('reset')
}

const onExpand = () => {
  emit('expand')
}
</script>

<template>
  <BaseButton
    v-if="showSearch"
    type="primary"
    :loading="searchLoading"
    :icon="useIcon({ icon: 'ep:search' })"
    @click="onSearch"
  >
    {{ t('common.query') }}
  </BaseButton>
  <BaseButton
    v-if="showReset"
    :loading="resetLoading"
    plain
    :icon="useIcon({ icon: 'ep:refresh-right' })"
    @click="onReset"
  >
    {{ t('common.reset') }}
  </BaseButton>
  <BaseButton
    v-if="showExpand"
    :icon="useIcon({ icon: expanded ? 'ep:arrow-up' : 'ep:arrow-down' })"
    text
    @click="onExpand"
  >
    {{ t(expanded ? 'common.shrink' : 'common.expand') }}
  </BaseButton>
</template>
