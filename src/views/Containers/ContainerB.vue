<script setup lang="ts">
import { ContainerA } from '@/components/Container'
import { onMounted, ref, unref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getTableInfoApi, getFormInfoApi, getDictDataApi } from '@/api/common'
import { ElMessage, ElSegmented } from 'element-plus'
import { SearchProps } from '@/components/Search'
import { TableProps } from '@/components/Table'
import { SideTreeProps } from '@/components/Container/types'
import { listToTree } from '@/utils/tree'

interface OptionType {
  value: number
  label: string
}

const { currentRoute } = useRouter()
const params = unref(currentRoute).meta.params

const search = ref<SearchProps[] | any>([])
const table = ref<TableProps[] | any>([])
const side = ref<SideTreeProps[] | any>([])
const segmented = ref<string[]>(params?.segmented as string[])
const segmentedSelected = ref(0)

const segmentedOptions = computed(() => {
  const options: OptionType[] = []
  segmented.value?.forEach((item, index) => options.push({ label: item, value: index }))
  return options
})

const renderSearch = async (searchCodes: string[]) => {
  for (const searchCode of searchCodes) {
    if (searchCode) {
      const res = await getFormInfoApi({ code: searchCode })
      if (res.code != 200) {
        ElMessage.error(res.msg)
        search.value.push(undefined)
      } else {
        search.value.push(res.data)
      }
    } else {
      search.value.push(undefined)
    }
    params?.table && (await renderTable(params.table as string[]))
  }
}

const renderTable = async (tableCodes: string[]) => {
  for (const tableCode of tableCodes) {
    if (tableCode) {
      const res = await getTableInfoApi({ code: tableCode })
      if (res.code != 200) {
        ElMessage.error(res.msg)
        table.value.push(undefined)
      } else {
        table.value.push(res.data)
      }
    } else {
      table.value.push(undefined)
    }
  }
}

const renderSide = async (dictCodes: string[]) => {
  for (const dictCode of dictCodes) {
    if (dictCode) {
      const res = await getDictDataApi({ dictCode })
      if (res.code != 200) {
        ElMessage.error(res.msg)
        side.value.push(undefined)
      } else {
        side.value.push({
          alias: res.data.dictCode,
          data: listToTree(res.data.data, {
            id: res.data.dictValue,
            children: 'children',
            pid: res.data.dictPid
          }),
          nodeKey: res.data.dictValue,
          props: {
            children: 'children',
            label: res.data.dictLabel
          }
        })
      }
    } else {
      side.value.push(undefined)
    }
  }
}

const currentContainer = computed(() => ({
  key: segmentedSelected.value,
  search: unref(search)[segmentedSelected.value],
  table: unref(table)[segmentedSelected.value],
  side: unref(side)[segmentedSelected.value]
}))

onMounted(() => {
  if (params?.search) {
    renderSearch(params.search as string[])
  } else {
    params?.table && renderTable(params.table as string[])
  }
  params?.side && renderSide(params.side as string[])
})
</script>

// 修改模板部分
<template>
  <div class="h-full overflow-hidden relative">
    <Transition name="slide-fade" mode="out-in">
      <ContainerA
        :key="currentContainer.key"
        :search="currentContainer.search"
        :table="currentContainer.table"
        :side="currentContainer.side"
        class="h-full"
      />
    </Transition>
    <div v-if="segmentedOptions.length > 0" class="segmented-wrapper">
      <ElSegmented v-model="segmentedSelected" :options="segmentedOptions" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.segmented-wrapper {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 16px;
  background: var(--el-bg-color);
  border-radius: 16px;
  box-shadow: 0 2px 12px 0 rgba(var(--el-color-primary-rgb), 0.1);
  z-index: 10;

  &:hover {
    box-shadow: 0 2px 12px 0 rgba(var(--el-color-primary-rgb), 0.2);
  }
}

// 过渡动画
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px) scale(0.95);
  opacity: 0;
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  transform: translateY(0) scale(1);
  opacity: 1;
}
</style>
