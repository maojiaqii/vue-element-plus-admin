<!--
 * @Date:  2024-05-25 14:05:59
 * @LastEditors: LDH 574427343@qq.com
 * @LastEditTime: 2023-03-29 16:05:54
 * @FilePath: /flow-designer/src/components/dialog/errorDialog.vue
-->
<template>
  <el-dialog title="提示" v-model="visibleDialog" :width="520">
    <div class="flow-confirm-body">
      <Infotip
        :show-index="false"
        title="当前无法发布"
        type="error"
        :schema="[
          {
            label: '以下内容不完善，需进行修改'
          }
        ]"
      />
      <div class="error-modal-list">
        <div class="error-modal-item" v-for="(item, index) in list" :key="index">
          <div class="error-modal-item-label">{{ item.nodeName }}</div>
          <div class="error-modal-item-content">未选择{{ item.nodeType }}</div>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button type="primary" @click="visibleDialog = false">前往修改</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { ElDialog, ElButton } from 'element-plus'
import { Infotip } from '@/components/Infotip'
let props = defineProps({
  list: {
    type: Array,
    default: () => []
  },
  visible: {
    type: Boolean,
    default: false
  }
})
let emits = defineEmits(['update:visible'])

let visibleDialog = computed({
  get() {
    return props.visible
  },
  set(val) {
    emits('update:visible', val)
  }
})
</script>

<style lang="css" scoped>
@import '../../css/base.css';
@import '../../css/workflow.css';
</style>
