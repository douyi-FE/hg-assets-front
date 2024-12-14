<template>
  <div class="project-container">
    <DynamicTable
      size="small"
      bordered
      :columns="columns"
      row-key="id"
      :loading="isLoading"
      :data-source="projectList"
      headerTitle="项目列表"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'operator'">
          <a-button type="primary" :icon="h(DeleteOutlined)" @click="console.log(record)" />
          <a-button type="error" style="margin-left: 10px" :icon="h(FormOutlined)" />
        </template>
      </template>
    </DynamicTable>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, ref, h } from 'vue';
  import { DeleteOutlined, FormOutlined } from '@ant-design/icons-vue';
  import { columns } from './columns';
  import { getProjectList } from '@/api/basis/project';
  const projectList = ref([]);
  const isLoading = ref(false);

  const fetchProjectList = function () {
    isLoading.value = true;
    getProjectList({ project: '测试项目' })
      .then((res: any) => {
        projectList.value = res.list;
        console.log('项目列表:', res);
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  onMounted(() => {
    fetchProjectList();
  });
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
