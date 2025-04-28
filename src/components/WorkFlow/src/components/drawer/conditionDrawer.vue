<!--
 * @Date: 2023-03-15 14:44:17
 * @LastEditors: LDH 574427343@qq.com
 * @LastEditTime: 2023-05-24 15:20:48
 * @FilePath: /flow-designer/src/components/drawer/conditionDrawer.vue
-->

<template>
  <el-drawer
    :append-to-body="true"
    title="条件设置"
    v-model="visible"
    class="set_condition"
    :show-close="false"
    :size="680"
    :before-close="saveCondition"
  >
    <template #header="{ titleId, titleClass }">
      <h3 :id="titleId" :class="titleClass">条件设置</h3>
      <select v-model="conditionConfig.priorityLevel" class="priority_level">
        <option v-for="item in conditionsConfig.conditionNodes.length" :value="item" :key="item"
          >优先级{{ item }}</option
        >
      </select>
    </template>
    <div class="drawer_content">
      <div class="condition_content">
        <p class="tip">当审批单满足以下条件时进入此流程</p>
        <p>🚩条件表达式</p>
        <el-input
          class="m-b-10px"
          placeholder="请填写规范的条件表达式，如：${age > 18} AND ${status == 'approved'}"
          v-model="conditionConfig.conditions"
          type="textarea"
          :validate-event="true"
          @blur="validateUEL"
          :status="isExpressionValid ? '' : 'error'"
          :autosize="{
            maxRows: 10,
            minRows: 2
          }"
        />
        <div v-if="!isExpressionValid" class="error-message text-danger m-b-10px">
          表达式格式不正确，正确格式应为：${表达式}。
        </div>
        <p>🚩解释</p>
        <el-input
          v-model="conditionConfig.nodeDisplayName"
          type="textarea"
          :autosize="{
            maxRows: 10,
            minRows: 2
          }"
        />
      </div>
    </div>
    <template #footer>
      <el-button @click="closeDrawer">取 消</el-button>
      <el-button type="primary" @click="saveCondition">确 定</el-button>
    </template>
  </el-drawer>
</template>
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElDrawer, ElButton, ElInput } from 'element-plus'
import { useWorkFlowStore } from '@/store/modules/workFlow'
import { isEmpty } from '@/utils/is'

let conditionsConfig = ref({
  conditionNodes: []
})
let conditionConfig = ref({})
let PriorityLevel = ref(1)
let store = useWorkFlowStore()
let { setCondition, setConditionsConfig } = store
let conditionsConfig1 = computed(() => store.conditionsConfig1)
let conditionDrawer = computed(() => {
  return store.conditionDrawer
})
let visible = computed({
  get() {
    return conditionDrawer.value
  },
  set() {
    closeDrawer()
  }
})
watch(conditionsConfig1, (val) => {
  conditionsConfig.value = val.value
  PriorityLevel.value = val.priorityLevel
  conditionConfig.value = val.priorityLevel
    ? conditionsConfig.value.conditionNodes[val.priorityLevel - 1]
    : { nodeApproveList: [], conditionList: [] }
})

// 添加UEL表达式验证状态
const isExpressionValid = ref(true)

// 验证UEL表达式
const validateUEL = () => {
  if (!conditionConfig.value.conditions) {
    isExpressionValid.value = true
    return
  }

  try {
    const expr = conditionConfig.value.conditions.trim()

    // 1. 检查括号是否匹配
    const openParenCount = (expr.match(/\(/g) || []).length
    const closeParenCount = (expr.match(/\)/g) || []).length
    if (openParenCount !== closeParenCount) {
      isExpressionValid.value = false
      return
    }

    // 2. 提取所有${}表达式
    const varPattern = /\${([^}]*)}/g
    const variables = expr.match(varPattern)
    if (!variables || variables.length === 0) {
      isExpressionValid.value = false
      return
    }

    // 3. 检查每个${}内部表达式的格式
    for (const variable of variables) {
      const content = variable.slice(2, -1).trim() // 获取${}内的内容

      // 检查${} 内部是否有比较操作符
      if (!/(==|!=|>=|<=|>|<)/.test(content)) {
        isExpressionValid.value = false
        return
      }

      // 检查操作符左右两侧是否有内容
      const operatorMatch = content.match(/(==|!=|>=|<=|>|<)/)
      if (operatorMatch) {
        const parts = content.split(operatorMatch[0])
        if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
          isExpressionValid.value = false
          return
        }
      }
    }

    // 4. 检查${}之外不应该有比较操作符
    // 替换掉所有${}表达式为占位符，然后检查剩余部分
    let exprWithoutVars = expr.replace(varPattern, 'PLACEHOLDER')

    // 在PLACEHOLDER之间应该只有逻辑操作符AND/OR，不应包含比较操作符
    const remainingExpr = exprWithoutVars.split('PLACEHOLDER').join(' ')
    if (/(==|!=|>=|<=|>|<)/.test(remainingExpr)) {
      isExpressionValid.value = false
      return
    }

    // 5. 检查逻辑操作符 AND, OR 的格式
    // 如果有多个表达式，必须用逻辑操作符连接
    if (variables.length > 1) {
      const logicOperatorPattern = /\s(AND|OR)\s|&&|\|\|/
      if (!logicOperatorPattern.test(expr)) {
        isExpressionValid.value = false
        return
      }

      // 检查逻辑操作符前后必须有表达式
      const logicSplit = expr.split(/\s(AND|OR)\s|&&|\|\|/)
      for (const part of logicSplit) {
        const trimmedPart = part.trim()
        if (trimmedPart && !varPattern.test(trimmedPart) && !['AND', 'OR'].includes(trimmedPart)) {
          isExpressionValid.value = false
          return
        }
      }
    }

    // 通过所有检查
    isExpressionValid.value = true
  } catch (e) {
    console.error('UEL验证错误:', e)
    isExpressionValid.value = false
  }
}

