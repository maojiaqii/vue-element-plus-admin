<template>
  <div class="node-wrap" v-if="propsNodeConfig.nodeType !== 2">
    <el-popover
      v-if="isNodeExecuted(propsNodeConfig) && propsNodeConfig.executedInfos"
      placement="right"
      :width="600"
      trigger="click"
      :show-after="200"
    >
      <template #default>
        <el-carousel trigger="click" height="250px">
          <el-carousel-item v-for="item in propsNodeConfig.executedInfos" :key="item">
            <div
              v-if="item.comment"
              class="stamp"
              :class="{
                'stamp-pass': item.comment.startsWith('通过'),
                'stamp-reject': item.comment.startsWith('退回')
              }"
            >
              {{ item.comment.substring(0, 2) }}
            </div>
            <el-descriptions :column="1" border :title="item.activityName">
              <el-descriptions-item>
                <template #label>
                  <Icon icon="ant-design:user-outlined" class="m-r-5px" size="16" />处理人
                </template>
                {{ item.assignee }}
              </el-descriptions-item>
              <el-descriptions-item v-if="false" label="节点类型">{{
                item.activityType
              }}</el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <Icon icon="ep:alarm-clock" class="m-r-5px" size="16" />开始时间
                </template>
                {{ item.startTime }}
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <Icon icon="ep:alarm-clock" class="m-r-5px" size="16" />结束时间
                </template>
                {{ item.endTime }}
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <Icon icon="ant-design:clock-circle-outlined" class="m-r-5px" size="16" />耗时
                </template>
                <el-tag :type="item.durationInMin === -1 ? 'primary' : 'success'">{{
                  item.durationInMin === -1
                    ? '进行中'
                    : item.durationInMin === 0
                      ? '少于1分钟'
                      : item.durationInMin + '分钟'
                }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <Icon icon="tdesign:pen" class="m-r-5px" size="16" />处理意见
                </template>
                <span
                  v-if="item.comment && item.comment.length > 3 && item.comment.length > 33"
                  class="comment-ellipsis"
                  :title="item.comment.substring(3)"
                  >{{ item.comment.substring(3, 33) + '...' }}</span
                >
                <span v-else>{{
                  item.comment && item.comment.length > 3 && item.comment.substring(3)
                }}</span>
              </el-descriptions-item>
            </el-descriptions>
          </el-carousel-item>
        </el-carousel>
      </template>
      <template #reference>
        <div
          class="node-wrap-box"
          :class="[
            propsNodeConfig.nodeType === 1 ? 'start-node' : '',
            propsNodeConfig.error ? 'active error' : '',
            isNodeExecuted(propsNodeConfig) ? 'executed' : ''
          ]"
        >
          <div class="title" :style="`background: rgb(${bgColors[propsNodeConfig.nodeType]});`">
            <Icon
              :icon="
                propsNodeConfig.nodeType === 1
                  ? 'tdesign:user-business'
                  : propsNodeConfig.nodeType === 4
                    ? 'tdesign:user-transmit'
                    : 'tdesign:user-visible'
              "
              :size="14"
            />
            <span v-if="propsNodeConfig.nodeType === 1">{{ propsNodeConfig.nodeName }}</span>
            <template v-else>
              <input
                v-if="isInput && !previewMode"
                type="text"
                class="flow-input editable-title-input"
                @blur="blurEvent()"
                @focus="$event.currentTarget.select()"
                v-focus
                v-model="propsNodeConfig.nodeName"
                :placeholder="defaultText"
              />
              <span v-else class="editable-title" @click="!previewMode && clickEvent()">{{
                propsNodeConfig.nodeName
              }}</span>
              <i v-if="!previewMode" class="flowicon flowicon-close close" @click="delNode"></i>
            </template>
          </div>
          <div class="content" @click="!previewMode && setPerson()">
            <div class="text">
              <span class="placeholder" v-if="!showText">请选择{{ defaultText }}</span>
              {{ showText }}
            </div>
            <div v-if="!previewMode" class="arrow">
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </div>
      </template>
    </el-popover>
    <div
      v-else
      class="node-wrap-box"
      :class="[
        propsNodeConfig.nodeType === 1 ? 'start-node' : '',
        propsNodeConfig.error ? 'active error' : '',
        isNodeExecuted(propsNodeConfig) ? 'executed' : ''
      ]"
    >
      <div class="title" :style="`background: rgb(${bgColors[propsNodeConfig.nodeType]});`">
        <Icon
          :icon="
            propsNodeConfig.nodeType === 1
              ? 'tdesign:user-business'
              : propsNodeConfig.nodeType === 4
                ? 'tdesign:user-transmit'
                : 'tdesign:user-visible'
          "
          :size="14"
        />
        <span v-if="propsNodeConfig.nodeType === 1">{{ propsNodeConfig.nodeName }}</span>
        <template v-else>
          <input
            v-if="isInput && !previewMode"
            type="text"
            class="flow-input editable-title-input"
            @blur="blurEvent()"
            @focus="$event.currentTarget.select()"
            v-focus
            v-model="propsNodeConfig.nodeName"
            :placeholder="defaultText"
          />
          <span v-else class="editable-title" @click="!previewMode && clickEvent()">{{
            propsNodeConfig.nodeName
          }}</span>
          <i v-if="!previewMode" class="flowicon flowicon-close close" @click="delNode"></i>
        </template>
      </div>
      <div class="content" @click="!previewMode && setPerson()">
        <div class="text">
          <span class="placeholder" v-if="!showText">请选择{{ defaultText }}</span>
          {{ showText }}
        </div>
        <div v-if="!previewMode" class="arrow">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    </div>
    <addNode v-model:childNodeP="propsNodeConfig.childNode" :preview-mode="previewMode" />
  </div>
  <div class="branch-wrap" v-if="propsNodeConfig.nodeType === 2">
    <div class="branch-box-wrap">
      <div class="branch-box">
        <button v-if="!previewMode" class="add-branch" @click="addTerm">添加条件</button>
        <div
          class="col-box"
          v-for="(item, index) in propsNodeConfig.conditionNodes"
          :key="index"
          :class="[{ 'executed-branch': isNodeExecuted(item) }]"
        >
          <div class="condition-node">
            <div class="condition-node-box">
              <div
                class="auto-judge"
                :class="[item.error ? 'error active' : '', isNodeExecuted(item) ? 'executed' : '']"
              >
                <div
                  class="sort-left"
                  v-if="index !== 0 && !previewMode"
                  @click="arrTransfer(index, -1)"
                  >&lt;</div
                >
                <div class="title-wrapper">
                  <Icon icon="tdesign:tree-square-dot" :size="14" />
                  <input
                    v-if="isInputList[index] && !previewMode"
                    type="text"
                    class="flow-input editable-title-input"
                    style="width: 60%"
                    @blur="blurEvent(index)"
                    @focus="$event.currentTarget.select()"
                    v-focus
                    v-model="item.nodeName"
                  />
                  <span v-else class="editable-title" @click="!previewMode && clickEvent(index)">{{
                    item.nodeName
                  }}</span>
                  <span
                    class="priority-title"
                    @click="!previewMode && setPerson(item.priorityLevel)"
                    >优先级{{ item.priorityLevel }}</span
                  >
                  <i
                    v-if="!previewMode"
                    class="flowicon flowicon-close close m-t-7px"
                    @click="delTerm(index)"
                  ></i>
                </div>
                <div
                  class="sort-right"
                  v-if="index !== propsNodeConfig.conditionNodes.length - 1 && !previewMode"
                  @click="arrTransfer(index)"
                  >&gt;</div
                >
                <div class="content" @click="!previewMode && setPerson(item.priorityLevel)">{{
                  item.nodeDisplayName || '暂无说明'
                }}</div>
              </div>
              <addNode v-model:childNodeP="item.childNode" :preview-mode="previewMode" />
            </div>
          </div>
          <nodeWrap
            v-if="item.childNode"
            v-model:nodeConfig="item.childNode"
            :preview-mode="previewMode"
          />
          <template v-if="index === 0">
            <div
              class="top-left-cover-line"
              :class="[{ 'executed-line': isNodeExecuted(propsNodeConfig) }]"
            ></div>
            <div
              class="bottom-left-cover-line"
              :class="[{ 'executed-line': isNodeExecuted(item) }]"
            ></div>
          </template>
          <template v-if="index === propsNodeConfig.conditionNodes.length - 1">
            <div
              class="top-right-cover-line"
              :class="[{ 'executed-line': isNodeExecuted(propsNodeConfig) }]"
            ></div>
            <div
              class="bottom-right-cover-line"
              :class="[{ 'executed-line': isNodeExecuted(item) }]"
            ></div>
          </template>
        </div>
      </div>
      <addNode v-model:childNodeP="propsNodeConfig.childNode" :preview-mode="previewMode" />
    </div>
  </div>
  <nodeWrap
    v-if="propsNodeConfig.childNode"
    v-model:nodeConfig="propsNodeConfig.childNode"
    :preview-mode="previewMode"
  />
