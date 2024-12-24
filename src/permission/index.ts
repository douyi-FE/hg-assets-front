/**
 * example
 * path -> ./modules/user
 * <a-button v-if="$auth('user.add')">Button</a-button>
 * path -> ./modules/sys/user
 * <a-button v-if="$auth('sysUser.add')">Button</a-button>
 */

import type { PermissionType } from './permCode';
import type { App, Directive, DirectiveBinding } from 'vue';
import { useUserStore } from '@/store/modules/user';

export function findMenuByPermission(permCode: PermissionType, menuPerms: Array<any>) {
  let result: any = [];

  function searchMenu(data) {
    data.forEach((item) => {
      // 检查当前项的权限是否与传入的权限一致
      if (item.permission === permCode) {
        result.push(item);
      }
      // 如果有子菜单，递归搜索
      if (item.children && item.children.length > 0) {
        searchMenu(item.children);
      }
    });
  }

  searchMenu(menuPerms);
  return result[0] || {};
}

/**
 * 验证权限
 * @param {PermissionType} perm  权限码
 * @returns {boolean} true | false
 */
export const hasPermission = (permCode: PermissionType) => {
  const permissionList = useUserStore().perms;
  return permissionList.some((n) => n === permCode);
};

const vAuth: Directive = {
  mounted(el: Element, binding: DirectiveBinding<any>) {
    const bindVal = binding.value;

    if (bindVal == undefined) return;

    if (!hasPermission(bindVal)) {
      el.remove();
    }
  },
};

export default {
  install(app: App) {
    app.config.globalProperties.$auth = hasPermission;
    app.directive('auth', vAuth);
  },
};
