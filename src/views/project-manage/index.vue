<template>
  <div class="project-v2">
    <a-table :columns="projectColumns" :data-source="projectDataSource" row-key="合同编号">
      <template #expandedRowRender="{ record }">
        <Device :project-code="record['项目编号']">
          <template #expandTable="{ row }">
            <Engineer
              :key="record.code"
              :project-code="record['项目编号']"
              :device-code="row['code']"
            />
          </template>
        </Device>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, provide, reactive } from 'vue';
  import { projectColumns } from './columns';
  import Engineer from './engineer.vue';
  import Device from './device.vue';
  import { getApplicationData } from '@/api/backend/api/applicationData';

  const projectDataSource = reactive<any[]>([]);
  // 获取项目数据
  const fetchProjectData = async function () {
    const result: any[] = await getApplicationData({ templateId: '67cbfd142863e20432278b59' }).then(
      (res) => {
        return res.applicationData.table;
      },
    );
    projectDataSource.splice(0, projectDataSource.length, ...result);
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
