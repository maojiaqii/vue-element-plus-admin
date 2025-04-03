import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { Menu } from '@/components/Menu'
import { TabMenu } from '@/components/TabMenu'
import { TagsView } from '@/components/TagsView'
import { Logo } from '@/components/Logo'
import AppView from './AppView.vue'
import ToolHeader from './ToolHeader.vue'
import { ElScrollbar } from 'element-plus'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('layout')

const commonClasses = {
  // 基础卡片样式
  card: [
    'rounded-[16px]',
    'transform',
    'transition-all',
    'duration-300',
    'ease-in-out',
    'overflow-hidden'
  ],
  // 基础阴影和悬浮效果
  shadowHover: [
    'shadow-[0_4px_16px_-2px_rgba(64,158,255,0.15)]',
    'hover:shadow-[0_8px_32px_-4px_rgba(64,158,255,0.25)]'
  ],
  // 左侧菜单特殊阴影和悬浮效果
  leftMenuShadow: [
    'shadow-[4px_0_16px_-2px_rgba(64,158,255,0.15)]',
    'hover:translate-x-0.5',
    'hover:shadow-[8px_0_32px_-4px_rgba(64,158,255,0.25)]'
  ],
  // 顶部悬浮效果
  topHover: ['hover:translate-y-0.5']
}

const appStore = useAppStore()

const pageLoading = computed(() => appStore.getPageLoading)

// 标签页
const tagsView = computed(() => appStore.getTagsView)

// 菜单折叠
const collapse = computed(() => appStore.getCollapse)

// logo
const logo = computed(() => appStore.logo)

// 固定头部
const fixedHeader = computed(() => appStore.getFixedHeader)

// 是否是移动端
const mobile = computed(() => appStore.getMobile)

// 固定菜单
const fixedMenu = computed(() => appStore.getFixedMenu)