</template>
<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import $func from '../../utils/index'
import { useWorkFlowStore } from '@/store/modules/workFlow'
import { bgColors, placeholderList } from '../../utils/const'
import { NodeUtils } from '../../utils/nodeUtils'
import AddNode from './addNode.vue'
import {
  ElPopover,
  ElDescriptions,
  ElDescriptionsItem,
  ElCarousel,
  ElCarouselItem,
  ElTag
} from 'element-plus'
import { Icon } from '@/components/Icon'

let props = defineProps({
  nodeConfig: {
    type: Object,
    default: () => ({})
  },
  flowPermission: {
    type: Array,
    default: () => []
  },
  previewMode: {
    type: Boolean,
    default: false
  }
})
const propsNodeConfig = ref()
const isInputList = ref([])
let isInput = ref(false)

// 添加这个watch以确保props变化时更新ref
watch(
  () => props.nodeConfig,
  (newVal) => {
    if (newVal !== propsNodeConfig.value) {
      propsNodeConfig.value = newVal
    }
  },
  { deep: true, immediate: true }
)

let defaultText = computed(() => {
  return placeholderList[propsNodeConfig.value.nodeType]
})

let showText = computed(() => {
  if (propsNodeConfig.value.nodeType === 1) return $func.arrToStr(props.flowPermission) || '所有人'
  if (propsNodeConfig.value.nodeType === 4) return $func.setApproverStr(propsNodeConfig.value) || ''
  if (propsNodeConfig.value.nodeType === 6) return $func.setApproverStr(propsNodeConfig.value) || ''
  return ''
})

