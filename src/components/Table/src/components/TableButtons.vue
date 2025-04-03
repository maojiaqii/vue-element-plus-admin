<script lang="tsx">
import { defineComponent, PropType, unref } from 'vue'
import { ElTable } from 'element-plus'
import { ButtonComponentProps } from '@/components/Form/src/types'
import ColumnSetting from './ColumnSetting.vue'
import { BaseButton } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { isCustomFunction } from '@/utils/is'
import { newFunction } from '@/utils/newFunction'
import { hasButtonPermi } from '@/components/Permission'

export default defineComponent({
  name: 'TableButtons',
  components: {
    BaseButton,
    ColumnSetting
  },
  props: {
    tableRef: {
      type: Object as PropType<ComponentRef<typeof ElTable>>,
      default: undefined
    },
    buttons: {
      type: Array as PropType<ButtonComponentProps[]>,
      default: () => []
    }
  },
  setup(props) {
    const renderClick = (click?: any) => {
      isCustomFunction(click) &&
        newFunction(click, { tableRef: unref(props.tableRef) }).then((res) =>
          res.params ? res.func(res.params) : res.func()
        )
    }
    return () => (
      <>
        <div class="mb-10px float-left w-90%">
          {props.buttons.map((value) => {
            const binds = { ...unref(value) }
            if (hasButtonPermi(binds.permi)) {
              binds.icon && (binds.icon = <Icon icon={binds.icon as string} />)
              return (
                <BaseButton {...binds} onClick={() => renderClick(binds.on?.click)}>
                  {binds.staticText}
                </BaseButton>
              )
            }
            return
          })}
        </div>
      </>
    )
  },
  methods: { hasButtonPermi }
})
</script>
