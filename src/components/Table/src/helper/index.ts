import { TablePage, TableSearch } from '@/api/table/types'
import { getTableDataApi } from '@/api/common'
import { ElMessage } from 'element-plus'

export const setIndex = (reserveIndex: boolean, index: number, size: number, current: number) => {
  const newIndex = index + 1
  if (reserveIndex) {
    return size * (current - 1) + newIndex
  } else {
    return newIndex
  }
}

export const setData = async (query: TableSearch | undefined, page: TablePage | undefined) => {
  const tableData = { total: 0, data: [] }
  if (query) {
    query.page = page
    const res = await getTableDataApi(query)
    if (res.code === 200) {
      tableData.total = res.data?.total
      tableData.data = res.data?.list
    } else {
      ElMessage.error(res.msg)
    }
  }
  return tableData
}
