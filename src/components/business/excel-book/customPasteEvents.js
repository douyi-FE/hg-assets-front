import { message } from 'ant-design-vue';
export const initCustomPasteEvents = function (spread) {
  // spread.bind(GC.Spread.Sheets.Events.ClipboardPasting, function (sender, args) {
  //   const sheet = args.sheet;
  //   const cellRange = args.cellRange;
  //   const fromRange = args.fromRange;
  //   console.log(args);
  // });
  spread.bind(GC.Spread.Sheets.Events.InvalidOperation, function (e, info) {
    // const invalidType = info.invalidType;
    // if (invalidType === GC.Spread.Sheets.InvalidOperationType.copyPaste) {
    //   message.error(info.message);
    // }
    message.error(info.message);
  });
}