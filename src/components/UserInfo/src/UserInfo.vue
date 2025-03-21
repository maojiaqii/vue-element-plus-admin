<script setup lang="ts">
import { ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'
import { useI18n } from '@/hooks/web/useI18n'
import { useDesign } from '@/hooks/web/useDesign'
import { useUserStore } from '@/store/modules/user'
import { type RouteRecordRaw, useRouter } from 'vue-router'
import { usePermissionStore } from '@/store/modules/permission'
import { computed } from 'vue'
import { routersApi } from '@/api/login'
import router from '@/router'
import { Tenancy } from '@/../types/global'
import { useTagsViewStore } from '@/store/modules/tagsView'

const { push } = useRouter()
const permissionStore = usePermissionStore()
const userStore = useUserStore()
const tagsViewStore = useTagsViewStore()

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('user-info')

const { t } = useI18n()

const tenancys = computed(() => permissionStore.getTenancys)

const changeTenancy = async (tenancy: Tenancy) => {
  const resRouter = await routersApi(tenancy.tenancy_id)
  if (resRouter.code == 200) {
    const routers = resRouter.data || []
    userStore.setRoleRouters(routers)
    await permissionStore.generateRoutes('server', routers).catch(() => {})
    permissionStore.getAddRouters.forEach((routes) => {
      router.addRoute(routes as RouteRecordRaw) // 动态添加可访问路由表
    })
    permissionStore.setCurrentTenancy(tenancy)
    permissionStore.setIsAddRouters(true)
    tagsViewStore.delAllVisitedViews(false)
    router.push({
      // @ts-ignore
      path: router.currentRoute.value.query?.redirect || permissionStore.addRouters[0].path
    })
  }
}

const loginOut = () => {
  userStore.logoutConfirm()
}

const toDocument = () => {
  window.open('https://element-plus-admin-doc.cn/')
}

const toPage = (path: string) => {
  push(path)
}
</script>

<template>
  <ElDropdown class="custom-hover" :class="prefixCls" trigger="click">
    <div class="flex items-center">
      <img
        src="@/assets/imgs/avatar.jpg"
        alt=""
        class="w-[calc(var(--logo-height)-25px)] rounded-[50%]"
      />
      <span class="<lg:hidden text-14px pl-[5px] text-[var(--top-header-text-color)]">{{
        userStore.getUserInfo?.username
      }}</span>
    </div>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem>
          <div @click="toPage('/personal/personal-center')">
            {{ t('router.personalCenter') }}
          </div>
        </ElDropdownItem>
        <ElDropdownItem>
          <ElDropdown placement="left">
            <div>{{ t('common.platform') }}</div>
            <template #dropdown>
              <ElDropdownMenu v-for="tenancy in tenancys" :key="tenancy.tenancy_id">
                <ElDropdownItem>
                  <div @click="changeTenancy(tenancy)">
                    {{ tenancy.tenancy_name }}
                  </div>
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </ElDropdownItem>
        <ElDropdownItem>
          <div @click="toDocument">{{ t('common.document') }}</div>
        </ElDropdownItem>
        <ElDropdownItem divided>
          <div @click="loginOut">{{ t('common.loginOut') }}</div>
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>

<style scoped lang="less"></style>
