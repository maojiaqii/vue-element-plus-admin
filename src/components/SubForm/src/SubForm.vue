<script setup lang="ts">
import { Form, FormProps } from '@/components/Form'
import { onMounted, PropType, watch, ref } from 'vue'
import { propTypes } from '@/utils/propTypes'
import { getFormInfoApi } from '@/api/common'
import { ElMessage, ElPopconfirm } from 'element-plus'
import { BaseButton } from '@/components/Button'
import { ContentWrap } from '@/components/ContentWrap'
import { toAnyString } from '@/utils'
import { Icon } from '@/components/Icon'

const props = defineProps({
  formCode: propTypes.string.def(''),
  // 可编辑
  editable: propTypes.bool.def(false),
  // 可新增或删除
  disabled: propTypes.bool.def(true),
  // 最大条目数
  maxSize: propTypes.number.def(Number.POSITIVE_INFINITY),
  // 最小条目数
  minSize: propTypes.number.def(0),
  modelValue: {
    type: Array as PropType<Recordable[]>,
    default: () => []
  }
})

const emit = defineEmits(['change', 'update:modelValue'])

// 输入框的值
const valueRef = ref(props.modelValue)
const formBinds = ref<FormProps>()

const renderForm = async () => {
  const res = await getFormInfoApi({ code: props.formCode })
  if (res.code != 200) {
    ElMessage.error(res.msg)
    formBinds.value = undefined
  } else {
    formBinds.value = res.data
  }
}

const valChange = (val: Recordable, index: number) => {
  valueRef.value[index] = val
}

const deleteGroup = (index: number) => {
  valueRef.value.splice(index, 1)
}

// 监听
watch(
  () => valueRef.value,
  (val: Recordable[]) => {
    console.log(val)
    emit('change', val)
    emit('update:modelValue', val)
  },
  { deep: true }
)

onMounted(() => {
  renderForm()
})
</script>

<template>
  <ContentWrap
    class="m-b-1"
    v-for="(model, index) in valueRef"
    :title="'分组' + index"
    :key="model._el_key_"
  >
    <template #header>
      <ElPopconfirm class="float-right" title="确定删除?" @confirm="deleteGroup(index)">
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
    </template>
    <Form
      v-bind="formBinds"
      v-on="formBinds?.on"
      :model="model"
      @change="(val) => valChange(val, index)"
    />
  </ContentWrap>
  <base-button class="w-full" @click="valueRef.push({ _el_key_: toAnyString() })">
    添加一组
  </base-button>
</template>
