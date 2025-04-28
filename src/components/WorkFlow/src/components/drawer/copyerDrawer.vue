<!--
 * @Date:  2024-05-25 14:05:59
 * @LastEditors: LDH 574427343@qq.com
 * @LastEditTime: 2023-05-24 15:20:53
 * @FilePath: /flow-designer/src/components/drawer/copyerDrawer.vue
-->
<template>
  <el-drawer
    :append-to-body="true"
    title="抄送人"
    v-model="visible"
    class="set_copyer"
    :show-close="false"
    :size="550"
    :before-close="saveCopyer"
  >
    <template #header="{ titleId, titleClass }">
      <h3 :id="titleId" :class="titleClass">抄送人</h3>
    </template>
    <div class="approver_content">
      <el-radio-group v-model="copyerConfig.setType" class="clear" @change="changeType">
        <el-radio v-for="{ value, label } in setTypesCs" :key="value" :value="value">{{
          label
        }}</el-radio>
      </el-radio-group>
      <div class="approver_btn" v-if="copyerConfig.setType === 1">
        <BaseButton type="primary" @click="addApprover">添加/修改成员</BaseButton>
        <p class="selected_list">
          <span v-for="(item, index) in copyerConfig.nodeApproveList" :key="index"
            >🙍‍♂️{{ item.name }}
            <Icon
              icon="ep:close"
              class="ml-5px cursor-pointer"
              :size="14"
              @click="$func.removeEle(copyerConfig.nodeApproveList, item, 'targetId')"
            />
          </span>
          <a
            v-if="copyerConfig.nodeApproveList.length !== 0"
            @click="copyerConfig.nodeApproveList = []"
            >清除</a
          >
        </p>
      </div>
      <div class="approver_btn" v-show="copyerConfig.setType === 3">
        <BaseButton type="primary" @click="addRoleApprover">添加/修改角色</BaseButton>
        <el-checkbox
          v-model="copyerConfig.promoterDepartment"
          label="本部门"
          border
          style="width: 100%; height: 45px; margin-top: 10px"
        />
        <p class="selected_list">
          <span v-for="(item, index) in copyerConfig.nodeApproveList" :key="index"
            >🙍‍♂️{{ item.name }}
            <Icon
              icon="ep:close"
              class="ml-5px cursor-pointer"
              :size="14"
              @click="$func.removeEle(copyerConfig.nodeApproveList, item, 'targetId')"
            />
          </span>
          <a
            v-if="copyerConfig.nodeApproveList.length !== 0"
            @click="copyerConfig.nodeApproveList = []"
            >清除</a
          >
        </p>
      </div>
    </div>
    <template #footer>
      <el-button @click="closeDrawer">取 消</el-button>
      <el-button type="primary" @click="saveCopyer">确 定</el-button>
    </template>
  </el-drawer>
  <selectUser v-model:visible="approverVisible" :data="checkedList" @change="sureApprover" />
  <role-dialog
    v-model:visible="approverRoleVisible"
    :data="checkedRoleList"
    @change="sureRoleApprover"
  />
</template>
<script setup>
import { ref, watch, computed } from 'vue'
import { ElDrawer, ElButton, ElCheckbox, ElRadioGroup, ElRadio } from 'element-plus'
import selectUser from '../dialog/selectUserDialog.vue'
import roleDialog from '../dialog/selectRoleDialog.vue'
import { useWorkFlowStore } from '@/store/modules/workFlow'
import $func from '../../utils/index'
import { Icon } from '@/components/Icon'
import { setTypesCs } from '@/components/WorkFlow/src/utils/const'

let copyerConfig = ref({})
let approverVisible = ref(false)
let approverRoleVisible = ref(false)
let checkedRoleList = ref([])
let checkedList = ref([])
let store = useWorkFlowStore()
let { setCopyerConfig, setCopyer } = store
let copyerDrawer = computed(() => store.copyerDrawer)
let copyerConfig1 = computed(() => store.copyerConfig1)
let visible = computed({
  get() {
    return copyerDrawer.value
  },
  set() {
    closeDrawer()
  }
})
watch(copyerConfig1, (val) => {
  copyerConfig.value = val.value
})

const changeType = () => {
  copyerConfig.value.nodeApproveList = []
  copyerConfig.value.signType = 1
}
const addApprover = () => {
  approverVisible.value = true
  checkedList.value = copyerConfig.value.nodeApproveList
}
const addRoleApprover = () => {
  approverRoleVisible.value = true
  checkedRoleList.value = copyerConfig.value.nodeApproveList
}
const sureApprover = (data) => {
  copyerConfig.value.nodeApproveList = data
  approverVisible.value = false
}
const saveCopyer = () => {
  copyerConfig.value.error = !$func.setApproverStr(copyerConfig.value)
  setCopyerConfig({
    value: copyerConfig.value,
    flag: true,
    nodeId: copyerConfig1.value.nodeId
  })
  closeDrawer()
}
const closeDrawer = () => {
  setCopyer(false)
}
</script>
<style lang="css" scoped>
@import '../../css/base.css';
@import '../../css/workflow.css';

.selected_list {
  margin-bottom: 20px;
  line-height: 35px;
}

.selected_list span {
  margin-right: 10px;
  padding: 3px 6px 3px 9px;
  line-height: 12px;
  white-space: nowrap;
  border-radius: 5px;
  border: 1px solid rgba(220, 220, 220, 1);
}

.selected_list img {
  margin-left: 5px;
  width: 7px;
  height: 7px;
  cursor: pointer;
}

.approver_content {
  padding: 20px 20px 0;
  border-bottom: 1px solid #f2f2f2;
  min-height: 260px;
  overflow: hidden;
  margin-bottom: 20px;
  border: 1px solid var(--el-border-color);
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}

.approver_content,
.approver_block,
.approver_btn {
  .el-radio-group {
    display: unset;
  }
  .el-radio {
    width: 18%;
    margin-bottom: 20px;
    height: 16px;
  }
}
</style>
