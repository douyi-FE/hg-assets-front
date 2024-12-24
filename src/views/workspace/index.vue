/** 工作空间 */
<template>
  <div class="work-container">
    <p class="title">工作台</p>
    <a-flex justify="space-between" align="center">
      <a-flex class="header-left" :gap="40" align="center">
        <a-avatar :size="64" src="https://thirdqq.qlogo.cn/g?b=qq&s=100&nk=1743369777" />
        <div>
          <p class="header-left-title">您好Admin，忙碌是一场幸福！</p>
          <p class="header-left-sub-title">2024年12月15日 12:23:45</p>
        </div>
      </a-flex>
      <div class="header-right">
        <a-statistic title="项目数" :value="23" />
        <a-divider type="vertical" />
        <a-statistic title="合同数" :value="34" />
      </div>
    </a-flex>
    <a-row :gutter="32" style="margin-top: 20px">
      <a-col :span="16">
        <a-card title="我的待办" :bordered="false">
          <a-list
            :data-source="[
              { title: '任务1', description: '任务1内容，请尽快处理！' },
              { title: '任务2', description: '任务2内容，请尽快处理！' },
              { title: '任务3', description: '任务3内容，请尽快处理！' },
            ]"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <template #actions>
                  <a key="list-loadmore-edit">处理</a>
                </template>
                <a-list-item-meta :description="item.description">
                  <template #title>
                    <a href="https://www.antdv.com/">{{ item.title }}</a>
                  </template>
                  <template #avatar>
                    <a-avatar src="https://joeschmoe.io/api/v1/random" />
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
        <a-card title="统计中心" :bordered="false" style="height: 500px; margin-top: 20px">
          <a-empty />
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="便捷导航" :bordered="false" style="height: 300px">
          <template #extra>
            <a-button size="small" :icon="h(PlusOutlined)" type="primary" ghost>添加</a-button>
          </template>
          <a-tag color="#55acee">发票管理 </a-tag>
          <a-tag color="#55acee">产值管理 </a-tag>
          <a-tag color="#55acee">考情管理 </a-tag>
        </a-card>
        <a-card title="我的日程" :bordered="false" style="height: 500px; margin-top: 20px">
          <a-list size="small" bordered :data-source="[]">
            <template #renderItem="{ item }">
              <a-list-item>{{ item }}</a-list-item>
            </template></a-list
          >
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue';
  import { PlusOutlined } from '@ant-design/icons-vue';
</script>

<style lang="less" scoped>
  .work-container {
    padding: 20px;

    .title {
      height: 48px;
      margin-block-end: 0;
      margin-inline-end: 12px;
      overflow: hidden;
      color: rgb(0 0 0 / 88%);
      font-size: 20px;
      font-weight: 600;
      line-height: 48px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .header-left-title {
      margin-bottom: 12px;
      color: rgb(0 0 0 / 88%);
      font-size: 20px;
      font-weight: 500;
      line-height: 28px;
    }

    .header-left-sub-title {
      color: rgb(0 0 0 / 65%);
      line-height: 22px;
    }

    .header-right {
      display: flex;
      flex-direction: row;
    }
  }
</style>
