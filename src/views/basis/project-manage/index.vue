<template>
  <div class="project-container">
    <a-card :bordered="false" class="project-search">
      <a-row justify="space-between">
        <a-col :span="8">
          <a-form
            layout="inline"
            v-bind="{ labelCol: { span: 4 }, wrapperCol: { span: 19, offset: 1 } }"
            :model="formState"
            @finish="handleFinish"
            @finishFailed="handleFinishFailed"
          >
            <a-form-item label="项目名称">
              <a-input v-model:value="formState.user" placeholder="请输入项目名称" />
            </a-form-item>
            <a-form-item label="甲方名称">
              <a-input v-model:value="formState.password" placeholder="请输入甲方名称" />
            </a-form-item>
          </a-form>
        </a-col>
        <a-col :span="8"
          ><div class="search-controls">
            <a-button>重置</a-button>
            <a-button type="primary">查询</a-button>
          </div></a-col
        >
      </a-row>
    </a-card>
    <a-card :bordered="false" class="project-table">
      <a-table :columns="columns" :data-source="data" bordered>
        <template #bodyCell="{ column, text }">
          <template v-if="column.dataIndex === 'name'">
            <a>{{ text }}</a>
          </template>
        </template>
        <template #title>
          <div class="table-toolbar">
            <p class="toolbar-left">项目列表</p>
            <div class="toolbar-right">
              <a-button :icon="h(PlusOutlined)" type="primary">新增</a-button>
              <a-tooltip>
                <template #title>刷新</template>
                <a-button :icon="h(ReloadOutlined)" />
              </a-tooltip>
              <a-tooltip>
                <template #title>密度</template>
                <a-button :icon="h(ColumnHeightOutlined)" />
              </a-tooltip>
              <a-tooltip>
                <template #title>列设置</template>
                <a-button :icon="h(ToolOutlined)" />
              </a-tooltip>
              <a-tooltip>
                <template #title>导出</template>
                <a-button :icon="h(ExportOutlined)" />
              </a-tooltip>
            </div>
          </div>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, h } from 'vue';
  import {
    PlusOutlined,
    ReloadOutlined,
    ColumnHeightOutlined,
    ToolOutlined,
    ExportOutlined,
  } from '@ant-design/icons-vue';
  import type { UnwrapRef } from 'vue';
  import type { FormProps } from 'ant-design-vue';

  interface FormState {
    user: string;
    password: string;
  }
  const formState: UnwrapRef<FormState> = reactive({
    user: '',
    password: '',
  });
  const handleFinish: FormProps['onFinish'] = (values) => {
    console.log(values, formState);
  };
  const handleFinishFailed: FormProps['onFinishFailed'] = (errors) => {
    console.log(errors);
  };
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Cash Assets',
      className: 'column-money',
      dataIndex: 'money',
    },
    {
      title: 'Address',
      dataIndex: 'address',
    },
  ];

  const data = [
    {
      key: '1',
      name: 'John Brown',
      money: '￥300,000.00',
      address: 'New York No. 1 Lake Park',
    },
    {
      key: '2',
      name: 'Jim Green',
      money: '￥1,256,000.00',
      address: 'London No. 1 Lake Park',
    },
    {
      key: '3',
      name: 'Joe Black',
      money: '￥120,000.00',
      address: 'Sidney No. 1 Lake Park',
    },
  ];
</script>

<style lang="less" scoped>
  .project-container {
    .project-table {
      margin-top: 20px;
    }

    .search-controls {
      display: flex;
      justify-content: flex-end;
      column-gap: 20px;
    }

    .table-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .toolbar-left {
        margin: 0;
        font-size: 16px;
      }

      .toolbar-right {
        display: flex;
        column-gap: 10px;
      }
    }
  }
</style>