propsNodeConfig.value.nodeDisplayName = showText.value

onMounted(() => {
  if (propsNodeConfig.value.nodeType === 4) {
    propsNodeConfig.value.error = !$func.setApproverStr(propsNodeConfig.value)
  } else if (propsNodeConfig.value.nodeType === 6) {
    propsNodeConfig.value.error = !$func.setApproverStr(propsNodeConfig.value)
  }
})
let emits = defineEmits(['update:nodeConfig', 'update:flowPermission'])
let store = useWorkFlowStore()
let {
  setPromoter,
  setApprover,
  setCopyer,
  setCondition,
  setFlowPermission,
  setApproverConfig,
  setCopyerConfig,
  setConditionsConfig
} = store
let flowPermission1 = computed(() => store.flowPermission1)
let approverConfig1 = computed(() => store.approverConfig1)
let copyerConfig1 = computed(() => store.copyerConfig1)
let conditionsConfig1 = computed(() => store.conditionsConfig1)

watch(flowPermission1, (flow) => {
  if (!props.previewMode && flow.flag && flow.id === propsNodeConfig.value.nodeId) {
    emits('update:flowPermission', flow.value)
  }
})
watch(
  approverConfig1,
  (approver) => {
    if (!props.previewMode && approver.flag && approver.nodeId === propsNodeConfig.value.nodeId) {
      // 创建一个不包含 nodeDisplayName 的对象副本
      const approverValueCopy = JSON.parse(JSON.stringify(approver.value))
      if (approverValueCopy.nodeDisplayName !== undefined) {
        delete approverValueCopy.nodeDisplayName
      }
      emits('update:nodeConfig', approverValueCopy)
    }
  },
  { deep: true }
)

