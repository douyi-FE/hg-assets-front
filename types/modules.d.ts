declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const Component: DefineComponent<{}, {}, any>;
  export default Component;
}

declare module 'ant-design-vue/es/locale/*' {
  import type { Locale } from 'ant-design-vue/types/locale-provider';
  const locale: Locale & ReadonlyRecordable;
  export default locale as Locale & ReadonlyRecordable;
}

declare module 'virtual:*' {
  const result: any;
  export default result;
}

declare module 'mxcad' {
  export const createMxCad: any;
  export const McObjectId: any;
  export const MxCADResbuf: any;
  export const MxCADSelectionSet: any;
  export const McDbLine: any;
  export const McCmColor: any;
  export const McGePoint3d: any;
  export const MxCpp: any;
  export const McDb: any;
  export const McDbPolyline: any;
}

declare module 'nanoid';
