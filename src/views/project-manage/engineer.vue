<template>
  <div class="engineer-table-wrapper">
    <a-table :columns="engineerColumns" :data-source="dataSource" :pagination="false">
      <template #title>
        <div class="table-header-wrapper">
          <a-button
            size="small"
            type="primary"
            :disabled="props.isDone"
            @click="
              open = true;
              currentEngineer = { id: undefined, name: '', code: '' };
            "
            >添加工程</a-button
          >
        </div>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'operation'">
          <a-button
            type="link"
            @click="
              openData = true;
              currentEngineer = record;
            "
            >查看工程</a-button
          >
          <a-button
            type="link"
            @click="
              open = true;
              currentEngineer = {
                id: record._id,
                ...record,
              };
            "
            :disabled="props.isDone"
            >编辑工程</a-button
          >
          <a-popconfirm
            title="删除会导致工程数据丢失，是否确认删除?"
            ok-text="是"
            cancel-text="否"
            @confirm="deleteEngineerHandler(record)"
          >
            <a-button type="link" :disabled="props.isDone">删除</a-button>
          </a-popconfirm>
        </template>
      </template>
    </a-table>
    <a-modal v-model:open="open" title="工程信息" @ok="handleOk()">
      <EngineerForm ref="engineerFormRef" :engineer="currentEngineer" />
    </a-modal>
    <a-modal v-model:open="openData" title="工程数据">
      <a-table :columns="engineerDataColumns" :data-source="engineerData" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'operation'">
            <a-button type="link" @click="goEngineer(record)">查看</a-button>
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { message } from 'ant-design-vue';
  import EngineerForm from './forms/engineer.vue';
  import { engineerColumns, engineerDataColumns } from './columns';
  import {
    addEngineer,
    deleteEngineer,
    getEngineerList,
    updateEngineer,
  } from '@/api/backend/api/engineer';

  const props = withDefaults(
    defineProps<{ projectCode: string; deviceCode: string; deviceId: string; isDone: boolean }>(),
    {
      projectCode: '',
      deviceCode: '',
      deviceId: '',
      isDone: false,
    },
  );

  const router = useRouter();
  const dataSource = ref<any[]>([]);
  const open = ref(false);
  const openData = ref(false);
  const engineerFormRef = ref();
  const engineerData = ref<any[]>([
    {
      type: '静设备',
      code: 'static-equipment',
      view: 'static-equip',
      app: '静设备-工程量计算书',
    },
    {
      type: '动设备',
      code: 'dynamic-equipment',
      view: 'moving-equip',
      app: '动设备-工程量计算书',
    },
    {
      type: '工艺管道',
      code: 'industrial-pipe',
      view: 'industrial-piping',
      app: '工艺管道-工程量计算书',
    },
    {
      type: '钢结构',
      code: 'steel-structure',
      view: 'steel-structure',
      app: '钢结构-工程量计算书',
    },
    {
      type: '电气仪表',
      code: 'electrical-instrument',
      view: 'electrical-instru',
      app: '电气仪表-工程量计算书',
    },
    {
      type: '民用水暖',
      code: 'civil-water-heating',
      view: 'water-heater',
      app: '民用水暖-工程量计算书',
    },
    {
      type: '通风管道',
      code: 'ventilation-pipe',
      view: 'ventilation-duct',
      app: '通风管道-工程量计算书',
    },
  ]);
  const currentEngineer = ref<any>({
    id: undefined,
    name: '',
    code: '',
  });

  // 删除工程
  const deleteEngineerHandler = function (engineer: any) {
    console.log('delete engineer:', engineer);
    deleteEngineer(engineer._id).then((res) => {
      message.success('删除成功');
      fetchEngineerList();
    });
  };

  const goEngineer = function (item: any) {
    console.log('props:', props);
    // 1. 先动态添加路由，作为 Layout 的子路由
    const dynamicRoute = {
      path: `/engineer/${currentEngineer.value.code}/${item.code}`,
      name: `engineer-${currentEngineer.value.code}-${item.code}`,
      component: () => import(`@/views/calc-eng/index.vue`),
      meta: {
        title: `${currentEngineer.value.name} - ${item.type}`,
        icon: 'ant-design:home-filled',
      },
    };
    // 2. 添加为 Layout 的子路由
    router.addRoute('Layout', dynamicRoute);
    // 3. 跳转到新路 由
    router.push({
      name: `engineer-${currentEngineer.value.code}-${item.code}`,
      query: {
        type: item.code,
        project: props.projectCode,
        device: props.deviceCode,
        engineer: currentEngineer.value.code,
        engineerId: currentEngineer.value._id,
        isDone: String(props.isDone),
        app: item.app,
      },
    });
  };

  // 获取工程列表
  const fetchEngineerList = async () => {
    const res = await getEngineerList(props.projectCode, props.deviceId);
    dataSource.value = res;
  };
  const handleOk = () => {
    engineerFormRef.value.getData().then((res) => {
      console.log('engineer form data:', res);
      const data = {
        ...res,
        project_code: props.projectCode,
        device_code: props.deviceCode,
        device_id: props.deviceId,
      };
      if (res.id) {
        updateEngineer(data).then((res) => {
          message.success('更新成功');
          open.value = false;
          fetchEngineerList();
        });
      } else {
        addEngineer(data).then((res) => {
          message.success('添加成功');
          open.value = false;
          fetchEngineerList();
        });
      }
    });
  };

  onMounted(() => {
    fetchEngineerList();
  });
</script>

<style lang="less" scoped>
  .table-header-wrapper {
    display: flex;
    justify-content: flex-end;
  }

  .engineer-table-wrapper {
    .table-header-wrapper {
      display: flex;
      justify-content: flex-end;
      background-color: #fff;
      padding: 10px 10px 10px 0;
    }
  }
</style>
