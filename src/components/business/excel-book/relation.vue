<template>
  <a-modal v-model:open="open" title="字段配置" @ok="handleOk" @cancel="handleCancel">
    <div class="relation-field-operation">
      <a-button type="primary" @click="addRelationConfig">添加关联字段</a-button>
    </div>
    <div class="main-field">
      <p style="display: flex; overflow: hidden">
        <span style="max-width: 70px">主字段名：</span>
        <span class="main-field-value" :title="mainField.colName">{{ mainField.colName }}</span>
      </p>
      <p style="display: flex; overflow: hidden">
        <span style="max-width: 70px">主字段值：</span>
        <span class="main-field-value" :title="mainField.text">{{ mainField.text }}</span>
      </p>
    </div>
    <div class="relation-field-header">
      <span>关联字段</span>
      <span>关联字段值</span>
      <span>操作</span>
    </div>
    <div class="relation-field-list-container">
      <ul class="relation-field-list">
        <a-empty v-if="relationConfigList.length === 0" style="margin: auto" />
        <li v-for="(item, index) in relationConfigList" :key="index">
          <a-select
            v-model:value="item.col"
            :options="relationFields"
            :fieldNames="{ label: 'colName', value: 'col' }"
          />
          <span>{{ getRelationFieldColName(item.col) }}</span>
          <div>
            <a-button @click="deleteRelationConfig(index)" size="small">删除</a-button>
          </div>
        </li>
      </ul>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
  import { defineModel, inject, ref, watch } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { getExcelTemplateByIds } from '@/api/backend/api/template';
  import Api from '@/api';

  const props = defineProps<{
    templateId?: string;
    spread: any;
    mainField: {
      row: number;
      col: number;
      colName: string;
      text: string;
    };
    relationFields: {
      row: number;
      col: number;
      colName: string;
      text: string;
    }[];
  }>();

  const refreshExcel = inject('refreshExcel') as (data: any) => void;

  const TEMPLATE_FIELD_DICT_NAME = '多列字段取值字典';
  const open = defineModel('open', { type: Boolean, default: false });
  const relationConfigList = ref<any[]>([]);
  const template = ref<any>(null);

  const createSaveData = function (list: any[]) {
    const sheetName = props.spread.getActiveSheet().name();
    const judgeEmpty = function (data: any) {
      if (data === undefined || data === null || (data.trim && data.trim() === '')) {
        return true;
      }
      return false;
    };
    return list
      .map((item) => {
        if (!item || judgeEmpty(item.colName) || judgeEmpty(item.text)) {
          return;
        }
        return {
          模板名称: template.value.name,
          Sheet名称: sheetName,
          主字段: props.mainField.colName,
          主字段可选值: props.mainField.text,
          联动字段: item.colName,
          联动可选值: item.text,
        };
      })
      .filter((item) => item);
  };

  const getApplicationBindPath = async function () {
    const res1 = await Api.template.getExcelTemplateList({ name: '多列字段取值字典' });
    const res = await Api.applicationData.getApplicationData({
      templateId: res1[0]._id,
    });
    return {
      applicationBindPath: Object.keys(res.applicationData[TEMPLATE_FIELD_DICT_NAME])[0],
      templateId: res1[0]._id,
    };
  };

  const handleOk = async function () {
    const sheetName = template.value?.name;
    if (!sheetName) {
      message.error('模板名称不能为空');
      return;
    }
    const selectedRelationFields = relationConfigList.value.map((item) => {
      return props.relationFields.find((field) => field.col === item.col);
    });
    const tmpSelectedRelationFields = new Set(
      selectedRelationFields.filter((item) => `${item?.colName}-${item?.text}`),
    );
    if (selectedRelationFields.length > tmpSelectedRelationFields.size) {
      message.error('请勿重复选择,请检查关联字段');
      return;
    }
    const saveData = createSaveData(selectedRelationFields);
    const { applicationBindPath, templateId } = await getApplicationBindPath();
    Api.applicationData
      .appendApplicationData({
        templateId,
        applicationData: { [TEMPLATE_FIELD_DICT_NAME]: { [applicationBindPath]: saveData } },
      })
      .then((res) => {
        Modal.confirm({
          title: '提示',
          content: '保存成功，重新加载表格可以生效，是否现在重新加载？',
          onOk: () => {
            // TODO 重新加载表格
            refreshExcel({
              templateId,
            });
          },
        });
        relationConfigList.value = [];
        open.value = false;
      })
      .catch((err) => {
        message.error('保存失败');
      });
  };

  const getRelationFieldColName = function (col: number) {
    return props.relationFields.find((item) => item.col === col)?.text || '--';
  };

  const addRelationConfig = function () {
    relationConfigList.value.push({
      colName: '',
    });
  };

  const deleteRelationConfig = function (index: number) {
    relationConfigList.value.splice(index, 1);
  };

  const handleCancel = function () {
    open.value = false;
    relationConfigList.value = [];
  };

  watch(
    () => props.templateId,
    (newVal) => {
      if (newVal) {
        getExcelTemplateByIds([newVal]).then((res) => {
          if (res.length > 0) {
            template.value = res[0];
          }
        });
      }
    },
  );
</script>

<style lang="less" scoped>
  .relation-field-operation {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
  }
  .main-field {
    display: flex;
    flex-direction: row;
    gap: 10px;
    padding: 10px;
    p {
      flex: 1;
    }
    .main-field-value {
      width: calc(100% - 70px);
      display: inline-block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  .relation-field-header {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    padding: 10px;
    background-color: #f0f8ff;
    span {
      flex: 1;
      text-align: center;
    }
  }
  .relation-field-list-container {
    height: 300px;
    overflow-y: auto;
    display: flex;
    justify-content: center;
  }
  .relation-field-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    li {
      display: flex;
      align-items: center;
      gap: 10px;
      & > * {
        flex: 1;
        text-align: center;
        overflow: auto;
      }
    }
  }
</style>
