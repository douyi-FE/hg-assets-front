<template>
  <a-form
    ref="formRef"
    :model="formState"
    :rules="rules"
    :label-col="labelCol"
    :wrapper-col="wrapperCol"
  >
    <a-row :gutter="24" justify="start">
      <a-col :span="8">
        <a-form-item ref="name" label="申请编号：" name="name" required>
          <a-input v-model:value="formState.name" disabled />
        </a-form-item>
      </a-col>
      <a-col :span="16">
        <a-form-item label="项目名称" name="region">
          <a-select v-model:value="formState.region" placeholder="请输选择目名称">
            <a-select-option value="shanghai"
              >2020-YW-02279-01
              山东滨华新材料有限公司碳三碳四综合利用项目全过程造价咨询</a-select-option
            >
            <a-select-option value="beijing"
              >2020-YW-02279-01
              山东滨华新材料有限公司碳三碳四综合利用项目全过程造价咨询</a-select-option
            >
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="14">
        <a-form-item label="项目承接主管" name="manager" :labelCol="{ span: 6 }">
          <a-input v-model:value="formState.manager" disabled />
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item label="业务类型" name="date1">
          <a-input value="" disabled />
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item label="所属部门" name="date1">
          <a-input value="xx部门" disabled /> </a-form-item
      ></a-col>
      <a-col :span="8">
        <a-form-item label="所属分支机构" name="date1">
          <a-input value="xx机构" disabled /> </a-form-item
      ></a-col>
      <a-col :span="8">
        <a-form-item label="合同编号" name="contractCode" required>
          <a-select v-model:value="formState.contractCode" placeholder="请选择合并编号">
            <a-select-option value="2020-QJGW-00992">2020-QJGW-00992</a-select-option>
            <a-select-option value="2020-QJGW-00992">2020-QJGW-00992</a-select-option>
          </a-select>
        </a-form-item></a-col
      >
      <a-col :span="8">
        <a-form-item label="合同名称" name="date1">
          <a-input
            value="山东滨华新材料有限公司碳三碳四综合利用项目工程造价咨询服务合同"
            disabled
          /> </a-form-item
      ></a-col>
      <a-col :span="16">
        <a-form-item label="开票机构" name="anency" :labelCol="{ span: 4 }" required>
          <a-input v-model:value="formState.anency" disabled /> </a-form-item
      ></a-col>
    </a-row>
  </a-form>
</template>
<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import type { UnwrapRef } from 'vue';
  import type { Rule } from 'ant-design-vue/es/form';

  interface FormState {
    name: string;
    region: string | undefined;
    manager: string;
    delivery: boolean;
    type: string[];
    resource: string;
    desc: string;
    anency: string;
    contractCode: string;
  }
  const formRef = ref();
  const labelCol = { span: 8 };
  const wrapperCol = { span: 16 };
  const formState: UnwrapRef<FormState> = reactive({
    name: 'sdfgd-fgh7fgh-ghjh',
    region: undefined,
    manager: '张三',
    delivery: false,
    type: [],
    resource: '',
    desc: '',
    anency: '工程顾问有限公司',
    contractCode: '',
  });
  const rules: Record<string, Rule[]> = {
    name: [{ required: true, message: '申请编号不能为空', trigger: 'change' }],
    anency: [{ required: true, message: '开票机构不能为空', trigger: 'change' }],
    region: [{ required: true, message: '请选择项目', trigger: 'change' }],
    contractCode: [{ required: true, message: '请选择合同编号', trigger: 'change' }],
    manager: [{ required: true, message: '项目主管不能为空', trigger: 'change' }],
    type: [
      {
        type: 'array',
        required: true,
        message: 'Please select at least one activity type',
        trigger: 'change',
      },
    ],
    resource: [{ required: true, message: 'Please select activity resource', trigger: 'change' }],
    desc: [{ required: true, message: 'Please input activity form', trigger: 'blur' }],
  };
  const onSubmit = () => {
    return formRef.value.validate();
  };
  // const resetForm = () => {
  //   formRef.value.resetFields();
  // };

  defineExpose({
    onSubmit,
  });
</script>
