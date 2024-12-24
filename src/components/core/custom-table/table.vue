<template>
  <Teleport to="body" :disabled="!isFullscreen">
    <div class="table-container">
      <div v-show="isSearch" class="search-form">
        <a-form
          ref="searchFormRef"
          layout="inline"
          :model="searchModel"
          :label-col="{ span: 6 }"
          :wrapperCol="{ span: 16, offset: 2 }"
        >
          <a-form-item v-for="item in searchModelItems" :key="item.dataIndex" :label="item.title">
            <a-input v-model:value="searchModel[item.dataIndex]" placeholder="请输入申请编号" />
          </a-form-item>
        </a-form>
        <div class="search-btn-group">
          <a-button @click="resetForm">重置</a-button>
          <a-button type="primary" @click="searchTableByFilter">查询</a-button>
        </div>
      </div>
      <div class="table-wrapper">
        <div class="table-header">
          <h2>{{ title }}</h2>
          <div>
            <a-space :size="8">
              <slot name="tableHeaderGrooup" />
              <tableSetting
                :search="isSearch"
                :is-fullscreen="isFullscreen"
                :columns="tableColumns"
                @toggle-search="toggleSearch"
                @refresh="refresh"
                @toggle-fullscreen="toggleFullScreen"
                @size-change="switchTableSize"
                @toggle-header="toggleTableHeader"
                @toggle-index="toggleIndexColumn"
                @toggle-border="toggleTableBorder"
              />
            </a-space>
          </div>
        </div>
        <a-table
          :columns="tableColumns"
          :data-source="dataSource"
          :scroll="{ x: true, y: 800 }"
          :loading="isLoading"
          :showHeader="isShowHeader"
          :bordered="isTableBorder"
          :size="size"
          row-key="id"
        >
          <template #bodyCell="slotData">
            <template v-if="slotData.column.dataIndex === 'index'">
              {{ slotData.index + 1 }}
            </template>
            <slot name="bodyCell" v-bind="slotData" />
          </template>
        </a-table>
      </div>
    </div>
  </Teleport>
</template>
/:label="columns.find((col) => col.dataIndex === key)['title']"
<script setup lang="ts">
  import { getCurrentInstance, ref, watch } from 'vue';
  import tableSetting from './setting.vue';
  import type { SizeType } from 'ant-design-vue/es/config-provider/context';

  const props = withDefaults(
    defineProps<{
      columns: Array<any>;
      dataSource: Array<any>;
      isLoading: boolean;
      title: string;
      searchFields: { [key: string]: any };
    }>(),
    {
      columns: () => [],
      dataSource: () => [],
      isLoading: false,
      title: '',
      searchFields: () => ({}),
    },
  );
  const emits = defineEmits(['refresh', 'searchModelChange']);
  const searchFormRef = ref();
  const searchModel = ref({});
  const searchModelItems = ref<Array<any>>([]);
  const isFullscreen = ref(false);
  const isSearch = ref(true);
  const isShowHeader = ref(true);
  const isTableBorder = ref(true);
  const size = ref<SizeType>('small');
  const currentInstance = getCurrentInstance();

  const tableColumns = ref<Array<any>>([]);

  watch(
    () => props.columns,
    (curColumns) => {
      tableColumns.value = curColumns;
    },
    {
      immediate: true,
    },
  );
  watch(
    () => props.searchFields,
    (curSearchFields) => {
      Object.keys(curSearchFields).forEach((key) => {
        const temp = props.columns.find((col) => col.dataIndex === key);
        temp !== undefined && searchModelItems.value.push(temp);
      });
      searchModel.value = curSearchFields;
    },
    {
      immediate: true,
    },
  );
  const searchTableByFilter = function () {
    emits('searchModelChange', searchModel.value);
  };

  const toggleSearch = function (isShow: boolean) {
    isSearch.value = isShow;
  };
  const refresh = function () {
    emits('refresh');
  };
  const switchTableSize = function (type: SizeType) {
    size.value = type;
  };
  const updateAppContainerStyle = () => {
    const appEl: HTMLDivElement =
      currentInstance?.appContext.app._container || document.querySelector('#app');

    appEl.style.setProperty('opacity', isFullscreen.value ? '0' : '1');
    appEl.style.setProperty('visibility', isFullscreen.value ? 'hidden' : 'visible');
    appEl.style.setProperty('position', isFullscreen.value ? 'absolute' : 'relative');
  };
  const toggleFullScreen = function (isFull: boolean) {
    isFullscreen.value = isFull;
    updateAppContainerStyle();
  };
  const toggleTableHeader = function (isShow: boolean) {
    isShowHeader.value = isShow;
  };
  const toggleIndexColumn = function (isShow: boolean) {
    if (isShow) {
      tableColumns.value.unshift({
        title: '序号',
        dataIndex: 'index',
        width: 50,
      });
    } else {
      tableColumns.value.splice(0, 1);
    }
  };
  const toggleTableBorder = function (isShow: boolean) {
    isTableBorder.value = isShow;
  };
  const resetForm = () => {
    // searchFormRef.value.resetFields();
    searchModel.value = {};
  };
</script>

<style lang="less" scoped>
  .table-container {
    display: flex;
    flex-direction: column;
    row-gap: 20px;

    .search-form {
      display: flex;
      justify-content: space-between;
      padding: 20px;
      background-color: #fff;

      .search-btn-group {
        display: flex;
        column-gap: 20px;
      }
    }

    .table-wrapper {
      padding: 20px;
      background-color: #fff;

      .table-header {
        display: flex;
        justify-content: space-between;
      }
    }
  }
</style>