// 监听条件变化
watch(
  () => conditionConfig.value.conditions,
  (newVal) => {
    if (newVal) {
      validateUEL()
    } else {
      isExpressionValid.value = true
    }
  }
)

/**条件抽屉的确认 */
const saveCondition = () => {
  if (!isExpressionValid.value) return
  closeDrawer()
  const a = conditionsConfig.value.conditionNodes.splice(PriorityLevel.value - 1, 1) //截取旧下标
  conditionsConfig.value.conditionNodes.splice(conditionConfig.value.priorityLevel - 1, 0, a[0]) //填充新下标
  conditionsConfig.value.conditionNodes.map((item, index) => {
    item.priorityLevel = index + 1
  })
  for (let i = 0; i < conditionsConfig.value.conditionNodes.length; i++) {
    conditionsConfig.value.conditionNodes[i].error = isEmpty(
      conditionsConfig.value.conditionNodes[i].conditions
    )
  }
  setConditionsConfig({
    value: conditionsConfig.value,
    flag: true,
    nodeId: conditionsConfig1.value.nodeId
  })
}
const closeDrawer = () => {
  setCondition(false)
}
</script>
<style lang="css" scoped>
@import '../../css/base.css';
@import '../../css/workflow.css';

ul,
li {
  list-style: none;
}
.set_condition .priority_level {
  position: absolute;
  top: 11px;
  right: 30px;
  width: 100px;
  height: 32px;
  background: rgba(255, 255, 255, 1);
  border-radius: 4px;
  border: 1px solid rgba(217, 217, 217, 1);
  font-size: 12px;
}

.set_condition .condition_content {
  padding: 20px 20px 0;
  flex: 1 !important;
}
.set_condition .el-button {
  margin-bottom: 20px;
}
.set_condition p.tip {
  margin: 20px 0;
  width: 100%;
  text-indent: 17px;
  line-height: 45px;
  background: rgba(241, 249, 255, 1);
  border: 1px solid rgba(64, 163, 247, 1);
  color: #46a6fe;
  font-size: 14px;
}

.set_condition ul {
  max-height: 500px;
  overflow-y: scroll;
  margin-bottom: 20px;
}
.set_condition ul li {
  line-height: 25px;
}
.set_condition ul li span {
  float: left;
  margin-right: 8px;
  width: 150px !important;
  text-align: right;
  color: #0857a1;
}
.set_condition ul li div {
  display: inline-block;
}

.set_condition ul li div p:not(:last-child) {
  margin-bottom: 10px;
}

.set_condition ul li:not(:last-child) > div > p {
  margin-bottom: 20px;
}

.set_condition ul li p.selected_list {
  padding-left: 10px;
  border-radius: 4px;
  min-height: 32px;
  border: 1px solid rgba(217, 217, 217, 1);
  word-break: break-word;
}

.condition_list .el-dialog__body {
  padding: 16px 26px;
}
.condition_list p {
  color: #666666;
  margin-bottom: 10px;
}

.condition_list p.check_box {
  margin-bottom: 0;
  line-height: 30px;
}

.error-message {
  font-size: 12px;
}
.text-danger {
  color: #f56c6c;
}
</style>
