<script setup lang="ts">
import {
  ElTimeline,
  ElTimelineItem,
  ElCard,
  ElDescriptions,
  ElDescriptionsItem,
  ElCarousel,
  ElCarouselItem,
  ElTag,
  ElPopover
} from 'element-plus'
import { Icon } from '@/components/Icon'

defineProps({
  flowHistory: Object
})
</script>
<template>
  <el-timeline>
    <el-timeline-item
      style="width: 500px"
      v-for="item in flowHistory"
      :key="item.id"
      :timestamp="item.finishTime"
      :type="item.result ? (item.result.startsWith('通过') ? 'success' : 'danger') : 'primary'"
      placement="top"
    >
      <div
        v-if="item.result"
        class="stamp"
        :class="{
          'stamp-pass': item.result.startsWith('通过'),
          'stamp-reject': item.result.startsWith('退回')
        }"
      >
        {{ item.result.substring(0, 2) }}
      </div>
      <el-popover
        v-if="item.executedInfos"
        placement="right"
        :width="600"
        trigger="click"
        :show-after="200"
      >
        <template #default>
          <el-carousel trigger="click" height="250px">
            <el-carousel-item v-for="item1 in item.executedInfos" :key="item1">
              <div
                v-if="item1.comment"
                class="stamp"
                :class="{
                  'stamp-pass': item1.comment.startsWith('通过'),
                  'stamp-reject': item1.comment.startsWith('退回')
                }"
              >
                {{ item1.comment.substring(0, 2) }}
              </div>
              <el-descriptions :column="1" border :title="item1.activityName">
                <el-descriptions-item>
                  <template #label>
                    <Icon icon="ant-design:user-outlined" class="m-r-5px" :size="16" />处理人
                  </template>
                  {{ item1.assignee }}
                </el-descriptions-item>
                <el-descriptions-item v-if="false" label="节点类型">{{
                  item1.activityType
                }}</el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <Icon icon="ep:alarm-clock" class="m-r-5px" :size="16" />开始时间
                  </template>
                  {{ item1.startTime }}
                </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <Icon icon="ep:alarm-clock" class="m-r-5px" :size="16" />结束时间
                  </template>
                  {{ item1.endTime }}
                </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <Icon icon="ant-design:clock-circle-outlined" class="m-r-5px" :size="16" />耗时
                  </template>
                  <el-tag :type="item1.durationInMin === -1 ? 'primary' : 'success'">{{
                    item1.durationInMin === -1
                      ? '进行中'
                      : item1.durationInMin === 0
                        ? '少于1分钟'
                        : item1.durationInMin + '分钟'
                  }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <Icon icon="tdesign:pen" class="m-r-5px" :size="16" />处理意见
                  </template>
                  <span
                    v-if="item1.comment && item1.comment.length > 3 && item1.comment.length > 33"
                    class="comment-ellipsis"
                    :title="item1.comment.substring(3)"
                    >{{ item1.comment.substring(3, 33) + '...' }}</span
                  >
                  <span v-else>{{
                    item1.comment && item1.comment.length > 3 && item1.comment.substring(3)
                  }}</span>
                </el-descriptions-item>
              </el-descriptions>
            </el-carousel-item>
          </el-carousel>
        </template>
        <template #reference>
          <el-card :header="item.nodeName">
            <div><b>审核人数：</b>{{ item.checkerCount }}人</div>
            <div><b>开始时间：</b>{{ item.startTime }}</div>
            <div><b>结束时间：</b>{{ item.finishTime }}</div>
            <div
              ><b>耗时：</b>{{ item.duration === 0 ? '少于 1' : item.duration }}
              {{ item.duration || item.duration === 0 ? '分钟' : '' }}</div
            >
          </el-card>
        </template>
      </el-popover>
    </el-timeline-item>
  </el-timeline>
</template>
<style lang="scss" scoped>
.stamp {
  position: absolute;
  top: 12px;
  right: 16px;
  z-index: 10;
  padding: 6px 18px;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  opacity: 0.8;
  transform: rotate(-15deg);
  pointer-events: none;
  user-select: none;
  letter-spacing: 4px;
}
.stamp-pass {
  background: #52c41a;
}
.stamp-reject {
  background: #f5222d;
}
</style>
