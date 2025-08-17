<template>
  <a-drawer
    :title="formState.id ? '编辑模板' : '新增模板'"
    width="100%"
    :open="isOpen"
    :get-container="false"
    :style="{ position: 'absolute' }"
    @close="isOpen = false"
  >
    <template #extra>
      <a-button style="margin-right: 8px" @click="isOpen = false">取消</a-button>
      <a-button type="primary" @click="saveTemplate">保存</a-button>
    </template>
    <a-row :gutter="20" style="height: 100%">
      <a-col :span="18">
        <ejs-design ref="ejsDesignRef" :key="ejsKey" />
      </a-col>
      <a-col :span="6">
        <a-card title="模板信息">
          <a-form
            ref="formRef"
            :model="formState"
            :label-col="{ style: { width: '100px' } }"
            :wrapper-col="{ span: 20 }"
          >
            <a-form-item label="模板名称" name="name" :required="true">
              <a-input v-model:value="formState.name" />
            </a-form-item>
            <a-form-item label="模板编码" name="code" :required="true">
              <a-input v-model:value="formState.code" />
            </a-form-item>
            <a-form-item label="流程绑定" name="flowPath">
              <a-select v-model:value="formState.flowPath" placeholder="请选择流程">
                <a-select-option v-for="item in flowList" :key="item.id" :value="item.modelId">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="是否内置" name="isBuildIn">
              <!-- :disabled="$auth('template:excel:buildin') && isPermissionDisabledByCode()" -->
              <a-radio-group v-model:value="formState.isBuildIn">
                <a-radio :value="true">是</a-radio>
                <a-radio :value="false">否</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="模板描述" name="note">
              <a-textarea v-model:value="formState.note" />
            </a-form-item>
          </a-form>
        </a-card>
        <!-- 历史版本 高度不超过600px -->
        <a-card title="历史版本" style="margin-top: 10px; max-height: 600px; overflow-y: auto">
          <a-table
            :columns="versionColumns"
            :data-source="versionList"
            :rowClassName="getRowClassName"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'status'">
                <span>
                  <a-tag :color="{ 1: 'gray', 2: 'green' }[record.status]">
                    {{ { 1: '已过期', 2: '应用中' }[record.status] }}
                  </a-tag>
                </span>
              </template>
              <template v-else-if="column.dataIndex === 'action'">
                <a-button type="link" @click="handleApplyVersion(record)">选中</a-button>
                <a-popconfirm
                  title="确认删除吗?"
                  ok-text="确认"
                  cancel-text="取消"
                  @confirm="handleDeleteVersion(record)"
                >
                  <a-button type="link" :disabled="record.status === 2">删除</a-button>
                </a-popconfirm>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </a-drawer>
</template>

<script setup lang="ts">
  import { nextTick, ref, toRaw, watch } from 'vue';
  import { uniqueId } from 'lodash-es';
  import { message } from 'ant-design-vue';
  import { versionColumns } from './columns';
  import ejsDesign from '@/components/basic/ejs-design/index.vue';
  import Api from '@/api';
  import { getInitData, showAlert } from '@/components/basic/ejs-design/resource/commonFunctions';
  import { getYuDaoFlowList } from '@/api/backend/api/workspace';

  const emits = defineEmits(['open', 'save']);
  const initialState = {
    name: '',
    code: '',
    isBuildIn: false,
    status: 0,
    note: '',
    flowPath: '',
  };
  const formState: { [key: string]: any } = ref({ ...initialState });
  const isOpen = ref(false);
  const ejsDesignRef = ref();
  const formRef = ref();
  const versionList = ref([]);
  const selectedVersion = ref<any>(null);
  const ejsKey = ref('');
  const flowList = ref<any[]>([]);

  const getRowClassName = function (record: any, index: number) {
    return record._id === selectedVersion.value?._id ? 'selected-version-row' : '';
  };
  const handleApplyVersion = function (record: any) {
    selectedVersion.value = record;
    Api.templateVersion.getExcelTemplateVersion(record._id).then((res) => {
      ejsDesignRef.value.setSJS(res.file, record.name + '.xlsx', res.initDataSource);
    });
  };
  const handleDeleteVersion = function (record: any) {
    Api.templateVersion.deleteExcelTemplateVersion(record._id).then((res) => {
      message.success('删除成功');
      Api.templateVersion.getExcelTemplateVersionList(formState.value.id).then((res) => {
        versionList.value = res;
      });
    });
  };
  const open = async function (record: any, ejs: string, type: 'add' | 'edit') {
    ejsKey.value = uniqueId('ejs_');

    if (type === 'add') {
      formState.value = {
        ...initialState,
      };
      versionList.value = [];
    } else {
      formState.value = {
        name: record.name,
        code: record.code,
        isBuildIn: record.isBuildIn,
        status: record.status,
        note: record.note,
        id: record._id,
      };
      Api.templateVersion.getExcelTemplateVersionList(record._id).then((res) => {
        versionList.value = res;
      });
    }

    // 先打开抽屉
    isOpen.value = true;
    // 等待下一个tick，确保组件已挂载
    await nextTick();
    // 如果是编辑模式，再设置SJS
    if (type === 'edit') {
      ejsDesignRef.value?.setSJS(ejs, record.name + '.xlsx', record.initDataSource);
    }
  };

  const close = function () {
    isOpen.value = false;
  };

  const saveTemplate = async function () {
    formRef.value
      .validate()
      .then(async () => {
        const sjs = await ejsDesignRef.value.getSpreadSJS();
        const initDataSource = getInitData();
        if (Object.keys(initDataSource).length === 0) {
          message.error('未发现有效绑定数据，请检查是否完成了表格绑定');
          return;
        }
        emits(
          'save',
          {
            ...toRaw(formState.value),
            initDataSource,
          },
          sjs,
          selectedVersion.value
            ? {
                id: selectedVersion.value._id,
                note: formState.value.note,
                status: 2,
              }
            : null,
        );
      })
      .catch((err) => {
        showAlert('保存失败，请检查表单填写', 'error');
      });
  };

  watch(isOpen, (curIsOpen) => {
    if (curIsOpen === false) {
      formRef.value.clearValidate();
    } else {
      getYuDaoFlowList().then((res) => {
        flowList.value = res.data;
        console.log('flowList', flowList.value);
      });
    }
  });

  defineExpose({
    open,
    close,
  });
</script>

<style lang="less">
  .selected-version-row {
    background-color: #e6f4ff;
  }
</style>