watch(
  copyerConfig1,
  (copyer) => {
    if (!props.previewMode && copyer.flag && copyer.nodeId === propsNodeConfig.value.nodeId) {
      // 创建一个不包含 nodeDisplayName 的对象副本
      const copyerValueCopy = JSON.parse(JSON.stringify(copyer.value))
      if (copyerValueCopy.nodeDisplayName !== undefined) {
        delete copyerValueCopy.nodeDisplayName
      }
      emits('update:nodeConfig', copyerValueCopy)
    }
  },
  { deep: true }
)

watch(
  conditionsConfig1,
  (condition) => {
    if (!props.previewMode && condition.flag && condition.nodeId === propsNodeConfig.value.nodeId) {
      // 创建一个不包含 nodeDisplayName 的对象副本
      const conditionValueCopy = JSON.parse(JSON.stringify(condition.value))
      if (conditionValueCopy.nodeDisplayName !== undefined) {
        delete conditionValueCopy.nodeDisplayName
      }
      emits('update:nodeConfig', conditionValueCopy)
    }
  },
  { deep: true }
)

const clickEvent = (index) => {
  if (props.previewMode) return

  if (index || index === 0) {
    isInputList.value[index] = true
  } else {
    isInput.value = true
  }
}
const blurEvent = (index) => {
  if (index || index === 0) {
    isInputList.value[index] = false
    propsNodeConfig.value.conditionNodes[index].nodeName =
      propsNodeConfig.value.conditionNodes[index].nodeName || '条件'
  } else {
    isInput.value = false
    propsNodeConfig.value.nodeName = propsNodeConfig.value.nodeName || defaultText
  }
}
const delNode = () => {
  emits('update:nodeConfig', propsNodeConfig.value.childNode)
}
const addTerm = () => {
  let len = propsNodeConfig.value.conditionNodes.length + 1
  let n_name = '条件' + len
  propsNodeConfig.value.conditionNodes.push(NodeUtils.createConditionNode(n_name, null, len, 0))
  emits('update:nodeConfig', propsNodeConfig.value)
}
const delTerm = (index) => {
  propsNodeConfig.value.conditionNodes.splice(index, 1)
  propsNodeConfig.value.conditionNodes.map((item, index) => {
    item.priorityLevel = index + 1
    item.nodeName = `条件${index + 1}`
  })
  emits('update:nodeConfig', propsNodeConfig.value)
  if (propsNodeConfig.value.conditionNodes.length === 1) {
    if (propsNodeConfig.value.childNode) {
      if (propsNodeConfig.value.conditionNodes[0].childNode) {
        reData(propsNodeConfig.value.conditionNodes[0].childNode, propsNodeConfig.value.childNode)
      } else {
        propsNodeConfig.value.conditionNodes[0].childNode = propsNodeConfig.value.childNode
      }
    }
    emits('update:nodeConfig', propsNodeConfig.value.conditionNodes[0].childNode)
  }
}
const reData = (data, addData) => {
  if (!data.childNode) {
    data.childNode = addData
  } else {
    reData(data.childNode, addData)
  }
}
const setPerson = (priorityLevel) => {
  const { nodeType } = propsNodeConfig.value
  if (nodeType === 4) {
    setApprover({ nodeId: propsNodeConfig.value.nodeId })
    setApproverConfig({
      value: {
        ...JSON.parse(JSON.stringify(propsNodeConfig.value)),
        ...{ setType: propsNodeConfig.value.setType || 1 }
      },
      flag: false,
      nodeId: propsNodeConfig.value.nodeId
    })
  } else if (nodeType === 6) {
    setCopyer({ nodeId: propsNodeConfig.value.nodeId })
    setCopyerConfig({
      value: JSON.parse(JSON.stringify(propsNodeConfig.value)),
      flag: false,
      nodeId: propsNodeConfig.value.nodeId
    })
  } else if (nodeType === 2) {
    setCondition({ nodeId: propsNodeConfig.value.nodeId, level: priorityLevel })
    setConditionsConfig({
      value: JSON.parse(JSON.stringify(propsNodeConfig.value)),
      priorityLevel,
      flag: false,
      nodeId: propsNodeConfig.value.nodeId
    })
  }
}
const arrTransfer = (index, type = 1) => {
  //向左-1,向右1
  propsNodeConfig.value.conditionNodes[index] = propsNodeConfig.value.conditionNodes.splice(
    index + type,
    1,
    propsNodeConfig.value.conditionNodes[index]
  )[0]
  propsNodeConfig.value.conditionNodes.map((item, index) => {
    item.priorityLevel = index + 1
  })
  emits('update:nodeConfig', propsNodeConfig.value)
}
const isNodeExecuted = (node) => {
  return node && node.executed === true
}
</script>
<style lang="css" scoped>
@import '../../css/base.css';
@import '../../css/workflow.css';

