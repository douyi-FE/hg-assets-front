<template>
  <a-drawer
    title="新增模板"
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
      </a-col>
    </a-row>
  </a-drawer>
</template>

<script setup lang="ts">
  import { nextTick, ref, toRaw, watch } from 'vue';
  import { useUserStore } from '@/store/modules/user';
  import { findMenuByPermission } from '@/permission';
  import ExcelDesigner from '@/components/business/excel-design/index.vue';

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

  const isPermissionDisabledByCode = function () {
    const matchMenuPermiession = findMenuByPermission('template:excel:buildin', menuPerms);
    // status:0-禁用；2-启用
    return matchMenuPermiession?.status !== 1;
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
