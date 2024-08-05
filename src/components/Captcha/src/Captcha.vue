<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ElInput } from 'element-plus'
import { propTypes } from '@/utils/propTypes'
import { useConfigGlobal } from '@/hooks/web/useConfigGlobal'
import { useDesign } from '@/hooks/web/useDesign'
import { getCaptchaApi } from '@/api/common'
import { useCaptchaStore } from '@/store/modules/captcha'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('input-captcha')

const props = defineProps({
  modelValue: propTypes.string.def(''),
  type: propTypes.oneOf<'math' | 'char'>(['math', 'char']).def()
})

const { configGlobal } = useConfigGlobal()

const userCaptcha = useCaptchaStore()

const emit = defineEmits(['update:modelValue'])

// 输入框的值
const valueRef = ref(props.modelValue)

// 监听
watch(
  () => valueRef.value,
  (val: string) => {
    emit('update:modelValue', val)
  }
)

const getCaptcha = async () => {
  const res = await getCaptchaApi(props.type)
  if (res.code === 500) {
    userCaptcha.setUuid(undefined)
    userCaptcha.setCaptcha(undefined)
  } else {
    userCaptcha.setUuid(res.data.uuid)
    userCaptcha.setCaptcha(res.data.img)
  }
}

onMounted(() => {
  getCaptcha()
})
</script>

<template>
  <div v-if="userCaptcha.getCaptcha" :class="[prefixCls, `${prefixCls}--${configGlobal?.size}`]">
    <ElInput v-bind="$attrs" v-model="valueRef" :class="`${prefixCls}__input`">
      <template #suffix>
        <img
          :src="userCaptcha.getCaptcha"
          :class="`${prefixCls}__image`"
          @click="getCaptcha"
          alt=""
        />
      </template>
    </ElInput>
  </div>
</template>

<style lang="less" scoped>
@prefix-cls: ~'@{namespace}-input-captcha';

.@{prefix-cls} {
  :deep(.@{elNamespace}-input__clear) {
    margin-left: 5px;
  }

  &__input {
    width: 100% !important;
  }

  &__image {
    height: var(--el-component-size);
    border-radius: var(--el-border-radius-base);
    border: none;
    cursor: pointer;
    vertical-align: middle;
  }

  &--mini > &__image {
    border-radius: var(--el-border-radius-small);
  }
}
</style>
