// 后端接口地址
export const allTemplatesUrl = 'http://localhost:8088/api/template/attach/allTemplates';
export const templateUrl = 'http://localhost:8088/api/template/attach';
export const submitUrl = 'http://localhost:8088/api/template/attach/submit';
// 表格附件相关接口
export const uploadUrl = 'http://localhost:8088/api/template/attach/upload';
export const downloadUrl = 'http://localhost:8088/api/template/attach/download';
export const downloadZipUrl = 'http://localhost:8088/api/template/attach/downloadZip';
export const findFileUrl = 'http://localhost:8088/api/template/attach/findByFileId';
export const deleteUrl = 'http://localhost:8088/api/template/attach/delete';

// 附件列表模态框v2 表格列
export const attachListColumns = [
  {
    title: '文件名称',
    dataIndex: 'originalFileName',
  },
  {
    title: '文件类型',
    dataIndex: 'fileExtension',
  },
  {
    title: '文件大小',
    dataIndex: 'fileSize',
  },
  {
    title: '上传时间',
    dataIndex: 'fileTime',
  },
  {
    title: '操作',
    dataIndex: 'action',
  },
];
