const isEmptyArray = (data) => (Array.isArray(data) ? data.length === 0 : true)

export class FormatUtils {
  /**
   * 对基础设置,高级设置等设置页内容进行格式化
   * @param param
   */
  static formatSettings(param) {
    let treeList = this.flattenMapTreeToList(param)
    let combinationList = this.getEndpointNodeId(treeList)
    return this.cleanNodeList(combinationList)
  }
  /**
   * 展平树结构
   * @param {Object} treeData  - 节点数据
   * @returns Array - 节点数组
   */
  static flattenMapTreeToList(treeData) {
    let nodeData = []
    function traverse(node) {
      if (node.nodeType === 2) {
        if (node.childNode) {
          node.childNode.nodeFrom = node.nodeId
          traverse(node.childNode)
        }
        if (!isEmptyArray(node.conditionNodes)) {
          for (const child of node.conditionNodes) {
            child.nodeFrom = node.nodeId
            traverse(child)
          }
          node.nodeTo = node.conditionNodes.map((item) => item.nodeId)
          delete node.conditionNodes
        }
      } else if (node.childNode) {
        node.nodeTo = [node.childNode.nodeId]
        node.childNode.nodeFrom = node.nodeId
        traverse(node.childNode)
      }
      delete node.childNode
      nodeData.push(node)
    }
    traverse(treeData)
    return nodeData
  }
  /**
   * 递归处理网关节点下属子节点的nodeTo数据
   * @param { Array } parmData -节点关系数组
   * @returns
   */
  static getEndpointNodeId(parmData) {
    if (isEmptyArray(parmData)) return parmData

    let gatewayList = parmData.filter((c) => {
      return c.nodeType === 2
    })

    if (isEmptyArray(gatewayList)) return parmData

    let nodesGroup = {}
    for (let t of parmData) {
      if (nodesGroup.hasOwnProperty(t.nodeFrom)) {
        nodesGroup[t.nodeFrom].push(t)
      } else {
        nodesGroup[t.nodeFrom] = [t]
      }
    }
    for (let gateway of gatewayList) {
      if (nodesGroup.hasOwnProperty(gateway.nodeId)) {
        let itemNodes = nodesGroup[gateway.nodeId]
        let comNode = itemNodes.find((c) => {
          return c.nodeType !== 3
        })
        if (!comNode) continue
        let conditionList = itemNodes.filter((c) => {
          return c.nodeId !== comNode.nodeId
        })
        for (let itemNode of conditionList) {
          function internalTraverse(info) {
            if (info) {
              if (!nodesGroup[info.nodeId]) {
                info.nodeTo = [comNode.nodeId]
              } else {
                let tempNode = nodesGroup[info.nodeId]
                if (Array.isArray(tempNode)) {
                  for (let t_item of tempNode) {
                    internalTraverse(t_item)
                  }
                } else {
                  internalTraverse(tempNode)
                }
              }
            }
          }
          internalTraverse(itemNode)
        }
      }
    }
    return parmData
  }
  /**
   * 清理节点数据
   * @param { Array } arr -节点数组
   * @returns
   */
  static cleanNodeList(arr) {
    let nodeIds = arr.map((c) => {
      return c.nodeId
    })
    for (const node of arr) {
      node.nodeTo = Array.from(new Set(node.nodeTo))
      if (!isEmptyArray(node.nodeTo)) {
        node.nodeTo = node.nodeTo.filter((key) => {
          return nodeIds.indexOf(key) > -1
        })
      }
    }
    return arr
  }
}
