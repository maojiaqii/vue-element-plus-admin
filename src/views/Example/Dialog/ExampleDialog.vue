<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Dialog } from '@/components/Dialog'
import { ref } from 'vue'
import { BaseButton } from '@/components/Button'
import createDialog from '@/hooks/web/useDialog'
import createDrawer from '@/hooks/web/useDrawer'

const dialogVisible = ref(false)

const action1 = () => {
  dialogVisible.value = true
}

const action2 = () => {
  createDialog({
    title: 'useDialog弹窗',
    content: [
      {
        type: 'form',
        props: {
          schema: {
            formItems: [
              {
                itemProps: {
                  prop: 'text0'
                },
                colProps: {
                  span: 24
                },
                componentProps: {
                  slots: {
                    default: {
                      html: '这是一个useDialog动态创建的弹窗！'
                    }
                  }
                }
              }
            ]
          }
        }
      }
    ]
  })
}

const action3 = () => {
  createDrawer({
    title: 'useDrawer弹窗',
    content: [
      {
        type: 'form',
        props: {
          schema: {
            formItems: [
              {
                itemProps: {
                  prop: 'text0'
                },
                colProps: {
                  span: 24
                },
                componentProps: {
                  slots: {
                    default: {
                      html: '这是一个useDrawer动态创建的弹窗！'
                    }
                  }
                }
              }
            ]
          }
        }
      }
    ]
  })
}
</script>

<template>
  <ContentWrap>
    <BaseButton type="primary" @click="action1"> 基础用法 </BaseButton>
    <BaseButton type="primary" @click="action2"> useDialog </BaseButton>
    <BaseButton type="primary" @click="action3"> useDrawer </BaseButton>
  </ContentWrap>

  <Dialog v-model="dialogVisible" title="基础用法">
    这是一个基础用法显示的弹窗
    <template #footer>
      <BaseButton @click="dialogVisible = false"> 取消 </BaseButton>
      <BaseButton type="primary"> 保存 </BaseButton>
    </template>
  </Dialog>
</template>
