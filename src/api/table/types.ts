export type TableSearch = {
  tableCode: string
  params?: Record<string, string | number>
  page?: TablePage
  order?: TableOrder[]
}

export type TablePage = {
  pageSize: number
  currentPage: number
}

export type TableOrder = {
  col: string
  order: 'asc' | 'desc'
}

export type TableData = {
  id: string
  author: string
  title: string
  content: string
  importance: number
  display_time: string
  pageviews: number
}
