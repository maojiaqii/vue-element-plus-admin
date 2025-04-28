import { NodeUtils } from './nodeUtils'
const isEmptyArray = (data) => (Array.isArray(data) ? data.length === 0 : true)

export class FormatDisplayUtils {
  /**
   * 格式化显示数据
   * @param {Array} paramData
   * @returns Object
   */
  static getToTree(paramData) {
    return this.depthConverterToTree(
      isEmptyArray(paramData) ? NodeUtils.createStartNode() : paramData
    )
  }

  /**
   * List 转成tree结构
   * @param {Array} paramData
   * @returns
   */
  static depthConverterToTree(paramData) {
    if (isEmptyArray(paramData)) return
    let nodesGroup = {},
      startNode = {}
    for (let t of paramData) {
      if (nodesGroup.hasOwnProperty(t.nodeFrom)) {
        nodesGroup[t.nodeFrom].push(t)
      } else {
        nodesGroup[t.nodeFrom] = [t]
      }
    }
    for (let node of paramData) {
      if (1 === node.nodeType) {
        startNode = node
      }
      Object.assign(node, { conditionNodes: [] })
      let currNodeId = node.nodeId
      if (nodesGroup.hasOwnProperty(currNodeId)) {
        let itemNodes = nodesGroup[currNodeId]
        for (let itemNode of itemNodes) {
          if (3 === itemNode.nodeType) {
            node.conditionNodes.push(itemNode)
          } else {
            node.childNode = itemNode
          }
        }
      }
    }
    return startNode
  }
}
