<template>
  <a-table :columns="engineerColumns" :data-source="dataSource" :pagination="false">
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'operation'">
        <a-button type="link" @click="goEngineer(record)">查看工程</a-button>
        <a-popconfirm
          title="确认删除此数据吗?"
          ok-text="是"
          cancel-text="否"
          @confirm="deleteEngineer(record)"
        >
          <a-button type="link">删除</a-button>
        </a-popconfirm>
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import { engineerColumns } from './columns';

  withDefaults(defineProps<{ dataSource: any[] }>(), { dataSource: () => [] });

  const router = useRouter();
  const deleteEngineer = function (engineer: any) {
    console.log('delete engineer:', engineer);
  };

  const goEngineer = function (item: any) {
    console.log('ggggggg:', item);
    // 1. 先动态添加路由，作为 Layout 的子路由
    const dynamicRoute = {
      path: `/engineer/${item.code}`,
      name: `engineer-${item.code}`,
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
      name: `engineer-${item.code}`,
      query: {
        code: item.code,
        project: 'PRO-001',
        device: 'DEVICE-001',
        engineer: 'ENGINEER-001',
      },
    });
  };
</script>

<style lang="less" scoped>
  .table-header-wrapper {
    display: flex;
    justify-content: flex-end;
  }
</style>
