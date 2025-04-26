<template>
  <div class="project-v2">
    <a-table
      :columns="projectColumns"
      :data-source="projectDataSource"
      row-key="code"
      @expand="
        (expanded, record) => {
          record.childred = fetchDeviceData(record.project_code);
        }
      "
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'operation'">
          <a-popconfirm
            title="确认删除此数据吗?"
            ok-text="是"
            cancel-text="否"
            @confirm="deleteProjectRecord(record)"
          >
            <a-button type="link">删除</a-button>
          </a-popconfirm>
        </template>
      </template>
      <template #expandedRowRender="{ record }">
        <Device :data-source="record.childred">
          <template #expandTable="{ dataSource }">
            <Engineer :key="record.code" :data-source="dataSource" />
          </template>
        </Device>
      </template>
      <template #title>
        <div class="table-header-wrapper">
          <a-button size="small" type="primary" @click="formDrawerRef.openDrawer()">添加</a-button>
        </div>
      </template>
    </a-table>
    <FormDrawer ref="formDrawerRef" />
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, provide, reactive, ref } from 'vue';
  import { message } from 'ant-design-vue';
  import { projectColumns } from './columns';
  import Engineer from './engineer.vue';
  import Device from './device.vue';
  import FormDrawer from './forms/index.vue';
  import { deleteProject, getProjectList } from '@/api/backend/api/project';

  const formDrawerRef = ref();
  const projectDataSource = reactive<any[]>([]);
  const fetchDeviceData = function (code) {
    return [
      {
        name: '某某设备' + code,
        code: 'gd345-fgnh3-gfsd1' + code,
      },
    ];
  };
  // 获取项目数据
  const fetchProjectData = async function () {
    const list = await getProjectList({});
    projectDataSource.splice(0, projectDataSource.length, ...list);
  };
  // 删除项目数据
  const deleteProjectRecord = function (project: any) {
    console.log('delete project:', project);
    deleteProject(project._id)
      .then(() => {
        message.success('删除成功');
        fetchProjectData();
      })
      .catch(() => {
        message.error('删除失败');
      });
  };

  provide('refreshProjectList', () => {
    fetchProjectData();
  });

  onMounted(() => {
    fetchProjectData();
  });
</script>

<style lang="less" scoped>
  .project-v2 {
    .table-header-wrapper {
      display: flex;
      justify-content: flex-end;
    }
  }
  /* 子表格缩进 */
  :deep(.ant-table-expanded-row) .ant-table {
    margin-left: 0 !important;
    background: #fafafa;
  }
  :deep(.ant-table-expanded-row .ant-table-expanded-row) .ant-table {
    margin-left: 48px !important;
    background: #fafafa;
  }
</style>
