<template>
  <el-drawer
    :append-to-body="true"
    title="审批人"
    v-model="visible"
    class="set_approver"
    :show-close="false"
    :size="550"
    :before-close="saveApprover"
  >
    <template #header="{ titleId, titleClass }">
      <h3 :id="titleId" :class="titleClass">审批人</h3>
    </template>
    <el-tabs v-model="activeName" class="set-tabs" @tab-click="handleTabClick">
      <el-tab-pane label="基础设置" name="baseTab">
        <span class="approver_content-title">💁设置审批人</span>
        <div class="approver_content">
          <el-radio-group v-model="approverConfig.setType" class="clear" @change="changeType">
            <el-radio v-for="{ value, label } in setTypes" :key="value" :value="value">{{
              label
            }}</el-radio>
          </el-radio-group>

          <div class="approver_btn" v-if="approverConfig.setType === 1">
            <BaseButton type="primary" @click="addApprover">添加/修改成员</BaseButton>
            <p class="selected_list">
              <span v-for="(item, index) in approverConfig.nodeApproveList" :key="index"
                >🙍‍♂️{{ item.name }}
                <Icon
                  icon="ep:close"
                  class="ml-5px cursor-pointer"
                  :size="14"
                  @click="$func.removeEle(approverConfig.nodeApproveList, item, 'targetId')"
                />
              </span>
              <a
                v-if="approverConfig.nodeApproveList.length !== 0"
                @click="approverConfig.nodeApproveList = []"
                >清除</a
              >
            </p>
          </div>
          <div class="approver_btn" v-show="approverConfig.setType === 3">
            <BaseButton class="m-b-10px" type="primary" @click="addRoleApprover"
              >添加/修改角色</BaseButton
            >
            <p><b>角色范围</b></p>
            <el-radio-group
              v-model="approverConfig.roleRange"
              class="clear"
              style="width: 100%; height: 45px; margin-top: 10px"
            >
              <el-radio v-for="{ value, label } in setRoleRangeTypes" :key="value" :value="value">{{
                label
              }}</el-radio>
            </el-radio-group>
            <div class="selected_list">
              <div><b>已选角色</b></div>
              <span v-for="(item, index) in approverConfig.nodeApproveList" :key="index"
                >🙍‍♂️{{ item.name }}
                <Icon
                  icon="ep:close"
                  class="ml-5px cursor-pointer"
                  :size="14"
                  @click="$func.removeEle(approverConfig.nodeApproveList, item, 'targetId')"
                />
              </span>
              <a
                v-if="approverConfig.nodeApproveList.length !== 0"
                @click="approverConfig.nodeApproveList = []"
                >清除</a
              >
            </div>
          </div>
          <div class="approver_text" v-if="approverConfig.setType === 5">
            <p>该审批节点设置“发起人自己”后，审批人默认为发起人</p>
          </div>
        </div>
        <div class="approver_block">
          <p>✍审批方式</p>
          <el-radio-group v-model="approverConfig.signType" class="clear">
            <el-radio :value="1">或签（只需一名审批人同意或拒绝即可）</el-radio>
            <br />
            <el-radio :value="2">会签（需所有审批人同意，不限顺序）</el-radio>
            <br />
            <el-radio :value="3">比例签（通过率达到指定比例即算通过）</el-radio>
          </el-radio-group>
          <div v-if="approverConfig.signType === 3">
            <span><b>通过率（%）：</b></span>
            <ElInputNumber v-model="approverConfig.approvePercent" :max="99" :min="1" />
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="按钮设置" name="btnTab">
        <div class="approver_block">
          <p>🚩审批页面按钮权限显示控制</p>
          <el-checkbox
            v-model="checkedOk"
            label="同意"
            border
            style="margin: 6px 0; width: 100%; height: 45px"
          />
          <el-checkbox
            v-model="checkedNot"
            label="不同意"
            border
            style="margin: 6px 0; width: 100%; height: 45px"
          />
          <el-checkbox
            v-model="checkedBack"
            label="打回"
            border
            style="margin: 6px 0; width: 100%; height: 45px"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <BaseButton @click="closeDrawer">取 消</BaseButton>
      <BaseButton type="primary" @click="saveApprover">确 定</BaseButton>
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
import {
  ElDrawer,
  ElTabs,
  ElTabPane,
  ElRadio,
  ElRadioGroup,
  ElCheckbox,
  ElInputNumber
} from 'element-plus'
import $func from '../../utils/index'
import { setRoleRangeTypes, setTypes } from '../../utils/const'
import { useWorkFlowStore } from '@/store/modules/workFlow'
import selectUser from '../dialog/selectUserDialog.vue'
import roleDialog from '../dialog/selectRoleDialog.vue'
import { Icon } from '@/components/Icon'

let approverConfig = ref({})
let approverVisible = ref(false)
let approverRoleVisible = ref(false)
let checkedRoleList = ref([])
let checkedList = ref([])
let store = useWorkFlowStore()
let { setApproverConfig, setApprover } = store
let approverConfig1 = computed(() => store.approverConfig1)
let approverDrawer = computed(() => store.approverDrawer)
let visible = computed({
  get() {
    return approverDrawer.value
  },
  set() {
    closeDrawer()
  }
})
let checkedOk = ref(true)
let checkedNot = ref(true)
let checkedBack = ref(false)
const activeName = ref('baseTab')

watch(approverConfig1, (val) => {
  approverConfig.value = val.value
})

const changeType = () => {
  approverConfig.value.nodeApproveList = []
  approverConfig.value.signType = 1
  approverConfig.value.approvePercent = 50
}
const addApprover = () => {
  approverVisible.value = true
  checkedList.value = approverConfig.value.nodeApproveList
}
const addRoleApprover = () => {
  approverRoleVisible.value = true
  checkedRoleList.value = approverConfig.value.nodeApproveList
}
const sureApprover = (data) => {
  approverConfig.value.nodeApproveList = data
  approverVisible.value = false
}
const sureRoleApprover = (data) => {
  approverConfig.value.nodeApproveList = data
  approverRoleVisible.value = false
}
const saveApprover = () => {
  approverConfig.value.error = !$func.setApproverStr(approverConfig.value)
  setApproverConfig({
    value: approverConfig.value,
    flag: true,
    nodeId: approverConfig1.value.nodeId
  })
  closeDrawer()
}
const closeDrawer = () => {
  setApprover(false)
}
</script>
<style lang="css" scoped>
@import '../../css/base.css';
@import '../../css/workflow.css';

.el-tabs {
  margin-left: 20px !important;
  margin-right: 20px !important;
  height: calc(100% - 110px);
}

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

.approver_content-title {
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  display: inline-block;
  padding: 5px;
  width: 100%;
  background-color: var(--el-border-color);
}

.approver_content,
.approver_block,
.approver_btn {
  .el-radio-group {
    display: unset;
  }
  .el-radio {
    margin-bottom: 20px;
    height: 16px;
  }
}

.approver_select p {
  line-height: 32px;
}

.approver_select select {
  width: 250px;
  height: 32px;
  background: rgba(255, 255, 255, 1);
  border-radius: 4px;
  border: 1px solid rgba(217, 217, 217, 1);
}

.approver_select p.tip {
  margin: 10px 0 22px 0;
  font-size: 12px;
  line-height: 16px;
  color: #f8642d;
}

.approver_text {
  padding: 10px 0px;
  color: #f8642d;
}
.approver_select p:first-of-type,
.approver_block p {
  line-height: 19px;
  font-size: 15px;
  margin-bottom: 14px;
  font-weight: 600;
}
</style>
