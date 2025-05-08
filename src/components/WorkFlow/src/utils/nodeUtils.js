export class NodeUtils {
  /**
   * 根据自增数生成64进制id
   * @returns 64进制id字符串
   */
  static idGenerator() {
    let qutient = new Date() - new Date('2024-05-01')
    qutient += Math.ceil(Math.random() * 1000) // 防止重複
    const chars = '0123456789ABCDEFGHIGKLMNOPQRSTUVWXYZabcdefghigklmnopqrstuvwxyz'
    const charArr = chars.split('')
    const radix = chars.length
    const res = []
    do {
      let mod = qutient % radix
      qutient = (qutient - mod) / radix
      res.push(charArr[mod])
    } while (qutient)
    return 'F' + res.join('').toUpperCase()
  }

  /**
   * 创建审批人对象
   */
  static createApproveNode() {
    return {
      nodeId: this.idGenerator(),
      nodeName: '审核人',
      nodeType: 4,
      nodeFrom: '',
      nodeTo: [],
      setType: 1,
      roleRange: 1,
      signType: 1,
      approvePercent: 50,
      childNode: undefined,
      error: true,
      buttons: {
        startPage: [1],
        approvalPage: [3, 4],
        viewPage: [0]
      },
      nodeApproveList: []
    }
  }
  /**
   * 创建抄送人对象
   * @returns object
   */
  static createCopyNode() {
    return {
      nodeId: this.idGenerator(),
      nodeName: '抄送人',
      nodeType: 6,
      nodeFrom: '',
      nodeTo: [],
      setType: 1,
      error: true,
      ccFlag: 1,
      childNode: undefined,
      property: {},
      buttons: {
        startPage: [],
        approvalPage: [],
        viewPage: []
      },
      nodeApproveList: []
    }
  }
  /**
   * 创建网关对象
   * @returns object
   */
  static createGatewayNode(child) {
    return {
      nodeId: this.idGenerator(),
      nodeName: '网关',
      nodeType: 2,
      nodeFrom: '',
      nodeTo: [],
      childNode: null,
      error: true,
      property: null,
      conditionNodes: [
        this.createConditionNode('条件1', child, 1, 0),
        this.createConditionNode('条件2', null, 2, 0)
      ]
    }
  }
  /**
   * 创建条件对象
   * @returns object
   */
  static createConditionNode(name, childNode, priority, isDefault) {
    return {
      nodeId: this.idGenerator(),
      nodeName: name || '条件1',
      nodeDisplayName: name || '条件1',
      nodeType: 3,
      nodeFrom: '',
      nodeTo: [],
      priorityLevel: priority,
      conditionList: [],
      conditions: '',
      error: true,
      childNode: childNode,
      isDefault: isDefault || 0
    }
  }
  /**
   * 初始化流程数据
   * @returns object
   */
  static createStartNode() {
    return [
      {
        nodeId: 'FSTARTERIDM',
        nodeType: 1,
        nodeFrom: '',
        prevId: [],
        nodeName: '发起人',
        nodeDisplayName: '发起人',
        remark: '',
        nodeTo: null,
        property: null,
        params: null,
        buttons: null,
        conditionNodes: []
      }
    ]
  }
}
