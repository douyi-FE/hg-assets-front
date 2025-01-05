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
        <ExcelDesigner
          v-if="isOpen"
          ref="excelDesignRef"
          :sjs="excelTemplate"
          @send-initial-data="onSaveInitialData"
        />
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
            <a-form-item label="是否内置" name="isBuildIn">
              <!-- :disabled="$auth('template:excel:buildin') && isPermissionDisabledByCode()" -->
              <a-radio-group
                v-model:value="formState.isBuildIn"
                v-bind:disabled="formState.isBuildIn === true"
              >
                <a-radio :value="true">是</a-radio>
                <a-radio :value="false">否</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="发布状态" name="status">
              <a-radio-group v-model:value="formState.status">
                <a-radio :value="0">草稿</a-radio>
                <a-radio :value="1">待发布</a-radio>
                <a-radio :value="2">已发布</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="模板描述" name="note">
              <a-textarea v-model:value="formState.note" />
            </a-form-item>
          </a-form>
        </a-card>
        <a-card title="模板版本" style="margin-top: 10px">
          <a-table
            :columns="versionColumns"
            :data-source="versionList"
            :rowClassName="getRowClassName"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'status'">
                <span>
                  <a-tag :color="{ 1: 'red', 2: 'green' }[record.status]">
                    {{ { 1: '未应用', 2: '应用' }[record.status] }}
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
  import { message } from 'ant-design-vue';
  import { versionColumns } from './columns';
  import { useUserStore } from '@/store/modules/user';
  import { findMenuByPermission } from '@/permission';
  import ExcelDesigner from '@/components/business/excel-design/index.vue';
  import Api from '@/api';
  const emits = defineEmits(['open', 'save', 'saveTemplateInitialData']);
  const { menuPerms } = useUserStore();
  const initialState = {
    name: '',
    code: '',
    isBuildIn: false,
    status: 0,
    note: '',
  };
  const formState: { [key: string]: any } = ref({ ...initialState });
  const isOpen = ref(false);
  const excelTemplate = ref();
  const excelDesignRef = ref();
  const formRef = ref();
  const versionList = ref([]);
  const selectedVersion = ref<any>(null);

  const isPermissionDisabledByCode = function () {
    const matchMenuPermiession = findMenuByPermission('template:excel:buildin', menuPerms);
    // status:0-禁用；2-启用
    return matchMenuPermiession?.status !== 1;
  };
  const getRowClassName = function (record: any, index: number) {
    return record._id === selectedVersion.value?._id ? 'selected-version-row' : '';
  };
  const handleApplyVersion = function (record: any) {
    selectedVersion.value = record;
    Api.templateVersion.getExcelTemplateVersion(record._id).then((res) => {
      console.log(res);
      excelTemplate.value = res.file;
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
  const open = function (record: any, ejs: string, type: 'add' | 'edit') {
    if (type === 'add') {
      formState.value = {
        ...initialState,
      };
      excelTemplate.value = undefined;
    } else {
      formState.value = {
        name: record.name,
        code: record.code,
        isBuildIn: record.isBuildIn,
        status: record.status,
        note: record.note,
        id: record._id,
      };
      excelTemplate.value = ejs;
      Api.templateVersion.getExcelTemplateVersionList(record._id).then((res) => {
        versionList.value = res;
      });
    }
    nextTick(() => {
      isOpen.value = true;
    });
  };

  const close = function () {
    isOpen.value = false;
  };

  const onSaveInitialData = async function (data) {
    emits('saveTemplateInitialData', {
      name: formState.value.name,
      code: formState.value.code,
      record: data,
    });
  };

  const saveTemplate = async function () {
    formRef.value.validate().then(async () => {
      const sjs = await excelDesignRef.value.getSpreadSJS();
      emits(
        'save',
        {
          ...toRaw(formState.value),
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
    });
  };

  watch(isOpen, (curIsOpen) => {
    if (curIsOpen === false) {
      formRef.value.clearValidate();
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