export const useRenderLayout = () => {
  const renderClassic = () => {
    return (
      <>
        <div
          class={[
            'absolute top-0 left-0 h-full bg-[var(--el-bg-color-overlay)]',
            { '!fixed z-3000': mobile.value },
            ...commonClasses.card,
            ...commonClasses.leftMenuShadow
          ]}
        >
          {logo.value ? (
            <Logo
              class={[
                'relative',
                {
                  '!pl-0': mobile.value && collapse.value,
                  'w-[var(--left-menu-min-width)]': appStore.getCollapse,
                  'w-[var(--left-menu-max-width)]': !appStore.getCollapse
                }
              ]}
              style="transition: all var(--transition-time-02);"
            ></Logo>
          ) : undefined}
          <Menu class={[{ '!h-[calc(100%-var(--logo-height))]': logo.value }]}></Menu>
        </div>
        <div
          class={[
            `${prefixCls}-content`,
            'absolute top-0 h-[100%]',
            {
              'w-[calc(100%-var(--left-menu-min-width))] left-[var(--left-menu-min-width)]':
                collapse.value && !mobile.value && !mobile.value,
              'w-[calc(100%-var(--left-menu-max-width))] left-[var(--left-menu-max-width)]':
                !collapse.value && !mobile.value && !mobile.value,
              'fixed !w-full !left-0': mobile.value
            }
          ]}
          style="transition: all var(--transition-time-02);"
        >
          <ElScrollbar
            v-loading={pageLoading.value}
            class={[
              `${prefixCls}-content-scrollbar`,
              {
                '!h-[calc(100%-var(--top-tool-height)-var(--tags-view-height))] mt-[calc(var(--top-tool-height)+var(--tags-view-height))]':
                  fixedHeader.value
              }
            ]}
          >
            <div
              class={[
                {
                  'fixed top-0 left-0 z-10': fixedHeader.value,
                  'w-[calc(100%-var(--left-menu-min-width))] !left-[var(--left-menu-min-width)]':
                    collapse.value && fixedHeader.value && !mobile.value,
                  'w-[calc(100%-var(--left-menu-max-width))] !left-[var(--left-menu-max-width)]':
                    !collapse.value && fixedHeader.value && !mobile.value,
                  '!w-full !left-0': mobile.value
                },
                ...commonClasses.card,
                'ml-0.5',
                ...commonClasses.shadowHover
              ]}
              style="transition: all var(--transition-time-02);"
            >
              <ToolHeader class={['bg-[var(--el-bg-color-overlay)]']}></ToolHeader>

              {tagsView.value ? <TagsView class="bg-white"></TagsView> : undefined}
            </div>
            <AppView></AppView>
          </ElScrollbar>
        </div>
      </>
    )
  }

  const renderTopLeft = () => {
    return (
      <>
        <div
          class={[
            'flex items-center relative',
            'bg-[var(--el-bg-color-overlay)]',
            ...commonClasses.card,
            ...commonClasses.shadowHover,
            ...commonClasses.topHover
          ]}
        >
          {logo.value ? <Logo class="custom-hover"></Logo> : undefined}
          <ToolHeader class="flex-1"></ToolHeader>
        </div>
        <div class="absolute top-[var(--logo-height)+1px] left-0 w-full h-[calc(100%-1px-var(--logo-height))] flex">
          <Menu
            class={[
              '!h-full relative mt-0.5 mr-0.5',
              ...commonClasses.card,
              ...commonClasses.leftMenuShadow
            ]}
          ></Menu>
          <div
            class={[
              `${prefixCls}-content`,
              'h-[100%]',
              {
                'w-[calc(100%-var(--left-menu-min-width))] left-[var(--left-menu-min-width)]':
                  collapse.value,
                'w-[calc(100%-var(--left-menu-max-width))] left-[var(--left-menu-max-width)]':
                  !collapse.value
              }
            ]}
            style="transition: all var(--transition-time-02);"
          >
            <ElScrollbar
              v-loading={pageLoading.value}
              class={[
                `${prefixCls}-content-scrollbar`,
                {
                  '!h-[calc(100%-var(--tags-view-height))] mt-[calc(var(--tags-view-height))]':
                    fixedHeader.value && tagsView.value
                }
              ]}
            >
              {tagsView.value ? (
                <TagsView
                  class={[
                    'absolute ml-0.5',
                    ...commonClasses.card,
                    ...commonClasses.shadowHover,
                    {
                      '!fixed top-0 left-0 z-10': fixedHeader.value,
                      'w-[calc(100%-var(--left-menu-min-width))] !left-[var(--left-menu-min-width)] mt-[calc(var(--logo-height)+3.5px)]':
                        collapse.value && fixedHeader.value,
                      'w-[calc(100%-var(--left-menu-max-width))] !left-[var(--left-menu-max-width)] mt-[calc(var(--logo-height)+3.5px)]':
                        !collapse.value && fixedHeader.value
                    }
                  ]}
                  style="transition: width var(--transition-time-02), left var(--transition-time-02);"
                ></TagsView>
              ) : undefined}

              <AppView></AppView>
            </ElScrollbar>
          </div>
        </div>
      </>
    )
  }

  const renderTop = () => {
    return (
      <>
        <div
          class={[
            'flex items-center justify-between relative',
            'bg-[var(--el-bg-color-overlay)]',
            'rounded-t-[16px] overflow-hidden',
            ...commonClasses.shadowHover,
            {
              'layout-border__bottom': !tagsView.value
            }
          ]}
        >
          {logo.value ? <Logo class="custom-hover"></Logo> : undefined}
          <Menu class="flex-1 px-10px h-[var(--top-tool-height)]"></Menu>
          <ToolHeader></ToolHeader>
        </div>
        <div
          class={[
            `${prefixCls}-content`,
            'w-full',
            {
              'h-[calc(100%-var(--top-tool-height))]': !fixedHeader.value,
              'h-[calc(100%-var(--tags-view-height)-var(--top-tool-height))]': fixedHeader.value
            }
          ]}
        >
          <ElScrollbar
            v-loading={pageLoading.value}
            class={[
              `${prefixCls}-content-scrollbar`,
              {
                'mt-[var(--tags-view-height)] !pb-[calc(var(--tags-view-height)+var(--app-footer-height))]':
                  fixedHeader.value,
                'pb-[var(--app-footer-height)]': !fixedHeader.value
              }
            ]}
          >
            {tagsView.value ? (
              <TagsView
                class={[
                  'layout-border__bottom layout-border__top relative',
                  'rounded-b-[16px] overflow-hidden',
                  ...commonClasses.shadowHover,
                  {
                    '!fixed w-full top-[calc(var(--top-tool-height)+1px)] left-0': fixedHeader.value
                  }
                ]}
                style="transition: width var(--transition-time-02), left var(--transition-time-02);"
              ></TagsView>
            ) : undefined}

            <AppView></AppView>
          </ElScrollbar>
        </div>
      </>
    )
  }

  const renderCutMenu = () => {
    return (
      <>
        <div
          class={[
            'flex items-centerrelative',
            'bg-[var(--el-bg-color-overlay)]',
            ...commonClasses.card,
            ...commonClasses.shadowHover,
            ...commonClasses.topHover
          ]}
        >
          {logo.value ? <Logo class="custom-hover !pr-15px"></Logo> : undefined}

          <ToolHeader class="flex-1"></ToolHeader>
        </div>
        <div class="absolute top-[var(--logo-height)] left-0 w-[calc(100%-2px)] h-[calc(100%-var(--logo-height))] flex">
          <TabMenu></TabMenu>
          <div
            class={[
              `${prefixCls}-content`,
              'h-[100%]',
              {
                'w-[calc(100%-var(--tab-menu-min-width))] left-[var(--tab-menu-min-width)]':
                  collapse.value && !fixedMenu.value,
                'w-[calc(100%-var(--tab-menu-max-width))] left-[var(--tab-menu-max-width)]':
                  !collapse.value && !fixedMenu.value,
                'w-[calc(100%-var(--tab-menu-min-width)-var(--left-menu-max-width))] ml-[var(--left-menu-max-width)]':
                  collapse.value && fixedMenu.value,
                'w-[calc(100%-var(--tab-menu-max-width)-var(--left-menu-max-width))] ml-[var(--left-menu-max-width)]':
                  !collapse.value && fixedMenu.value
              }
            ]}
            style="transition: all var(--transition-time-02);"
          >
            <ElScrollbar
              v-loading={pageLoading.value}
              class={[
                `${prefixCls}-content-scrollbar`,
                {
                  '!h-[calc(100%-var(--tags-view-height))] mt-[calc(var(--tags-view-height))]':
                    fixedHeader.value && tagsView.value
                }
              ]}
            >
              {tagsView.value ? (
                <TagsView
                  class={[
                    'relative ml-0.5',
                    ...commonClasses.card,
                    ...commonClasses.shadowHover,
                    {
                      '!fixed top-0 left-0 z-10': fixedHeader.value,
                      'w-[calc(100%-var(--tab-menu-min-width))] !left-[var(--tab-menu-min-width)] mt-[calc(var(--logo-height)+3.5px)]':
                        collapse.value && fixedHeader.value,
                      'w-[calc(100%-var(--tab-menu-max-width))] !left-[var(--tab-menu-max-width)] mt-[calc(var(--logo-height)+3.5px)]':
                        !collapse.value && fixedHeader.value,
                      '!fixed top-0 !left-[var(--tab-menu-min-width)+var(--left-menu-max-width)] z-10':
                        fixedHeader.value && fixedMenu.value,
                      'w-[calc(100%-var(--tab-menu-min-width)-var(--left-menu-max-width))] !left-[var(--tab-menu-min-width)+var(--left-menu-max-width)] mt-[var(--logo-height)]':
                        collapse.value && fixedHeader.value && fixedMenu.value,
                      'w-[calc(100%-var(--tab-menu-max-width)-var(--left-menu-max-width))] !left-[var(--tab-menu-max-width)+var(--left-menu-max-width)] mt-[var(--logo-height)]':
                        !collapse.value && fixedHeader.value && fixedMenu.value
                    }
                  ]}
                  style="transition: width var(--transition-time-02), left var(--transition-time-02);"
                ></TagsView>
              ) : undefined}

              <AppView></AppView>
            </ElScrollbar>
          </div>
        </div>
      </>
    )
  }

  return {
    renderClassic,
    renderTopLeft,
    renderTop,
    renderCutMenu
  }
}
