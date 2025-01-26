<script lang="tsx">
import { defineComponent } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { BaseButton } from '@/components/Button'

export default defineComponent({
  name: 'EditTableActions',
  emits: ['addRow', 'deleteRow'],
  setup(props, { emit }) {
    const { t } = useI18n()

    const addRow = () => {
      emit('addRow')
    }

    const deleteRow = () => {
      emit('deleteRow')
    }

    return () => (
      <>
        <div class="text-right h-32px flex items-center justify-end mb-10px">
          <BaseButton
            class="w-6vh h-20px flex items-center justify-end"
            type={'primary'}
            size={'small'}
            onClick={addRow}
          >
            {t('common.addRow')}
          </BaseButton>
          <BaseButton
            class="w-6vh h-20px flex items-center justify-end"
            type={'danger'}
            size={'small'}
            onClick={deleteRow}
          >
            {t('common.deleteRow')}
          </BaseButton>
        </div>
      </>
    )
  }
})
</script>
