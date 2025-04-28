<!--
 * @Date:  2024-05-25 14:05:59
 * @LastEditors: LDH 574427343@qq.com
 * @LastEditTime: 2023-05-24 15:17:13
 * @FilePath: /flow-designer/src/components/drawer/promoterDrawer.vue
-->
<template>
  <el-drawer
    :append-to-body="true"
    title="发起人"
    v-model="visible"
    class="set_promoter"
    :show-close="false"
    :size="550"
    :before-close="savePromoter"
  >
    <div class="drawer_content">
      <div class="promoter_content">
        <p>{{ $func.arrToStr(flowPermission) || '所有人' }}</p>
        <span style="font-size: small; color: red"
          >*发起人 默认全部，预览环境不支持修改，可以联系管理员</span
        >
        <!-- <el-button type="primary" @click="addPromoter">添加/修改发起人</el-button> -->
        <p class="selected_list">
          <span v-for="(item, index) in flowPermission" :key="index"
            >{{ item.name }}
            <Icon
              icon="ep:close"
              class="ml-5px cursor-pointer"
              :size="14"
              @click="$func.removeEle(flowPermission, item, 'targetId')"
            />
          </span>
          <a v-if="flowPermission && flowPermission.length !== 0" @click="flowPermission = []"
            >清除</a
          >
        </p>
      </div>
    </div>
    <template #footer>
      <el-button @click="closeDrawer">取 消</el-button>
      <el-button type="primary" @click="savePromoter">确 定</el-button>
    </template>
  </el-drawer>
  <selectUser v-model:visible="promoterVisible" :data="checkedList" @change="surePromoter" />
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import { ElDrawer, ElButton } from 'element-plus'
import selectUser from '../dialog/selectUserDialog.vue'
import $func from '../../utils/index'
import { useWorkFlowStore } from '@/store/modules/workFlow'
import { Icon } from '@/components/Icon'

let flowPermission = ref([])
let promoterVisible = ref(false)
let checkedList = ref([])

let store = useWorkFlowStore()
let { setPromoter, setFlowPermission } = store
let promoterDrawer = computed(() => store.promoterDrawer)
let flowPermission1 = computed(() => store.flowPermission1)
let visible = computed({
  get() {
    return promoterDrawer.value
  },
  set() {
    closeDrawer()
  }
})
watch(flowPermission1, (val) => {
  flowPermission.value = val.value
})
const addPromoter = () => {
  checkedList.value = flowPermission.value
  promoterVisible.value = true
}
const surePromoter = (data) => {
  flowPermission.value = data
  promoterVisible.value = false
}
const savePromoter = () => {
  setFlowPermission({
    value: flowPermission.value,
    flag: true,
    id: flowPermission1.value.id
  })
  closeDrawer()
}
const closeDrawer = () => {
  setPromoter(false)
}
</script>
<style lang="css" scoped>
@import '../../css/base.css';
@import '../../css/workflow.css';

.promoter_content {
  padding: 0 20px;
  flex: 1 !important;
}
p {
  padding: 18px 0;
  font-size: 14px;
  line-height: 20px;
  color: #000000;
}
.el-button {
  margin-bottom: 20px;
}
.selected_list {
  margin-bottom: 20px;
  line-height: 30px;
}

.selected_list span {
  margin-right: 10px;
  padding: 3px 6px 3px 9px;
  line-height: 12px;
  white-space: nowrap;
  border-radius: 2px;
  border: 1px solid rgba(220, 220, 220, 1);
}

.selected_list img {
  margin-left: 5px;
  width: 7px;
  height: 7px;
  cursor: pointer;
}
</style>
