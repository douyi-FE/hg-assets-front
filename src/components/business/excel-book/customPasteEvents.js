import { message } from 'ant-design-vue';
export const initCustomPasteEvents = function (spread) {
  spread.bind(GC.Spread.Sheets.Events.Paste, function (e, info) {
    console.log(info);
  });
}