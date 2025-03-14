import type { Rule } from 'ant-design-vue/es/form';

export const rules: Record<string, Rule[]> = {
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
