<template>
  <a-card
    title="便捷导航"
    :bordered="false"
    style="height: 300px"
    :bodyStyle="{ display: 'flex', gap: '10px', overflow: 'auto' }"
  >
    <template #extra>
      <a-button
        size="small"
        :icon="h(isEdit ? CheckOutlined : EditOutlined)"
        type="primary"
        ghost
        @click="isEdit = !isEdit"
      >
        {{ isEdit ? '完成' : '编辑' }}
      </a-button>
    </template>
    <div
      v-for="item in applicationCollection"
      :key="item._id"
      :style="{
        display: isEdit === false && item.checked ? 'flex' : isEdit === true ? 'flex' : 'none',
      }"
      :class="{
        'quick-nav-icon': true,
        'quick-nav-icon-active': item.checked,
      }"
      @click="handleClick(item)"
    >
      <template v-if="isEdit">
        <MinusCircleFilled
          v-if="item.checked"
          style="color: #f5222d; font-size: 18px"
          class="nav-icon"
          @click.stop="() => handleNav(item)"
        />
        <PlusCircleFilled
          v-else
          style="color: #1890ff; font-size: 18px"
          class="nav-icon"
          @click.stop="() => handleNav(item)"
        />
      </template>
      <img v-if="item.checked" src="@/assets/images/application.png" alt="快捷导航" />
      <img v-else src="@/assets/images/application-default.png" alt="快捷导航" />
      <p :title="item.name">{{ item.name }}</p>
    </div>
    <div
      v-if="applicationCollection.filter((item) => item.checked).length === 0 && isEdit === false"
      class="empty-container"
    >
      <a-empty :image="simpleImage" />
    </div>
  </a-card>
</template>

<script setup lang="ts">
  import { h, onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import {
    CheckOutlined,
    EditOutlined,
    MinusCircleFilled,
    PlusCircleFilled,
  } from '@ant-design/icons-vue';
  import { Empty } from 'ant-design-vue';
  import { getQuickNavList, updateQuickNavList } from '@/api/backend/api/quickNav';
  import { getApplicationList } from '@/api/backend/api/application';

  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;
  const router = useRouter();
  const applicationCollection = ref<any[]>([]);
  const isEdit = ref(false);

  const fetchData = () => {
    Promise.all([getApplicationList({ isBuildIn: false }), getQuickNavList({})]).then(
      ([applicationList, quickNavList]) => {
        applicationCollection.value = applicationList.map((application) => ({
          ...application,
          checked: quickNavList[0]?.includes(application.templateId),
        }));

        console.log('applicationCollection', applicationCollection.value);
      },
    );
  };

  const modifyQuickNavList = (templateIds: string[]) => {
    updateQuickNavList({
      quickNavIdList: templateIds,
    }).then((res) => {
      fetchData();
    });
  };

  const handleClick = (item: any) => {
    // 1. 先动态添加路由，作为 Layout 的子路由
    const dynamicRoute = {
      path: `/quick-nav/${item.templateId}`,
      name: `QuickNav-${item.templateId}`,
      component: () => import('@/views/quick-nav/excel.vue'),
      meta: {
        title: item.name,
        icon: 'ant-design:home-filled',
      },
    };
    // 2. 添加为 Layout 的子路由
    router.addRoute('Layout', dynamicRoute);
    // 3. 跳转到新路由
    router.push({
      name: `QuickNav-${item.templateId}`,
      query: {
        id: item.templateId,
      },
    });
  };

  const handleNav = (item: any) => {
    if (item.checked) {
      // 移除
      modifyQuickNavList(
        [
          ...applicationCollection.value.filter((it) => it.checked).map((it) => it.templateId),
        ].filter((it) => it !== item.templateId),
      );
    } else {
      // 添加
      modifyQuickNavList([
        ...applicationCollection.value.filter((it) => it.checked).map((it) => it.templateId),
        item.templateId,
      ]);
    }
  };

  onMounted(() => {
    fetchData();
  });
</script>

<style lang="less" scoped>
  // 快捷导航图标
  .quick-nav-icon {
    width: 150px;
    height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    box-shadow:
      0 1px 2px 0 rgba(0, 0, 0, 0.03),
      0 1px 6px -1px rgba(0, 0, 0, 0.02),
      0 2px 4px 0 rgba(0, 0, 0, 0.02);
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    padding: 10px;
    cursor: pointer;
    position: relative;
    text-align: center;

    .nav-icon {
      position: absolute;
      top: 0;
      right: 0;
      width: 24px;
      height: 24px;
    }

    img {
      height: 40px;
    }
    p {
      margin: 0;
      font-size: 14px;
      color: #282a2e;
      font-weight: 500;
      // 省略号
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 100%;
    }
  }
  .empty-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
