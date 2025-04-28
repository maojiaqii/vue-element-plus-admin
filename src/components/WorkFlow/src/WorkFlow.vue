<template>
  <div class="workflow-container" :class="{ 'preview-mode': previewMode }">
    <div class="my-nav-content">
      <section class="dingflow-design" ref="dingflowDesignRef">
        <div class="zoom">
          <BaseButton :disabled="nowVal === '30'" @click="zoomOut">
            <Icon icon="ep:minus" />
          </BaseButton>
          <span>{{ nowVal }}%</span>
          <BaseButton :disabled="nowVal === '500'" @click="zoomIn">
            <Icon icon="ep:plus" />
          </BaseButton>
          <BaseButton :disabled="nowVal === 100" @click="zoomReset">
            <Icon icon="ep:refresh" />
          </BaseButton>
        </div>
        <div class="box-scale" ref="boxScaleRef">
          <nodeWrap v-model:nodeConfig="nodeConfig" :preview-mode="previewMode" />
          <div class="end-node" :class="{ executed: finished }">
            <div class="end-node-circle"></div>
            <div class="end-node-text">流程结束</div>
          </div>
        </div>
      </section>
    </div>
    <errorDialog v-model:visible="tipVisible" :list="tipList" />
    <!--    <promoterDrawer />-->
    <approverDrawer :directorMaxLevel="directorMaxLevel" />
    <copyerDrawer />
    <conditionDrawer />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useWorkFlowStore } from '@/store/modules/workFlow'
import { nodeTypeList } from './utils/const'
import errorDialog from './components/dialog/errorDialog.vue'
import promoterDrawer from './components/drawer/promoterDrawer.vue'
import approverDrawer from './components/drawer/approverDrawer.vue'
import copyerDrawer from './components/drawer/copyerDrawer.vue'
import conditionDrawer from './components/drawer/conditionDrawer.vue'
import nodeWrap from './components/node/nodeWrap.vue'
import { resetImage, wheelZoomFunc, zoomInit } from './utils/zoom.js'
import { FormatDisplayUtils } from './utils/formatdisplay_data'
import { FormatUtils } from './utils/formatcommit_data'
import { propTypes } from '@/utils/propTypes'

const emit = defineEmits(['update:nodeConfig', 'nextChange'])
const props = defineProps({
  nodeConfig: {
    type: Object,
    default: () => {}
  },
  previewMode: propTypes.bool.def(false),
  finished: propTypes.bool.def(false)
})

const dingflowDesignRef = ref(null)
const boxScaleRef = ref(null)
const tipList = ref([])
const tipVisible = ref(false)
const nowVal = ref(100)
const nodeConfig = computed(() => {
  return FormatDisplayUtils.getToTree(props.nodeConfig) || {}
})
const directorMaxLevel = ref(3)

onMounted(() => {
  zoomInit(dingflowDesignRef, boxScaleRef, (val) => {
    nowVal.value = val
  })
})
/**
 * 判断流程中是否有审批节点
 * @param treeNode
 */
const preTreeIsApproveNode = (treeNode) => {
  if (!treeNode) return false
  if (treeNode.nodeType === 4) {
    return true
  } else {
    return preTreeIsApproveNode(treeNode.childNode)
  }
}
/** 节点验证 */
const validateErr = ({ childNode }) => {
  if (childNode) {
    let { nodeType, error, nodeName, conditionNodes } = childNode
    if (nodeType === 1) {
      validateErr(childNode)
    } else if (nodeType === 2) {
      validateErr(childNode)
      for (var i = 0; i < conditionNodes.length; i++) {
        if (conditionNodes[i].error) {
          tipList.value.push({ nodeName: conditionNodes[i].nodeName, nodeType: '条件' })
        }
        validateErr(conditionNodes[i])
      }
    } else if (nodeType === 3) {
      validateErr(childNode)
    } else if (nodeType === 4 || nodeType === 6) {
      if (error) {
        tipList.value.push({
          nodeName: nodeName,
          nodeType: nodeTypeList[nodeType]
        })
      }
      validateErr(childNode)
    }
  } else {
    childNode = null
  }
}

/** 页面放大 */
function zoomIn() {
  wheelZoomFunc({ scaleFactor: parseInt(nowVal.value) / 100 + 0.1, isExternalCall: true })
}

/** 页面缩小 */
function zoomOut() {
  wheelZoomFunc({ scaleFactor: parseInt(nowVal.value) / 100 - 0.1, isExternalCall: true })
}

function zoomReset() {
  resetImage()
}

const getJson = () => {
  return JSON.parse(JSON.stringify(nodeConfig.value))
}

const validate = () => {
  tipList.value = []
  validateErr(nodeConfig.value)
  if (tipList.value.length !== 0) {
    tipVisible.value = true
    return false
  } else {
    return true
  }
}

// 给父级页面提供得获取本页数据得方法
const getData = () => {
  return FormatUtils.formatSettings(getJson())
}

/** 判断结束节点是否已执行 */
const isEndNodeExecuted = () => {
  // 寻找最后一个节点
  const findLastNode = (node) => {
    if (!node) return null
    if (!node.childNode) return node
    return findLastNode(node.childNode)
  }

  const lastNode = findLastNode(nodeConfig.value)
  return lastNode && lastNode.executed
}

defineExpose({
  getData,
  validate
})
</script>
<style lang="css" scoped>
@import './css/base.css';
@import './css/workflow.css';
</style>
