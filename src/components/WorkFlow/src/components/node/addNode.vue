<template>
  <div class="add-node-btn-box">
    <div class="add-node-btn">
      <el-popover
        v-if="!previewMode"
        placement="right-start"
        v-model:visible="visible"
        width="auto"
      >
        <div class="add-node-popover-body">
          <a class="add-node-popover-item approver" @click="addType(4)">
            <div class="item-wrapper">
              <span class="iconfont">
                <img src="@/assets/svgs/approve.svg" width="35" height="35" alt="" />
              </span>
            </div>
            <p>审批人</p>
          </a>
          <a class="add-node-popover-item notifier" @click="addType(6)">
            <div class="item-wrapper">
              <span class="iconfont">
                <img src="@/assets/svgs/copy-user.svg" width="35" height="35" alt="" />
              </span>
            </div>
            <p>抄送人</p>
          </a>
          <a class="add-node-popover-item condition" @click="addType(2)">
            <div class="item-wrapper">
              <span class="iconfont">
                <img src="@/assets/svgs/condition.svg" width="35" height="35" alt="" />
              </span>
            </div>
            <p>条件分支</p>
          </a>
        </div>
        <template #reference>
          <button class="btn" type="button">
            <span class="iconfont">
              <img
                src="@/assets/svgs/addbtn.svg"
                width="16"
                height="16"
                alt="添加节点"
                style="filter: brightness(0) invert(1)"
              />
            </span>
          </button>
        </template>
      </el-popover>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { ElPopover } from 'element-plus'
import { NodeUtils } from '../../utils/nodeUtils'

let props = defineProps({
  childNodeP: {
    type: Object,
    default: () => null
  },
  previewMode: {
    type: Boolean,
    default: false
  }
})

let emits = defineEmits(['update:childNodeP'])
let visible = ref(false)
const addType = (type) => {
  visible.value = false
  let data
  // 4: 审核人；6：抄送人；2：条件分支
  if (type === 4) {
    data = NodeUtils.createApproveNode()
    if (props.childNodeP) {
      data.childNode = JSON.parse(JSON.stringify(props.childNodeP))
    }
  } else if (type === 6) {
    data = NodeUtils.createCopyNode()
    if (props.childNodeP) {
      data.childNode = JSON.parse(JSON.stringify(props.childNodeP))
    }
  } else if (type === 2) {
    data = NodeUtils.createGatewayNode(
      props.childNodeP ? JSON.parse(JSON.stringify(props.childNodeP)) : null
    )
  }
  emits('update:childNodeP', data)
}
</script>
<style lang="css" scoped>
@import '../../css/base.css';
@import '../../css/workflow.css';

.add-node-btn-box {
  width: 240px;
  display: -webkit-inline-box;
  display: -ms-inline-flexbox;
  display: inline-flex;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  -webkit-box-flex: 1;
  -ms-flex-positive: 1;
  position: relative;
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    margin: auto;
    width: 2px;
    height: 100%;
    background-color: #cacaca; /*审核、抄送节点所有竖线条颜色*/
  }
  .add-node-btn {
    user-select: none;
    width: 240px;
    padding: 20px 0 32px;
    display: flex;
    -webkit-box-pack: center;
    justify-content: center;
    flex-shrink: 0;
    -webkit-box-flex: 1;
    flex-grow: 1;
    .btn {
      outline: none;
      box-shadow: 0 6px 16px -6px rgba(0, 0, 0, 0.12);
      width: 36px;
      height: 36px;
      z-index: 10;
      background: linear-gradient(135deg, #40a9ff, #1890ff);
      border-radius: 50%;
      position: relative;
      border: none;
      line-height: 36px;
      -webkit-transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      .iconfont {
        color: #fff;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
      &:hover {
        transform: scale(1.15);
        box-shadow: 0 12px 24px -4px rgba(24, 144, 255, 0.3);
      }
      &:active {
        transform: scale(1.05);
        background: linear-gradient(135deg, #1890ff, #096dd9);
        box-shadow: 0 6px 16px -6px rgba(0, 0, 0, 0.2);
      }
    }
  }
}

.add-node-popover-body {
  display: flex;
  padding: 8px;
  background: #fff;
  border-radius: 8px;
  box-shadow:
    0 6px 16px -8px rgba(0, 0, 0, 0.08),
    0 9px 28px 0 rgba(0, 0, 0, 0.05);
  .add-node-popover-item {
    margin-right: 16px;
    padding: 12px 8px;
    cursor: pointer;
    text-align: center;
    flex: 1;
    color: #191f25 !important;
    border-radius: 6px;
    transition: all 0.3s;
    &:last-child {
      margin-right: 0;
    }
    .item-wrapper {
      user-select: none;
      display: inline-block;
      width: 70px;
      height: 70px;
      margin-bottom: 8px;
      background: #fff;
      border: 1px solid #e8e8e8;
      border-radius: 12px;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      .iconfont {
        font-size: 35px;
        line-height: 65px;
      }
    }
    p {
      margin-top: 8px;
      font-size: 14px;
      transition: all 0.3s;
    }
    &:hover {
      background-color: #f5f7fa;
      .item-wrapper {
        background: linear-gradient(135deg, #40a9ff, #1890ff);
        border-color: #1890ff;
        transform: translateY(-4px);
        box-shadow: 0 10px 20px -4px rgba(24, 144, 255, 0.3);
        img {
          filter: brightness(0) invert(1);
        }
      }
      p {
        color: #1890ff;
        font-weight: 500;
      }
    }
  }
}
</style>
