/*
 * @Author: chenkh
 * @Date: 2025-05-24 10:00:00
 * @LastEditors: chenkh
 * @LastEditTime: 2025-05-24 10:00:01
 * @Description: 附件列表模态框v2
 */

import { ref } from 'vue';
import Api from '@/api';
import {
  base64ToArrayBuffer,
  base64ToBlob,
} from '@/components/basic/ejs-design/resource/commonFunctions';
import { eventBus } from '@/utils/event-bus';
import { message } from 'ant-design-vue';

const attachListData = ref([]);

export const uploadAttachFile = () => {
  eventBus.emit('addAttach');
};

export const downloadAttachAll = () => {
  eventBus.emit('downloadAll', attachListData.value);
};
export const previewFile = (fileId) => {
  eventBus.emit('previewFile', fileId);
};
export const downloadFile = async (record) => {
  // 下载文件
  const response = await Api.templateAttach.download({
    fileId: record.fileId,
  });
  if (response && response._doc) {
    const file = await response._doc.fileContent;
    const fileBlob = base64ToBlob(file);
    const fileName = record.originalFileName;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(fileBlob);
    a.download = fileName;
    a.click();
  } else {
    message.error('下载失败');
  }
};
export const deleteFile = async (fileId, index) => {
  try {
    await Api.templateAttach.deleteFile({
      fileId: fileId,
    });
    attachListData.value.splice(index, 1);
    eventBus.emit('deleteFile', attachListData.value);
    eventBus.emit('setAttachListData', [...attachListData.value]);
    message.success('删除成功');
  } catch (error) {
    message.error('删除失败');
  }
};
