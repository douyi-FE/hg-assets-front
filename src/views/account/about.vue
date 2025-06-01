<template>
  <div>
    <Card class="mt-3">
      <Descriptions title="生产环境依赖" bordered>
        <template v-for="(value, key) in pkg.dependencies" :key="key">
          <Descriptions.Item :label="key">
            <BlankLink :url="key" :text="value" />
          </Descriptions.Item>
        </template>
      </Descriptions>
    </Card>
    <Card class="mt-3">
      <Descriptions title="开发环境依赖" bordered>
        <template v-for="(value, key) in pkg.devDependencies" :key="key">
          <Descriptions.Item :label="key">
            <BlankLink :url="key" :text="value" />
          </Descriptions.Item>
        </template>
      </Descriptions>
    </Card>
  </div>
</template>

<script setup lang="tsx">
  import { Descriptions, Card, Tag } from 'ant-design-vue';

  defineOptions({
    name: 'About',
  });

  const { pkg, lastBuildTime } = __APP_INFO__;
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

  type DepType = keyof typeof allDeps;

  const BlankLink = ({ url = '', text }) => {
    const target = /^http(s)?:/.test(url) ? url : `https://www.npmjs.com/package/${url}`;
    return (
      <a href={target} target="_blank">
        {text}
      </a>
    );
  };

  const getMajorVersion = (depName: DepType) => {
    return allDeps[depName].match(/\d+/)?.[0] || '';
  };

  const description = `
    的前端项目是基于 Vue${getMajorVersion('vue')}.x、
    Vite${getMajorVersion('vite')}.x、
    Ant-Design-Vue${getMajorVersion('ant-design-vue')}.x 、
    TypeScript${getMajorVersion('typescript')}.x 开发，
    内置了动态路由、权限验证、并提供了常用的功能组件，帮助你快速搭建企业级中后台产品原型。
    原则上不会限制任何代码用于商用。
  `;
</script>
