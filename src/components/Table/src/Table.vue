<script lang="tsx">
import {
  ElTable,
  ElTableColumn,
  ElPagination,
  ComponentSize,
  ElTooltipProps,
  ElImage,
  ElEmpty,
  ElCard
} from 'element-plus'
import { defineComponent, PropType, ref, computed, unref, watch, onMounted } from 'vue'
import { propTypes } from '@/utils/propTypes'
import { setData, setIndex } from './helper'
import type { TableProps, TableColumn, Pagination, TableSetProps } from './types'
import { set, get } from 'lodash-es'
import { CSSProperties } from 'vue'
import { getSlot } from '@/utils/tsxHelper'
import TableActions from './components/TableActions.vue'
import EditTableActions from './components/EditTableActions.vue'
import TableButtons from './components/TableButtons.vue'
import { createVideoViewer } from '@/components/VideoPlayer'
import { Icon } from '@/components/Icon'
import { BaseButton } from '@/components/Button'
import { TableSearch } from '@/api/table/types'
import { isEmpty, isFunction, isNullOrUnDef } from '@/utils/is'
import { FormSchema } from '@/components/Form'
import RenderTableItem from './components/RenderTableItem.vue'
import { toAnyString } from '@/utils'
import { ButtonComponentProps } from '@/components/Form/src/types'
import { TreeHelperConfig, listToTree } from '@/utils/tree'

