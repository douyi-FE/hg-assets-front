# SSO单点登录功能说明

## 功能概述

本项目实现了从Node.js系统到Java系统的单点登录(SSO)功能。用户可以通过访问SSO页面，自动完成身份验证并跳转到Java系统的流程模块。

## 实现流程

1. **Token转换**: 将Node.js系统的JWT Token转换为OAuth2格式
2. **Java系统登录**: 使用转换后的Token在Java系统中进行单点登录
3. **页面跳转**: 获取Java系统的访问Token后跳转到目标页面

## 接口说明

### 1. Node.js Token转换接口
- **URL**: `POST /api/oauth2-adapter/convert-to-oauth2`
- **请求头**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {NodeJS项目TOKEN}`
- **请求体**: 
  ```json
  {
    "token": "NodeJS项目TOKEN"
  }
  ```

### 2. Java单点登录接口
- **URL**: `POST http://127.0.0.1:48080/api/oauth2/sso/login`
- **请求头**:
  - `Content-Type: application/json`
  - `tenant-id: 1`
- **请求体**: Token转换接口的完整响应

## 使用方法

### 1. 通过路由访问
访问 `/sso` 路径即可触发SSO流程：
```
http://localhost:8088/#/sso
```

### 2. 通过编程方式调用
```javascript
import { useRouter } from 'vue-router';

const router = useRouter();
router.push('/sso');
```

## 页面流程

1. **加载状态**: 显示"正在处理单点登录..."
2. **获取Token**: 显示"正在获取用户Token..."
3. **Token转换**: 显示"正在转换Token..."
4. **Java登录**: 显示"正在登录Java系统..."
5. **页面跳转**: 显示"正在跳转到Java系统..."
6. **完成**: 自动跳转到Java系统页面

## 错误处理

- **用户未登录**: 提示"用户未登录，请先登录"
- **Token转换失败**: 提示"Token转换失败"
- **Java系统登录失败**: 显示具体的错误信息
- **网络错误**: 提示"单点登录失败，请重试"

## 配置说明

### Java系统地址
在 `src/api/backend/api/sso.ts` 文件中可以修改Java系统的地址：
```typescript
const javaBaseURL = import.meta.env.VITE_JAVA_BASE_URL || 'http://127.0.0.1:48080';
```

#### 环境变量配置
推荐使用环境变量来配置Java系统地址，这样可以在不同环境中灵活配置：

1. **开发环境**：创建 `.env.development` 文件
```bash
VITE_JAVA_BASE_URL=http://127.0.0.1:48080
```

2. **生产环境**：创建 `.env.production` 文件
```bash
VITE_JAVA_BASE_URL=http://localhost:48080
```

3. **通用配置**：创建 `.env` 文件
```bash
VITE_JAVA_BASE_URL=http://127.0.0.1:48080
```

#### 环境变量优先级
- `.env.local` (本地开发，不提交到git)
- `.env.development` (开发环境)
- `.env.production` (生产环境)
- `.env` (通用配置)
- 代码中的默认值

### 目标页面地址
在 `src/views/sso/sso.vue` 文件中可以修改跳转的目标地址：
```typescript
const javaUrl = `http://localhost/index?token=${encodeURIComponent(javaToken)}`;
```

## 菜单配置

**重要**: 本项目的菜单和路由是通过数据库动态配置的，不是代码中写死的。

### 在数据库中配置SSO菜单项

1. 登录系统管理后台
2. 进入"系统管理" -> "菜单管理"
3. 添加新的菜单项，配置如下：
   - **菜单类型**: 菜单
   - **节点名称**: 单点登录
   - **上级节点**: 选择合适的父级菜单
   - **路由地址**: `/sso`
   - **文件路径**: 在级联选择器中选择 `sso/sso`
   - **权限标识**: `system:sso:access` (可选)
   - **节点图标**: 选择合适的图标
   - **排序号**: 根据需要设置
   - **是否显示**: 是
   - **状态**: 启用
   - **是否缓存**: 否 (建议设置为否，因为SSO页面会跳转到外部系统)

### 文件路径说明

文件路径是通过系统自动扫描 `src/views` 目录生成的。由于我们已经创建了 `src/views/sso/sso.vue` 文件，在菜单配置时，您应该能在文件路径的级联选择器中看到 `sso/sso` 选项。

如果看不到该选项，请确保：
1. `src/views/sso/sso.vue` 文件已正确创建
2. 重新启动开发服务器，让系统重新扫描文件
3. 清除浏览器缓存

### 权限配置

如果需要控制SSO功能的访问权限，可以在角色管理中为相应角色分配 `system:sso:access` 权限。

## 注意事项

1. 确保Node.js后端服务正常运行在 `http://127.0.0.1:7001`
2. 确保Java后端服务正常运行在 `http://127.0.0.1:48080`
3. 确保Java前端服务正常运行在 `http://localhost`
4. 用户必须先登录Node.js系统才能使用SSO功能
5. 菜单项需要在数据库中进行配置，配置后会自动出现在用户菜单中
6. 如果设置了权限控制，需要确保用户有相应的访问权限
7. **重要**：在生产环境中，请通过环境变量 `VITE_JAVA_BASE_URL` 配置Java系统的正确地址
8. 如果Java系统和Node.js系统部署在同一台服务器上，可以配置为 `http://localhost:48080`

## 技术实现

- **前端框架**: Vue 3 + TypeScript
- **状态管理**: Pinia
- **UI组件**: Ant Design Vue
- **HTTP客户端**: Axios
- **路由管理**: Vue Router (动态路由)
- **菜单管理**: 数据库配置 + 动态加载

## 文件结构

```
src/
├── api/backend/api/
│   ├── sso.ts              # SSO相关API接口
│   └── typings.d.ts        # API类型定义
└── views/sso/
    └── sso.vue            # SSO页面组件
```

## 动态路由机制

本项目使用动态路由机制，菜单和路由配置流程如下：

1. 用户登录后，系统调用 `accountMenu()` 接口获取用户菜单权限
2. 调用 `generateDynamicRoutes()` 函数将菜单数据转换为Vue Router路由
3. 动态添加路由到路由器中
4. 根据用户权限过滤和排序菜单项

因此，SSO功能不需要在代码中配置静态路由，只需要：
1. 创建 `src/views/sso/sso.vue` 页面组件
2. 在数据库菜单管理中配置相应的菜单项
3. 确保用户有访问权限 