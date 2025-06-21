<template>
  <div class="assets-list__container" v-if="open">
    <div class="assets-list__header">
      <a-button v-if="mode === 'edit'" type="primary" @click="onAdd">添加</a-button>
      <a-button v-if="mode === 'edit'" @click="onSave" style="margin-left: 16px">保存</a-button>
      <a-button @click="close" style="margin-left: 16px">关闭</a-button>
    </div>
    <a-table
      class="assets-list__table"
      :columns="columns"
      :data-source="list"
      :pagination="false"
      :row-key="(record) => record.id"
      :scroll="{ y: 240 }"
    >
      <template #bodyCell="{ column, text, record }">
        <template v-if="mode === 'edit'">
          <template v-if="column.dataIndex === 'name'">
            <a-input v-model:value="record[column.dataIndex as string]" placeholder="请输入名称" />
          </template>
          <template v-if="column.dataIndex === 'price'">
            <a-input-number
              v-model:value="record[column.dataIndex as string]"
              placeholder="请输入价格"
            />
          </template>
          <template v-if="column.dataIndex === 'startTime'">
            <a-date-picker
              v-model:value="record[column.dataIndex as string]"
              placeholder="请选择开始时间"
            />
          </template>
          <template v-if="column.dataIndex === 'endTime'">
            <a-date-picker
              v-model:value="record[column.dataIndex as string]"
              placeholder="请选择结束时间"
            />
          </template>
        </template>
        <template v-else>
          <span>{{ text }}</span>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <a-button type="link" @click="onDelete(record)">删除</a-button>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { nanoid } from 'nanoid';
  import dayjs from 'dayjs';

  const props = defineProps({
    open: {
      required: true,
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: 'edit',
    },
  });
  const emits = defineEmits(['update:open', 'update:cell-tag']);
  const list = ref<any[]>([]);
  const rowIndex = ref<number>(0);
  const colIndex = ref<number>(0);
  const sheetName = ref<string>('');
  const basicColumns = [
    {
      title: '资产名称',
      dataIndex: 'name',
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
    },
    {
      title: '价格',
      dataIndex: 'price',
    },
  ];
  const columns =
    props.mode === 'edit'
      ? [
          ...basicColumns,
          {
            title: '操作',
            dataIndex: 'action',
            width: 100,
          },
        ]
      : basicColumns;

  const onAdd = () => {
    list.value.push({
      id: nanoid(),
      name: '',
      startTime: '',
      endTime: '',
      price: 0,
    });
  };
  const close = () => {
    emits('update:open', false);
  };
  const onSave = () => {
    emits('update:cell-tag', {
      row: rowIndex.value,
      col: colIndex.value,
      childs: list.value.map((item) => {
        return {
          ...item,
          startTime: item.startTime.format('YYYY-MM-DD'),
          endTime: item.endTime.format('YYYY-MM-DD'),
        };
      }),
      sheetName: sheetName.value,
    });
  };
  const onDelete = (record: any) => {
    list.value = list.value.filter((item) => item.id !== record.id);
  };

  const setData = (data: any = {}) => {
    console.log('setData', data);
    const { row, col, sheetName: sheetNameValue, tag: { childs = [] } = {} } = data;
    rowIndex.value = row;
    colIndex.value = col;
    sheetName.value = sheetNameValue;
    list.value = childs.map((item) => {
      return {
        ...item,
        startTime: props.mode === 'edit' ? dayjs(item.startTime) : item.startTime,
        endTime: props.mode === 'edit' ? dayjs(item.endTime) : item.endTime,
      };
    });
  };

  defineExpose({
    setData,
    close,
  });
</script>
<style lang="less" scoped>
  .assets-list__container {
    display: flex;
    flex-direction: column;
    .assets-list__header {
      text-align: right;
      padding: 8px 16px;
      background-color: #fff;
    }
    .assets-list__table {
      padding: 8px 16px;
    }
  }
</style>