export default defineComponent({
  name: 'Table',
  props: {
    modelValue: {
      type: Array as PropType<Recordable[]>,
      default: () => []
    },
    mode: propTypes.string.validate((v: string) => ['view', 'edit'].includes(v)).def('view'),
    // 是否展示表格的工具栏
    showAction: propTypes.bool.def(false),
    // 是否展示可编辑表格的工具栏
    showEditAction: propTypes.bool.def(false),
    // 是否所有的超出隐藏，优先级低于schema中的showOverflowTooltip,
    showOverflowTooltip: propTypes.bool.def(true),
    // 表格上方按钮
    buttons: {
      type: Array as PropType<ButtonComponentProps[]>,
      default: () => []
    },
    // 表头
    columns: {
      type: Array as PropType<TableColumn[]>,
      default: () => []
    },
    // 自动将数据转换成树形结构
    autoParseTree: propTypes.bool.def(false),
    // 树形结构
    treeConfig: {
      type: Object as PropType<TreeHelperConfig>,
      default: (): TreeHelperConfig | undefined => undefined
    },
    // 是否展示分页
    pagination: {
      type: Object as PropType<Pagination>,
      default: (): Pagination | undefined => undefined
    },
    // 仅对 type=selection 的列有效，类型为 Boolean，为 true 则会在数据更新之后保留之前选中的数据（需指定 row-key）
    reserveSelection: propTypes.bool.def(false),
    // 加载状态
    loading: propTypes.bool.def(false),
    // 是否叠加索引
    reserveIndex: propTypes.bool.def(true),
    // 对齐方式
    align: propTypes.string
      .validate((v: string) => ['left', 'center', 'right'].includes(v))
      .def('left'),
    // 表头对齐方式
    headerAlign: propTypes.string
      .validate((v: string) => ['left', 'center', 'right'].includes(v))
      .def('left'),
    // 远程数据加载
    query: {
      type: Object as PropType<TableSearch>,
      default: () => undefined
    },
    fetchDataApi: {
      type: Function as PropType<
        (pageSize?: number, currentPage?: number) => Promise<{ data: any[]; total: number }>
      >,
      default: undefined
    },
    // 图片自动预览字段数组
    imagePreview: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    // 视频自动预览字段数组
    videoPreview: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    height: propTypes.oneOfType([Number, String]),
    maxHeight: propTypes.oneOfType([Number, String]),
    stripe: propTypes.bool.def(true),
    border: propTypes.bool.def(true),
    size: {
      type: String as PropType<ComponentSize>,
      validator: (v: ComponentSize) => ['default', 'small', 'large'].includes(v)
    },
    fit: propTypes.bool.def(true),
    showHeader: propTypes.bool.def(true),
    highlightCurrentRow: propTypes.bool.def(true),
    currentRowKey: propTypes.oneOfType([Number, String]),
    // row-class-name, 类型为 (row: Recordable, rowIndex: number) => string | string
    rowClassName: {
      type: [Function, String] as PropType<(row: Recordable, rowIndex: number) => string | string>,
      default: ''
    },
    rowStyle: {
      type: [Function, Object] as PropType<
        (row: Recordable, rowIndex: number) => Recordable | CSSProperties
      >,
      default: () => undefined
    },
    cellClassName: {
      type: [Function, String] as PropType<
        (row: Recordable, column: any, rowIndex: number) => string | string
      >,
      default: ''
    },
    cellStyle: {
      type: [Function, Object] as PropType<
        (row: Recordable, column: any, rowIndex: number) => Recordable | CSSProperties
      >,
      default: () => undefined
    },
    headerRowClassName: {
      type: [Function, String] as PropType<(row: Recordable, rowIndex: number) => string | string>,
      default: ''
    },
    headerRowStyle: {
      type: [Function, Object] as PropType<
        (row: Recordable, rowIndex: number) => Recordable | CSSProperties
      >,
      default: () => undefined
    },
    headerCellClassName: {
      type: [Function, String] as PropType<
        (row: Recordable, column: any, rowIndex: number) => string | string
      >,
      default: ''
    },
    headerCellStyle: {
      type: [Function, Object] as PropType<
        (row: Recordable, column: any, rowIndex: number) => Recordable | CSSProperties
      >,
      default: () => undefined
    },
    rowKey: propTypes.string.def('id'),
    emptyText: propTypes.string.def('No Data'),
    defaultExpandAll: propTypes.bool.def(false),
    expandRowKeys: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    defaultSort: {
      type: Object as PropType<{ prop: string; order: string }>,
      default: () => ({})
    },
    tooltipEffect: {
      type: String as PropType<'dark' | 'light'>,
      default: 'dark'
    },
    tooltipOptions: {
      type: Object as PropType<
        Pick<
          ElTooltipProps,
          | 'effect'
          | 'enterable'
          | 'hideAfter'
          | 'offset'
          | 'placement'
          | 'popperClass'
          | 'popperOptions'
          | 'showAfter'
          | 'showArrow'
        >
      >,
      default: () => ({
        enterable: true,
        placement: 'top',
        showArrow: true,
        hideAfter: 200,
        popperOptions: { strategy: 'fixed' }
      })
    },
    showSummary: propTypes.bool.def(false),
    sumText: propTypes.string.def('Sum'),
    summaryMethod: {
      type: Function as PropType<(param: { columns: any[]; data: any[] }) => any[]>,
      default: () => undefined
    },
    spanMethod: {
      type: Function as PropType<
        (param: { row: any; column: any; rowIndex: number; columnIndex: number }) => any[]
      >,
      default: () => undefined
    },
    selectOnIndeterminate: propTypes.bool.def(true),
    indent: propTypes.number.def(16),
    lazy: propTypes.bool.def(false),
    load: {
      type: Function as PropType<(row: Recordable, treeNode: any, resolve: Function) => void>,
      default: () => undefined
    },
    treeProps: {
      type: Object as PropType<{ hasChildren?: string; children?: string; label?: string }>,
      default: () => ({ hasChildren: 'hasChildren', children: 'children', label: 'label' })
    },
    tableLayout: {
      type: String as PropType<'auto' | 'fixed'>,
      default: 'fixed'
    },
    scrollbarAlwaysOn: propTypes.bool.def(false),
    flexible: propTypes.bool.def(false),
    // 自定义内容
    customContent: propTypes.bool.def(false),
    cardBodyStyle: {
      type: Object as PropType<CSSProperties>,
      default: () => ({})
    },
    cardBodyClass: {
      type: String as PropType<string>,
      default: ''
    },
    cardWrapStyle: {
      type: Object as PropType<CSSProperties>,
      default: () => ({})
    },
    cardWrapClass: {
      type: String as PropType<string>,
      default: ''
    }
  },
  emits: ['register', 'refresh', 'update:modelValue', 'change'],
  setup(props, { attrs, emit, slots, expose }) {
    const elTableRef = ref<ComponentRef<typeof ElTable>>()

    // 注册
    onMounted(async () => {
      // 编辑模式下，不允许分页，强制不分页
      unref(getProps).mode == 'edit' && setProps({ pagination: undefined, showAction: false })
      unref(getProps).mode == 'view' && setProps({ showEditAction: false })
      const tableRef = unref(elTableRef)
      setProps({ loading: true })
      let modelValues = unref(getProps).modelValue
      let totals = unref(getProps).pagination?.total || 0
      if (unref(getProps).query) {
        const { total, data } = await setData(
          unref(getProps).query,
          unref(getProps).pagination
            ? {
                pageSize: unref(getProps).pagination?.pageSize || 10,
                currentPage: unref(getProps).pagination?.currentPage || 1
              }
            : undefined
        )
        totals = total
        modelValues = data
      } else if (unref(getProps).fetchDataApi) {
        const { data, total } = await unref(getProps).fetchDataApi!(
          unref(getProps).pagination ? unref(getProps).pagination?.pageSize || 10 : undefined,
          unref(getProps).pagination ? unref(getProps).pagination?.currentPage || 1 : undefined
        )
        totals = total
        modelValues = data
      }
      if (modelValues) {
        for (const row of modelValues) {
          get(row, unref(getProps).rowKey) == void 0 &&
            set(row, unref(getProps).rowKey, toAnyString())
        }
        if (unref(getProps).autoParseTree) {
          modelValues = listToTree(modelValues, unref(getProps).treeConfig)
        }
      }
      unref(getProps).pagination &&
        setProps({ pagination: { ...unref(getProps).pagination, total: totals } })
      setProps({ modelValue: modelValues, loading: false })
      emit('register', tableRef?.$parent, elTableRef)
    })

    const pageSizeRef = ref(props.pagination?.pageSize)

    const currentPageRef = ref(props.pagination?.currentPage)

    const getRowKey = (row: Recordable) => {
      return row[unref(getProps).rowKey]
    }

    const tableItemProps = ref([])

    // useTable传入的props
    const outsideProps = ref<TableProps>({})

    const mergeProps = ref<TableProps>({})

    const getProps = computed(() => {
      const propsObj = { ...props }
      Object.assign(propsObj, unref(mergeProps))
      return propsObj
    })

    const setProps = (props: TableProps = {}) => {
      mergeProps.value = Object.assign(unref(mergeProps), props)
      outsideProps.value = { ...props } as any
    }

    const setColumn = (columnProps: TableSetProps[], columnsChildren?: TableColumn[]) => {
      const { columns } = unref(getProps)
      for (const v of columnsChildren || columns) {
        for (const item of columnProps) {
          if (v.field === item.field) {
            set(v, item.path, item.value)
          } else if (v.children?.length) {
            setColumn(columnProps, v.children)
          }
        }
      }
    }

    const addColumn = (column: TableColumn, index?: number) => {
      const { columns } = unref(getProps)
      if (index !== void 0) {
        columns.splice(index, 0, column)
      } else {
        columns.push(column)
      }
    }

    const delColumn = (field: string) => {
      const { columns } = unref(getProps)
      const index = columns.findIndex((item) => item.field === field)
      if (index > -1) {
        columns.splice(index, 1)
      }
    }

    const refresh = async () => {
      setProps({ loading: true })
      let modelValues = unref(getProps).modelValue
      let totals = unref(getProps).pagination?.total || 0
      if (unref(getProps).query) {
        const { total, data } = await setData(
          unref(getProps).query,
          unref(getProps).pagination
            ? {
                pageSize: unref(getProps).pagination?.pageSize || 10,
                currentPage: unref(getProps).pagination?.currentPage || 1
              }
            : undefined
        )
        totals = total
        modelValues = data
      } else if (unref(getProps).fetchDataApi) {
        const { data, total } = await unref(getProps).fetchDataApi!(
          unref(getProps).pagination ? unref(getProps).pagination?.pageSize || 10 : undefined,
          unref(getProps).pagination ? unref(getProps).pagination?.currentPage || 1 : undefined
        )
        modelValues = data
        totals = total
      }
      for (const row of modelValues) {
        get(row, unref(getProps).rowKey) == void 0 &&
          set(row, unref(getProps).rowKey, toAnyString())
      }
      if (unref(getProps).autoParseTree) {
        modelValues = listToTree(modelValues, unref(getProps).treeConfig)
      }
      unref(getProps).pagination &&
        setProps({ pagination: { ...unref(getProps).pagination, total: totals } })
      setProps({ modelValue: modelValues, loading: false })
      emit('refresh')
    }

    const addRow = () => {
      const modelValues = unref(getProps).modelValue
      modelValues.push({ [unref(getProps).rowKey]: toAnyString() })
      emit('update:modelValue', modelValues)
      emit('change', modelValues)
    }

    const deleteRow = () => {
      const selectedRows = elTableRef.value?.getSelectionRows() || []

      const modelValues = unref(getProps).modelValue

      // 先获取所有选中的行并删除
      selectedRows.forEach((row) => {
        const index = modelValues.findIndex(
          (item) => item[unref(getProps).rowKey] === row[unref(getProps).rowKey]
        )
        if (index !== -1) {
          modelValues.splice(index!, 1) // 删除行
        }
      })

      // 删除后清空选择
      elTableRef.value?.clearSelection()

      emit('update:modelValue', modelValues)
      emit('change', modelValues)
    }

    const changSize = (size: ComponentSize) => {
      setProps({ size })
    }

    const confirmSetColumn = (columns: TableColumn[]) => {
      setProps({ columns })
    }

    const setQueryParams = (params: Recordable<string, any> = {}) => {
      unref(getProps).query?.tableCode &&
        setProps({
          query: {
            ...unref(getProps).query!,
            params: { ...unref(getProps).query?.params, ...params }
          }
        })
    }

    const getSelectRows = () => {
      return elTableRef.value?.getSelectionRows() || []
    }

    const getData = () => {
      return elTableRef.value?.data || []
    }

    expose({
      setProps,
      setColumn,
      delColumn,
      addColumn,
      refresh,
      setQueryParams,
      getSelectRows,
      getData,
      elTableRef
    })

    const pagination = computed(() => {
      return Object.assign(
        {
          size: 'default',
          background: false,
          pagerCount: 7,
          layout: 'sizes, prev, pager, next, jumper, ->, total',
          pageSizes: [10, 20, 30, 40, 50, 100],
          disabled: false,
          hideOnSinglePage: false,
          pageSizeRef: 10,
          currentPage: 1,
          total: 10
        },
        unref(getProps).pagination
      )
    })

    watch(
      () => pageSizeRef.value,
      async (val: number) => {
        setProps({ loading: true })
        let modelValues = unref(getProps).modelValue
        let totals = unref(getProps).pagination.total || 0
        if (unref(getProps).query) {
          const { total, data } = await setData(unref(getProps).query, {
            pageSize: val,
            currentPage: unref(getProps).pagination?.currentPage || 1
          })
          totals = total
          modelValues = data
        } else if (unref(getProps).fetchDataApi) {
          const { data, total } = await unref(getProps).fetchDataApi!(
            val,
            unref(getProps).pagination?.currentPage || 1
          )
          totals = total
          modelValues = data
        }
        for (const row of modelValues) {
          get(row, unref(getProps).rowKey) == void 0 &&
            set(row, unref(getProps).rowKey, toAnyString())
        }
        if (unref(getProps).autoParseTree) {
          modelValues = listToTree(modelValues, unref(getProps).treeConfig)
        }
        setProps({
          pagination: { ...unref(getProps).pagination, pageSize: val, total: totals },
          modelValue: modelValues,
          loading: false
        })
      }
    )

    watch(
      () => currentPageRef.value,
      async (val: number) => {
        setProps({ loading: true })
        let modelValues = unref(getProps).modelValue
        let totals = unref(getProps).pagination.total || 0
        if (unref(getProps).query) {
          const { total, data } = await setData(unref(getProps).query, {
            pageSize: unref(getProps).pagination?.pageSize || 10,
            currentPage: val
          })
          totals = total
          modelValues = data
        } else if (unref(getProps).fetchDataApi) {
          const { data, total } = await unref(getProps).fetchDataApi!(
            unref(getProps).pagination?.pageSize || 10,
            val
          )
          totals = total
          modelValues = data
        }
        for (const row of modelValues) {
          get(row, unref(getProps).rowKey) == void 0 &&
            set(row, unref(getProps).rowKey, toAnyString())
        }
        if (unref(getProps).autoParseTree) {
          modelValues = listToTree(modelValues, unref(getProps).treeConfig)
        }
        setProps({
          pagination: {
            ...unref(getProps).pagination,
            currentPage: val,
            total: totals
          },
          modelValue: modelValues,
          loading: false
        })
      }
    )

    watch(
      () => elTableRef.value?.data,
      (val: []) => {
        emit('update:modelValue', val)
        emit('change', val)
      },
      { deep: true }
    )

    const getBindValue = computed(() => {
      const bindValue: Recordable = { ...attrs, ...unref(getProps) }
      delete bindValue.columns
      delete bindValue.align
      return bindValue
    })

    const renderTreeTableColumn = (columnsChildren: TableColumn[]) => {
      const { align, headerAlign, showOverflowTooltip, imagePreview, videoPreview } =
        unref(getProps)
      return columnsChildren.map((v) => {
        if (v.hidden) return null
        const props = { ...v } as any
        if (props.children) delete props.children

        const children = v.children

        const slots = {
          default: (...args: any[]) => {
            const data = args[0]
            let isPreview = false
            isPreview =
              imagePreview.some((item) => (item as string) === v.field) ||
              videoPreview.some((item) => (item as string) === v.field)

            return children && children.length
              ? renderTreeTableColumn(children)
              : props?.slots?.default
                ? props.slots.default(...args)
                : v?.formatter
                  ? v?.formatter?.(data.row, data.column, get(data.row, v.field), data.$index)
                  : isPreview
                    ? renderPreview(get(data.row, v.field), v.field)
                    : get(data.row, v.field)
          }
        }
        if (props?.slots?.header) {
          slots['header'] = (...args: any[]) => props.slots.header(...args)
        }

        return (
          <ElTableColumn
            showOverflowTooltip={showOverflowTooltip}
            align={align}
            headerAlign={headerAlign}
            {...props}
            prop={v.field}
          >
            {slots}
          </ElTableColumn>
        )
      })
    }

    const renderPreview = (url: string, field: string) => {
      const { imagePreview, videoPreview } = unref(getProps)
      return (
        <div class="flex items-center">
          {imagePreview.includes(field) ? (
            <ElImage
              src={url}
              fit="cover"
              class="w-[100%]"
              lazy
              preview-src-list={[url]}
              preview-teleported
            />
          ) : videoPreview.includes(field) ? (
            <BaseButton
              type="primary"
              icon={<Icon icon="ep:video-play" />}
              onClick={() => {
                createVideoViewer({
                  url
                })
              }}
            >
              预览
            </BaseButton>
          ) : null}
        </div>
      )
    }

    const renderTableColumnComponent = (
      data: any,
      component: FormSchema[],
      tableItemProps: Array<any>,
      mode: string,
      columnType: string
    ) => {
      if (
        data.$index != -1 &&
        (isNullOrUnDef(tableItemProps[data.$index]) || isEmpty(tableItemProps[data.$index]))
      ) {
        tableItemProps[data.$index] = {}
      }
      return (
        <RenderTableItem
          tableItems={component}
          scope={data}
          tableItemProps={tableItemProps}
          mode={mode}
          columnType={columnType}
          tableRef={unref(elTableRef)?.$parent}
        />
      )
    }

    const renderTableColumn = (columnsChildren?: TableColumn[]) => {
      const {
        columns,
        reserveIndex,
        align,
        headerAlign,
        showOverflowTooltip,
        reserveSelection,
        imagePreview,
        videoPreview,
        mode
      } = unref(getProps)
      return (columnsChildren || columns).map((v) => {
        if (v.hidden) return null
        if (v.type === 'index') {
          return (
            <ElTableColumn
              type="index"
              index={
                v.index
                  ? v.index
                  : (index) =>
                      setIndex(
                        reserveIndex,
                        index,
                        unref(pageSizeRef) || 10,
                        unref(currentPageRef) || 1
                      )
              }
              align={v.align || align}
              headerAlign={v.headerAlign || headerAlign}
              label={v.label}
              fixed={v.fixed}
              width="65px"
            ></ElTableColumn>
          )
        } else if (v.type === 'selection') {
          return (
            <ElTableColumn
              type="selection"
              reserveSelection={reserveSelection}
              align={align}
              headerAlign={headerAlign}
              selectable={v.selectable}
              width="50"
            ></ElTableColumn>
          )
        } else {
          const props = { ...v } as any
          if (props.children) delete props.children

          const children = v.children

          const slots = {
            default: (...args: any[]) => {
              const data = args[0]
              let isPreview = false
              isPreview =
                imagePreview.some((item) => (item as string) === v.field) ||
                videoPreview.some((item) => (item as string) === v.field)

              return children && children.length
                ? renderTreeTableColumn(children)
                : props?.slots?.default
                  ? isFunction(props?.slots?.default)
                    ? props.slots.default(...args)
                    : renderTableColumnComponent(
                        data,
                        props.slots.default,
                        tableItemProps.value,
                        props.type === 'operation' ? 'edit' : mode,
                        props.type
                      )
                  : v?.formatter
                    ? v?.formatter?.(data.row, data.column, get(data.row, v.field), data.$index)
                    : isPreview
                      ? renderPreview(get(data.row, v.field), v.field)
                      : get(data.row, v.field)
            }
          }
          if (props?.slots?.header) {
            slots['header'] = (...args: any[]) => props.slots.header(...args)
          }

          return (
            <ElTableColumn
              showOverflowTooltip={showOverflowTooltip}
              align={align}
              headerAlign={headerAlign}
              {...props}
              prop={v.field}
            >
              {slots}
            </ElTableColumn>
          )
        }
      })
    }

    return () => {
      const tableSlots = {}
      if (getSlot(slots, 'empty')) {
        tableSlots['empty'] = (...args: any[]) => getSlot(slots, 'empty', args)
      }
      if (getSlot(slots, 'append')) {
        tableSlots['append'] = (...args: any[]) => getSlot(slots, 'append', args)
      }

      return (
        <div v-loading={unref(getProps).loading}>
          {unref(getProps).customContent ? (
            <div class="flex flex-wrap">
              {unref(getProps).modelValue.length ? (
                unref(getProps).modelValue.map((item) => {
                  const cardSlots = {
                    default: () => {
                      return getSlot(slots, 'content', item)
                    }
                  }
                  if (getSlot(slots, 'content-header')) {
                    cardSlots['header'] = () => {
                      return getSlot(slots, 'content-header', item)
                    }
                  }
                  if (getSlot(slots, 'content-footer')) {
                    cardSlots['footer'] = () => {
                      return getSlot(slots, 'content-footer', item)
                    }
                  }
                  return (
                    <ElCard
                      shadow="hover"
                      class={unref(getProps).cardWrapClass}
                      style={unref(getProps).cardWrapStyle}
                      bodyClass={unref(getProps).cardBodyClass}
                      bodyStyle={unref(getProps).cardBodyStyle}
                    >
                      {cardSlots}
                    </ElCard>
                  )
                })
              ) : (
                <div class="flex flex-1 justify-center">
                  <ElEmpty description="暂无数据" />
                </div>
              )}
            </div>
          ) : (
            <>
              <TableButtons
                tableRef={unref(elTableRef)?.$parent}
                buttons={unref(getProps).buttons}
              />
              {unref(getProps).showEditAction ? (
                <EditTableActions onAddRow={addRow} onDeleteRow={deleteRow} />
              ) : null}
              {unref(getProps).showAction && !unref(getProps).customContent ? (
                <TableActions
                  columns={unref(getProps).columns}
                  onChangSize={changSize}
                  onRefresh={refresh}
                  onConfirm={confirmSetColumn}
                />
              ) : null}
              <ElTable
                ref={elTableRef}
                data={unref(getProps).modelValue}
                {...unref(getBindValue)}
                rowKey={getRowKey}
              >
                {{
                  default: () => renderTableColumn(),
                  ...tableSlots
                }}
              </ElTable>
            </>
          )}
          {unref(getProps).pagination ? (
            <div class="flex justify-end items-center mt-10px">
              <ElPagination
                v-model:pageSize={pageSizeRef.value}
                v-model:currentPage={currentPageRef.value}
                {...unref(pagination)}
              ></ElPagination>
            </div>
          ) : undefined}
        </div>
      )
    }
  }
})
</script>
