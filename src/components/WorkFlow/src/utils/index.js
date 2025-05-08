import { setRoleRangeTypes } from '../utils/const'
function All() {}
All.prototype = {
  arrToStr(arr) {
    if (arr) {
      return arr
        .map((item) => {
          return item.name
        })
        .toString()
    }
  },
  removeEle(arr, elem, key = 'id') {
    var includesIndex
    arr.map((item, index) => {
      if (item[key] === elem[key]) {
        includesIndex = index
      }
    })
    arr.splice(includesIndex, 1)
  },
  setApproverStr(nodeConfig) {
    if (nodeConfig.setType === 1) {
      if (nodeConfig.nodeApproveList.length === 1) {
        return nodeConfig.nodeApproveList[0].name
      } else if (nodeConfig.nodeApproveList.length > 1) {
        if (nodeConfig.signType === 1) {
          return this.arrToStr(nodeConfig.nodeApproveList)
        } else if (nodeConfig.signType === 2) {
          return (
            nodeConfig.nodeApproveList.length +
            '人(' +
            this.arrToStr(nodeConfig.nodeApproveList) +
            ')会签'
          )
        } else if (nodeConfig.signType === 3) {
          return (
            nodeConfig.nodeApproveList.length +
            '人中(' +
            this.arrToStr(nodeConfig.nodeApproveList) +
            ')指定一人审核'
          )
        }
      }
    } else if (nodeConfig.setType === 3) {
      if (nodeConfig.nodeApproveList.length > 0) {
        return (
          '指定' +
          setRoleRangeTypes.find((e) => e.value === nodeConfig.roleRange).label +
          ' (' +
          this.arrToStr(nodeConfig.nodeApproveList) +
          ') 角色'
        )
      }
      return ''
    } else if (nodeConfig.setType === 5) {
      return '发起人自己'
    } else if (nodeConfig.setType === 7) {
      return '自定义'
    }
  }
}

export default new All()
