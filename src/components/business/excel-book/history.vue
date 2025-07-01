<template>
  <a-drawer :open="isShowHistoryList" width="800px" @close="isShowHistoryList = false">
    <div class="search-container">
      <a-input
        v-model:value="searchName"
        placeholder="搜索名称"
        style="width: 200px; margin-right: auto"
      />
      <a-button type="primary" @click="handleSearch">搜索</a-button>
      <a-button @click="handleReset">重置</a-button>
    </div>
    <a-table :columns="historyVersionListColumns" :data-source="historyVersionListData">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'name'">
          <div class="editable-cell">
            <div v-if="isEditName" class="editable-cell-input-wrapper">
              <a-input v-model:value="record.name" />
              <check-outlined class="editable-cell-icon-check" @click="saveName(record)" />
              <close-outlined class="editable-cell-icon-close" @click="isEditName = false" />
            </div>
            <div v-else class="editable-cell-text-wrapper">
              {{ record.name || ' ' }}
              <edit-outlined class="editable-cell-icon" @click="edit(record)" />
            </div>
          </div>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a-button type="primary" @click="handleHistoryVersionApply(record)">应用</a-button>
            <a-popconfirm
              title="确定删除该版本吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleHistoryVersionDelete(record)"
            >
              <a-button type="link">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref, defineModel, watch } from 'vue';
  import { CheckOutlined, EditOutlined, CloseOutlined } from '@ant-design/icons-vue';
  import { message } from 'ant-design-vue';
  import {
    getApplicationDataHistoryList,
    deleteApplicationDataHistory,
    updateApplicationDataHistoryName,
  } from '@/api/backend/api/templateDataHistory';

  const props = defineProps({
    applicationId: {
      type: String,
      required: true,
    },
  });
  const emits = defineEmits(['historyVersionApply']);
  const isShowHistoryList = defineModel<boolean>('isShowHistoryList', { required: true });
  const historyVersionListColumns = ref([
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
    },
    {
      title: '操作',
      dataIndex: 'action',
    },
  ]);
  const historyVersionListData = ref([]);
  const isEditName = ref(false);
  const searchName = ref('');
  const saveName = function (record: any) {
    updateApplicationDataHistoryName({
      id: record._id,
      name: record.name,
    })
      .then((res) => {
        message.success('保存名称成功');
        isEditName.value = false;
      })
      .catch((err) => {
        message.error('保存名称失败');
      });
  };

  const edit = function (record: any) {
    isEditName.value = true;
  };
  const fetchHistoryVersionList = function (params: any = {}) {
    getApplicationDataHistoryList({
      applicationId: props.applicationId,
      ...params,
    }).then((res) => {
      historyVersionListData.value = res;
    });
  };

  const handleHistoryVersionApply = function (record: any) {
    emits('historyVersionApply', record._id);
  };

  const handleHistoryVersionDelete = function (record: any) {
    deleteApplicationDataHistory({
      id: record._id,
    }).then((res) => {
      message.success('删除成功');
      fetchHistoryVersionList();
    });
  };

  const handleSearch = function () {
    fetchHistoryVersionList({
      name: searchName.value,
    });
  };

  const handleReset = function () {
    searchName.value = '';
    fetchHistoryVersionList();
  };

  watch(
    isShowHistoryList,
    (newVal) => {
      if (newVal) {
        fetchHistoryVersionList();
      }
    },
    {
      immediate: true,
    },
  );
</script>

<style lang="less" scoped>
  .search-container {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .editable-cell {
    .editable-cell-text-wrapper {
      .editable-cell-icon {
        display: none;
      }
      &:hover {
        .editable-cell-icon {
          display: block;
        }
      }
    }
  }
</style>
