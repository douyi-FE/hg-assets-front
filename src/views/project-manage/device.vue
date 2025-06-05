<template>
  <div class="device-table-wrapper">
    <a-table
      :columns="deviceColumns"
      :data-source="dataSource"
      rowKey="_id"
      :pagination="false"
      size="small"
    >
      <template #title>
        <div class="table-header-wrapper">
          <a-button
            size="small"
            type="primary"
            :disabled="props.isDone"
            @click="
              open = true;
              currentDevice = {
                id: undefined,
                name: '',
                code: '',
              };
            "
            >添加</a-button
          >
        </div>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'operation'">
          <a-popconfirm
            title="删除会导致设备数据丢失，是否确认删除?"
            ok-text="是"
            cancel-text="否"
            @confirm="deleteDeviceHandler(record)"
          >
            <a-button type="link" :disabled="props.isDone">删除</a-button>
          </a-popconfirm>
          <a-button
            type="link"
            :disabled="props.isDone"
            @click="
              open = true;
              currentDevice = {
                id: record._id,
                name: record.name,
                code: record.code,
              };
            "
            >编辑</a-button
          >
        </template>
      </template>
      <template #expandedRowRender="{ record }">
        <slot name="expandTable" :row="record" />
      </template>
    </a-table>
    <a-modal v-model:open="open" title="装置信息" @ok="handleOk()">
      <DeviceForm ref="deviceFormRef" :device="currentDevice" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { message } from 'ant-design-vue';
  import { deviceColumns } from './columns';
  import DeviceForm from './forms/device.vue';
  import { addDevice, deleteDevice, getDeviceList, updateDevice } from '@/api/backend/api/device';

  const props = withDefaults(
    defineProps<{ projectCode: string; projectId: string; isDone: boolean }>(),
    {
      projectCode: '',
      projectId: '',
      isDone: false,
    },
  );

  const dataSource = ref<any[]>([]);
  const open = ref(false);
  const currentDevice = ref<any>({
    id: undefined,
    name: '',
    code: '',
  });
  const deviceFormRef = ref();
  // 获取装置数据
  const fetchDeviceData = function () {
    getDeviceList(props.projectId).then((res) => {
      dataSource.value = res;
    });
  };
  // 删除设备数据
  const deleteDeviceHandler = function (device: any) {
    console.log('delete device:', device);
    deleteDevice(device._id, device.code).then((res) => {
      message.success('删除成功');
      fetchDeviceData();
    });
  };
  // 添加设备
  const handleOk = function () {
    deviceFormRef.value.getData().then((res) => {
      console.log('device form data:', res);
      const data = {
        ...res,
        project_code: props.projectCode,
        project_id: props.projectId,
      };
      if (res.id) {
        updateDevice(data).then((res) => {
          message.success('更新成功');
          open.value = false;
          fetchDeviceData();
        });
      } else {
        addDevice(data).then((res) => {
          message.success('添加成功');
          open.value = false;
          fetchDeviceData();
        });
      }
    });
  };

  onMounted(() => {
    fetchDeviceData();
  });

  defineExpose({
    fetchDeviceData,
  });
</script>

<style lang="less" scoped>
  .table-header-wrapper {
    display: flex;
    justify-content: flex-end;
    background-color: #fff;
    padding: 10px 10px 10px 0;
  }
</style>