.promoter_person .el-dialog__body {
  padding: 16px 24px;
  border-radius: 8px;
}

/* 优化节点样式 */
.node-wrap-box {
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.node-wrap-box .title {
  font-weight: 500;
  letter-spacing: 0.5px;
}

.node-wrap-box .content {
  background: linear-gradient(to bottom, #ffffff, #f9fafc);
  transition: all 0.3s;
}

.node-wrap-box .content:hover {
  background: linear-gradient(to bottom, #f0f9ff, #e6f7ff);
}

.node-wrap-box .content .text {
  line-height: 1.6;
}

.node-wrap-box .content .arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8c8c8c;
  transition: all 0.3s;
}

.node-wrap-box:hover .content .arrow {
  transform: translateY(-50%) translateX(3px);
  color: #40a9ff;
}

.node-wrap-box.error:hover .content .arrow {
  color: #ff4d4f;
}

/* 执行状态优化 */
.executed .content {
  background: linear-gradient(to bottom, #f0f9ff, #e6f7ff);
}

/* 修复条件节点样式 */
.condition-node-box {
  position: relative;
}

/* 添加执行信息弹窗样式 */
:deep(.el-popover) {
  min-width: 300px;
  padding: 12px;
  z-index: 2000;
}

:deep(.el-descriptions) {
  margin: 0;
}

:deep(.el-descriptions__label) {
  width: 100px;
  color: #606266;
}

:deep(.el-descriptions__content) {
  color: #303133;
}

/* 优化节点悬浮效果 */
.node-wrap-box {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.node-wrap-box:hover {
  transform: translateY(-2px);
  box-shadow:
    0 12px 24px -8px rgba(0, 0, 0, 0.12),
    0 12px 32px 0 rgba(0, 0, 0, 0.08);
}

.stamp {
  position: absolute;
  top: 12px;
  right: 16px;
  z-index: 10;
  padding: 6px 18px;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  opacity: 0.8;
  transform: rotate(-15deg);
  pointer-events: none;
  user-select: none;
  letter-spacing: 4px;
}
.stamp-pass {
  background: #52c41a;
}
.stamp-reject {
  background: #f5222d;
}

.comment-ellipsis {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
