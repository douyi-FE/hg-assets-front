// vite.config.ts
import { resolve } from "node:path";
import { loadEnv } from "file:///D:/codes/hg-assets-front/node_modules/.pnpm/vite@5.4.10_@types+node@22.7.4_less@4.2.0/node_modules/vite/dist/node/index.js";
import vueJsx from "file:///D:/codes/hg-assets-front/node_modules/.pnpm/@vitejs+plugin-vue-jsx@4.0.1_vite@5.4.10_@types+node@22.7.4_less@4.2.0__vue@3.5.12_typescript@5.6.3_/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import mkcert from "file:///D:/codes/hg-assets-front/node_modules/.pnpm/vite-plugin-mkcert@1.17.6_vite@5.4.10_@types+node@22.7.4_less@4.2.0_/node_modules/vite-plugin-mkcert/dist/mkcert.mjs";
import vue from "file:///D:/codes/hg-assets-front/node_modules/.pnpm/@vitejs+plugin-vue@5.1.4_vite@5.4.10_@types+node@22.7.4_less@4.2.0__vue@3.5.12_typescript@5.6.3_/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import checker from "file:///D:/codes/hg-assets-front/node_modules/.pnpm/vite-plugin-checker@0.8.0_eslint@9.13.0_jiti@2.1.2__optionator@0.9.4_stylelint@16.10.0_typesc_jyj2itufgh7cwbfpvfkud3cihm/node_modules/vite-plugin-checker/dist/esm/main.js";
import Components from "file:///D:/codes/hg-assets-front/node_modules/.pnpm/unplugin-vue-components@0.27.4_@babel+parser@7.25.7_@nuxt+kit@3.13.2_rollup@4.24.0__rollup@4._c3vpni3bzoq3fyhxzqt3odfzma/node_modules/unplugin-vue-components/dist/vite.js";
import { AntDesignVueResolver } from "file:///D:/codes/hg-assets-front/node_modules/.pnpm/unplugin-vue-components@0.27.4_@babel+parser@7.25.7_@nuxt+kit@3.13.2_rollup@4.24.0__rollup@4._c3vpni3bzoq3fyhxzqt3odfzma/node_modules/unplugin-vue-components/dist/resolvers.js";
import Unocss from "file:///D:/codes/hg-assets-front/node_modules/.pnpm/unocss@0.63.6_postcss@8.4.47_rollup@4.24.0_typescript@5.6.3_vite@5.4.10_@types+node@22.7.4_less@4.2.0_/node_modules/unocss/dist/vite.mjs";
import { createSvgIconsPlugin } from "file:///D:/codes/hg-assets-front/node_modules/.pnpm/vite-plugin-svg-icons@2.0.1_vite@5.4.10_@types+node@22.7.4_less@4.2.0_/node_modules/vite-plugin-svg-icons/dist/index.mjs";
import dayjs from "file:///D:/codes/hg-assets-front/node_modules/.pnpm/dayjs@1.11.13/node_modules/dayjs/dayjs.min.js";
import mockServerPlugin from "file:///D:/codes/hg-assets-front/packages/vite-plugin-msw/dist/index.js";
import TinymceResourcePlugin from "file:///D:/codes/hg-assets-front/packages/vite-plugin-tinymce-resource/dist/index.js";
import Http2Proxy from "file:///D:/codes/hg-assets-front/packages/vite-plugin-http2-proxy/dist/index.js";
import Inspector from "file:///D:/codes/hg-assets-front/node_modules/.pnpm/vite-plugin-vue-inspector@5.2.0_vite@5.4.10_@types+node@22.7.4_less@4.2.0_/node_modules/vite-plugin-vue-inspector/dist/index.mjs";

// package.json
var package_default = {
  name: "vue3-antdv-admin",
  version: "2.0.0",
  packageManager: "pnpm@9.4.0",
  type: "module",
  engines: {
    node: ">=18",
    pnpm: ">=9.0.2"
  },
  author: {
    name: "buqiyuan",
    email: "1743369777@qq.com",
    url: "https://github.com/buqiyuan"
  },
  scripts: {
    preinstall: "npx only-allow pnpm",
    postinstall: "pnpm nx:build",
    bootstrap: "pnpm install",
    serve: "npm run dev",
    dev: "vite dev",
    build: "rimraf dist && cross-env NODE_ENV=production vite build",
    "build:watch": "rimraf dist && cross-env NODE_ENV=production vite build --watch",
    "build:pkg": 'pnpm -r --paralle --filter="./packages/*" run build',
    "nx:build": "nx run-many -t build --exclude @admin-pkg/components",
    "nx:build:watch": "nx watch --all -- nx run \\$NX_PROJECT_NAME:build",
    preview: "npm run build --watch && vite preview",
    "preview:dist": "vite preview",
    openapi: "npx tsx openapi.config.ts",
    "clean:cache": "npx rimraf node_modules/.cache/ && npx rimraf node_modules/.vite",
    "clean:lib": "npx rimraf node_modules packages/*/node_modules",
    lint: "pnpm lint:eslint && pnpm lint:prettier && pnpm lint:stylelint",
    "lint:eslint": 'eslint --cache --max-warnings 0  "{src,mocks}/**/*.{vue,ts,tsx}" --fix',
    "lint:prettier": 'prettier --write  "src/**/*.{js,json,tsx,css,less,scss,vue,html,md}"',
    "lint:stylelint": 'stylelint --cache --fix "**/*.{vue,less,postcss,css,scss}" --cache --cache-location node_modules/.cache/stylelint/',
    "lint:lint-staged": "lint-staged",
    prepare: "husky",
    release: "git push && git push origin --tags",
    "gen:changelog": "conventional-changelog -p angular -i CHANGELOG.md -s && git add CHANGELOG.md",
    reinstall: "rimraf pnpm-lock.yaml && rimraf package.lock.json && pnpm clean:lib && npm run bootstrap",
    "test:gzip": "npx http-server dist --cors --gzip -c-1",
    "test:br": "npx http-server dist --cors --brotli -c-1"
  },
  dependencies: {
    "@ant-design/icons-vue": "~7.0.1",
    "@bpmn-io/properties-panel": "^3.26.4",
    "@iconify/vue": "^4.1.2",
    "@tinymce/tinymce-vue": "^6.1.0",
    "@vueuse/core": "~11.1.0",
    "ant-design-vue": "~4.2.5",
    axios: "~1.7.7",
    "bpmn-js": "^18.1.2",
    "bpmn-js-properties-panel": "^5.30.0",
    "crypto-js": "^4.2.0",
    dayjs: "~1.11.13",
    "diagram-js-grid": "^1.1.0",
    echarts: "^5.5.1",
    "file-saver": "~2.0.5",
    "lodash-es": "~4.17.21",
    mitt: "~3.0.1",
    nprogress: "~1.0.0-1",
    pinia: "~2.2.4",
    "pinia-plugin-persistedstate": "^4.1.1",
    "qiniu-js": "^3.4.2",
    qs: "~6.13.0",
    sortablejs: "~1.15.3",
    sweetalert2: "^11.16.0",
    tinymce: "^7.4.1",
    vue: "~3.5.12",
    "vue-echarts": "^7.0.3",
    "vue-i18n": "~10.0.4",
    "vue-router": "~4.4.5",
    "vue-types": "~5.1.3",
    "vue-virtual-scroller": "2.0.0-beta.8",
    xlsx: "~0.18.5"
  },
  devDependencies: {
    "@admin-pkg/components": "workspace:*",
    "@admin-pkg/vite-plugin-http2-proxy": "workspace:*",
    "@admin-pkg/vite-plugin-msw": "workspace:*",
    "@admin-pkg/vite-plugin-tinymce-resource": "workspace:*",
    "@commitlint/cli": "~19.5.0",
    "@commitlint/config-conventional": "~19.5.0",
    "@faker-js/faker": "^9.0.3",
    "@iconify-json/ant-design": "^1.2.1",
    "@iconify-json/ep": "^1.2.0",
    "@iconify/json": "^2.2.255",
    "@types/crypto-js": "^4.2.2",
    "@types/lodash-es": "~4.17.12",
    "@types/node": "~22.7.4",
    "@types/qs": "^6.9.16",
    "@types/sortablejs": "^1.15.8",
    "@typescript-eslint/eslint-plugin": "~8.11.0",
    "@typescript-eslint/parser": "~8.11.0",
    "@umijs/openapi": "^1.13.0",
    "@vitejs/plugin-vue": "~5.1.4",
    "@vitejs/plugin-vue-jsx": "~4.0.1",
    "@vue/tsconfig": "^0.5.1",
    commitizen: "~4.3.1",
    "conventional-changelog-cli": "~4.1.0",
    "core-js": "^3.38.1",
    "cross-env": "~7.0.3",
    eslint: "~9.13.0",
    "eslint-config-prettier": "~9.1.0",
    "eslint-define-config": "~2.1.0",
    "eslint-plugin-import": "~2.31.0",
    "eslint-plugin-prettier": "~5.2.1",
    "eslint-plugin-unused-imports": "^4.1.4",
    "eslint-plugin-vue": "~9.29.1",
    husky: "~9.1.6",
    less: "~4.2.0",
    "lint-staged": "~15.2.10",
    msw: "^2.4.9",
    nx: "^20.0.5",
    postcss: "~8.4.47",
    "postcss-html": "~1.7.0",
    "postcss-less": "~6.0.0",
    prettier: "~3.3.3",
    rimraf: "~5.0.9",
    stylelint: "~16.10.0",
    "stylelint-config-property-sort-order-smacss": "^10.0.0",
    "stylelint-config-recommended": "~14.0.1",
    "stylelint-config-recommended-vue": "~1.5.0",
    "stylelint-config-standard": "~36.0.1",
    "stylelint-order": "~6.0.4",
    "stylelint-prettier": "^5.0.2",
    typescript: "~5.6.3",
    unocss: "^0.63.6",
    "unplugin-vue-components": "~0.27.4",
    vite: "~5.4.10",
    "vite-plugin-checker": "~0.8.0",
    "vite-plugin-inspect": "^0.8.7",
    "vite-plugin-mkcert": "^1.17.6",
    "vite-plugin-svg-icons": "~2.0.1",
    "vite-plugin-vue-inspector": "^5.2.0",
    "vue-eslint-parser": "~9.4.3",
    "vue-tsc": "~2.1.6"
  },
  __npminstall_done: false,
  repository: {
    type: "git",
    url: "https://github.com/buqiyuan/vue3-antdv-admin"
  },
  homepage: "https://buqiyuan.gitee.io/vue3-antdv-admin",
  keywords: [
    "vue",
    "ant-design-vue",
    "vue3",
    "ts",
    "tsx",
    "admin",
    "typescript"
  ],
  license: "MIT",
  target: "web",
  pnpm: {
    overrides: {},
    peerDependencyRules: {
      allowedVersions: {}
    }
  }
};

// vite.config.ts
var __vite_injected_original_dirname = "D:\\codes\\hg-assets-front";
var CWD = process.cwd();
var __APP_INFO__ = {
  pkg: package_default,
  lastBuildTime: dayjs().format("YYYY-MM-DD HH:mm:ss")
};
var vite_config_default = ({ command, mode }) => {
  const { VITE_BASE_URL, VITE_DROP_CONSOLE, VITE_MOCK_IN_PROD } = loadEnv(mode, CWD);
  const isDev = command === "serve";
  const isBuild = command === "build";
  return {
    base: VITE_BASE_URL,
    define: {
      __APP_INFO__: JSON.stringify(__APP_INFO__)
    },
    resolve: {
      alias: [
        {
          find: "@",
          replacement: resolve(__vite_injected_original_dirname, "./src")
        }
      ]
    },
    plugins: [
      vue(),
      Inspector(),
      Unocss(),
      vueJsx({
        // options are passed on to @vue/babel-plugin-jsx
      }),
      // 指定 mkcert 的下载源为 coding，从 coding.net 镜像下载证书
      mkcert({
        savePath: "./.cert",
        // 指定证书存储路径
        keyFileName: "my-key.pem",
        // 指定私钥文件名
        certFileName: "my-cert.pem"
        // 指定证书文件名
      }),
      // 开启 http2 代理
      Http2Proxy(),
      mockServerPlugin({ build: isBuild && VITE_MOCK_IN_PROD === "true" }),
      TinymceResourcePlugin({ baseUrl: "/tinymce-resource/" }),
      createSvgIconsPlugin({
        // Specify the icon folder to be cached
        iconDirs: [resolve(CWD, "src/assets/icons")],
        // Specify symbolId format
        symbolId: "svg-icon-[dir]-[name]"
      }),
      Components({
        dts: "types/components.d.ts",
        types: [
          {
            from: "./src/components/basic/button/",
            names: ["AButton"]
          },
          {
            from: "vue-router",
            names: ["RouterLink", "RouterView"]
          }
        ],
        resolvers: [
          AntDesignVueResolver({
            importStyle: false,
            // css in js
            exclude: ["Button"]
          })
        ]
      }),
      // https://github.com/fi3ework/vite-plugin-checker
      isDev && checker({
        typescript: true,
        // vueTsc: true,
        eslint: {
          useFlatConfig: true,
          lintCommand: "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts"
        },
        overlay: {
          initialIsOpen: false
        }
      })
    ],
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          modifyVars: {}
          // additionalData: `
          //   @import '@/styles/variables.less';
          // `,
        }
      }
    },
    server: {
      host: "0.0.0.0",
      port: 8088,
      open: true,
      hmr: {
        overlay: false
      },
      proxy: {
        "^/api": {
          // target: 'https://nest-api.buqiyuan.site',
          target: "http://127.0.0.1:7001",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, "")
        },
        "^/upload": {
          // target: 'https://nest-api.buqiyuan.site/upload',
          target: "http://127.0.0.1:7001/upload",
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp(`^/upload`), "")
        }
      },
      // 提前转换和缓存文件以进行预热。可以在服务器启动时提高初始页面加载速度，并防止转换瀑布。
      warmup: {
        // 请注意，只应该预热频繁使用的文件，以免在启动时过载 Vite 开发服务器
        // 可以通过运行 npx vite --debug transform 并检查日志来找到频繁使用的文件
        clientFiles: ["./index.html", "./src/{components,api}/*"]
      }
    },
    optimizeDeps: {
      include: ["lodash-es", "ant-design-vue/es/locale/zh_CN", "ant-design-vue/es/locale/en_US"]
    },
    esbuild: {
      pure: VITE_DROP_CONSOLE === "true" ? ["console.log", "debugger"] : [],
      supported: {
        // https://github.com/vitejs/vite/pull/8665
        "top-level-await": true
      }
    },
    build: {
      minify: "esbuild",
      cssTarget: "chrome89",
      chunkSizeWarningLimit: 2e3,
      rollupOptions: {
        output: {
          // minifyInternalExports: false,
        },
        onwarn(warning, rollupWarn) {
          if (warning.code === "CYCLIC_CROSS_CHUNK_REEXPORT" && warning.exporter?.includes("src/api/")) {
            return;
          }
          rollupWarn(warning);
        }
      }
    }
  };
};
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcY29kZXNcXFxcaGctYXNzZXRzLWZyb250XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxjb2Rlc1xcXFxoZy1hc3NldHMtZnJvbnRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L2NvZGVzL2hnLWFzc2V0cy1mcm9udC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgbG9hZEVudiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHZ1ZUpzeCBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUtanN4JztcbmltcG9ydCBta2NlcnQgZnJvbSAndml0ZS1wbHVnaW4tbWtjZXJ0JztcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJztcbmltcG9ydCBjaGVja2VyIGZyb20gJ3ZpdGUtcGx1Z2luLWNoZWNrZXInO1xuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSc7XG5pbXBvcnQgeyBBbnREZXNpZ25WdWVSZXNvbHZlciB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3Jlc29sdmVycyc7XG5pbXBvcnQgVW5vY3NzIGZyb20gJ3Vub2Nzcy92aXRlJztcbmltcG9ydCB7IGNyZWF0ZVN2Z0ljb25zUGx1Z2luIH0gZnJvbSAndml0ZS1wbHVnaW4tc3ZnLWljb25zJztcbmltcG9ydCBkYXlqcyBmcm9tICdkYXlqcyc7XG5pbXBvcnQgbW9ja1NlcnZlclBsdWdpbiBmcm9tICdAYWRtaW4tcGtnL3ZpdGUtcGx1Z2luLW1zdy92aXRlJztcbmltcG9ydCBUaW55bWNlUmVzb3VyY2VQbHVnaW4gZnJvbSAnQGFkbWluLXBrZy92aXRlLXBsdWdpbi10aW55bWNlLXJlc291cmNlJztcbmltcG9ydCBIdHRwMlByb3h5IGZyb20gJ0BhZG1pbi1wa2cvdml0ZS1wbHVnaW4taHR0cDItcHJveHknO1xuaW1wb3J0IEluc3BlY3RvciBmcm9tICd2aXRlLXBsdWdpbi12dWUtaW5zcGVjdG9yJztcbmltcG9ydCBwa2cgZnJvbSAnLi9wYWNrYWdlLmpzb24nO1xuaW1wb3J0IHR5cGUgeyBVc2VyQ29uZmlnLCBDb25maWdFbnYgfSBmcm9tICd2aXRlJztcblxuY29uc3QgQ1dEID0gcHJvY2Vzcy5jd2QoKTtcblxuLy8gXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXG4vLyBjb25zdCBCQVNFX0VOVl9DT05GSUcgPSBsb2FkRW52KCcnLCBDV0QpO1xuLy8gY29uc3QgREVWX0VOVl9DT05GSUcgPSBsb2FkRW52KCdkZXZlbG9wbWVudCcsIENXRCk7XG4vLyBjb25zdCBQUk9EX0VOVl9DT05GSUcgPSBsb2FkRW52KCdwcm9kdWN0aW9uJywgQ1dEKTtcblxuY29uc3QgX19BUFBfSU5GT19fID0ge1xuICBwa2csXG4gIGxhc3RCdWlsZFRpbWU6IGRheWpzKCkuZm9ybWF0KCdZWVlZLU1NLUREIEhIOm1tOnNzJyksXG59O1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgKHsgY29tbWFuZCwgbW9kZSB9OiBDb25maWdFbnYpOiBVc2VyQ29uZmlnID0+IHtcbiAgLy8gXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXG4gIGNvbnN0IHsgVklURV9CQVNFX1VSTCwgVklURV9EUk9QX0NPTlNPTEUsIFZJVEVfTU9DS19JTl9QUk9EIH0gPSBsb2FkRW52KG1vZGUsIENXRCk7XG5cbiAgY29uc3QgaXNEZXYgPSBjb21tYW5kID09PSAnc2VydmUnO1xuICBjb25zdCBpc0J1aWxkID0gY29tbWFuZCA9PT0gJ2J1aWxkJztcblxuICByZXR1cm4ge1xuICAgIGJhc2U6IFZJVEVfQkFTRV9VUkwsXG4gICAgZGVmaW5lOiB7XG4gICAgICBfX0FQUF9JTkZPX186IEpTT04uc3RyaW5naWZ5KF9fQVBQX0lORk9fXyksXG4gICAgfSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczogW1xuICAgICAgICB7XG4gICAgICAgICAgZmluZDogJ0AnLFxuICAgICAgICAgIHJlcGxhY2VtZW50OiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAgcGx1Z2luczogW1xuICAgICAgdnVlKCksXG4gICAgICBJbnNwZWN0b3IoKSxcbiAgICAgIFVub2NzcygpLFxuICAgICAgdnVlSnN4KHtcbiAgICAgICAgLy8gb3B0aW9ucyBhcmUgcGFzc2VkIG9uIHRvIEB2dWUvYmFiZWwtcGx1Z2luLWpzeFxuICAgICAgfSksXG4gICAgICAvLyBcdTYzMDdcdTVCOUEgbWtjZXJ0IFx1NzY4NFx1NEUwQlx1OEY3RFx1NkU5MFx1NEUzQSBjb2RpbmdcdUZGMENcdTRFQ0UgY29kaW5nLm5ldCBcdTk1NUNcdTUwQ0ZcdTRFMEJcdThGN0RcdThCQzFcdTRFNjZcbiAgICAgIG1rY2VydCh7XG4gICAgICAgIHNhdmVQYXRoOiAnLi8uY2VydCcsIC8vIFx1NjMwN1x1NUI5QVx1OEJDMVx1NEU2Nlx1NUI1OFx1NTBBOFx1OERFRlx1NUY4NFxuICAgICAgICBrZXlGaWxlTmFtZTogJ215LWtleS5wZW0nLCAvLyBcdTYzMDdcdTVCOUFcdTc5QzFcdTk0QTVcdTY1ODdcdTRFRjZcdTU0MERcbiAgICAgICAgY2VydEZpbGVOYW1lOiAnbXktY2VydC5wZW0nLCAvLyBcdTYzMDdcdTVCOUFcdThCQzFcdTRFNjZcdTY1ODdcdTRFRjZcdTU0MERcbiAgICAgIH0pLFxuICAgICAgLy8gXHU1RjAwXHU1NDJGIGh0dHAyIFx1NEVFM1x1NzQwNlxuICAgICAgSHR0cDJQcm94eSgpLFxuICAgICAgbW9ja1NlcnZlclBsdWdpbih7IGJ1aWxkOiBpc0J1aWxkICYmIFZJVEVfTU9DS19JTl9QUk9EID09PSAndHJ1ZScgfSksXG4gICAgICBUaW55bWNlUmVzb3VyY2VQbHVnaW4oeyBiYXNlVXJsOiAnL3RpbnltY2UtcmVzb3VyY2UvJyB9KSxcbiAgICAgIGNyZWF0ZVN2Z0ljb25zUGx1Z2luKHtcbiAgICAgICAgLy8gU3BlY2lmeSB0aGUgaWNvbiBmb2xkZXIgdG8gYmUgY2FjaGVkXG4gICAgICAgIGljb25EaXJzOiBbcmVzb2x2ZShDV0QsICdzcmMvYXNzZXRzL2ljb25zJyldLFxuICAgICAgICAvLyBTcGVjaWZ5IHN5bWJvbElkIGZvcm1hdFxuICAgICAgICBzeW1ib2xJZDogJ3N2Zy1pY29uLVtkaXJdLVtuYW1lXScsXG4gICAgICB9KSxcbiAgICAgIENvbXBvbmVudHMoe1xuICAgICAgICBkdHM6ICd0eXBlcy9jb21wb25lbnRzLmQudHMnLFxuICAgICAgICB0eXBlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGZyb206ICcuL3NyYy9jb21wb25lbnRzL2Jhc2ljL2J1dHRvbi8nLFxuICAgICAgICAgICAgbmFtZXM6IFsnQUJ1dHRvbiddLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgZnJvbTogJ3Z1ZS1yb3V0ZXInLFxuICAgICAgICAgICAgbmFtZXM6IFsnUm91dGVyTGluaycsICdSb3V0ZXJWaWV3J10sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgcmVzb2x2ZXJzOiBbXG4gICAgICAgICAgQW50RGVzaWduVnVlUmVzb2x2ZXIoe1xuICAgICAgICAgICAgaW1wb3J0U3R5bGU6IGZhbHNlLCAvLyBjc3MgaW4ganNcbiAgICAgICAgICAgIGV4Y2x1ZGU6IFsnQnV0dG9uJ10sXG4gICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICB9KSxcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9maTNld29yay92aXRlLXBsdWdpbi1jaGVja2VyXG4gICAgICBpc0RldiAmJlxuICAgICAgICBjaGVja2VyKHtcbiAgICAgICAgICB0eXBlc2NyaXB0OiB0cnVlLFxuICAgICAgICAgIC8vIHZ1ZVRzYzogdHJ1ZSxcbiAgICAgICAgICBlc2xpbnQ6IHtcbiAgICAgICAgICAgIHVzZUZsYXRDb25maWc6IHRydWUsXG4gICAgICAgICAgICBsaW50Q29tbWFuZDogJ2VzbGludCAuIC0tZXh0IC52dWUsLmpzLC5qc3gsLmNqcywubWpzLC50cywudHN4LC5jdHMsLm10cycsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvdmVybGF5OiB7XG4gICAgICAgICAgICBpbml0aWFsSXNPcGVuOiBmYWxzZSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KSxcbiAgICBdLFxuICAgIGNzczoge1xuICAgICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xuICAgICAgICBsZXNzOiB7XG4gICAgICAgICAgamF2YXNjcmlwdEVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgbW9kaWZ5VmFyczoge30sXG4gICAgICAgICAgLy8gYWRkaXRpb25hbERhdGE6IGBcbiAgICAgICAgICAvLyAgIEBpbXBvcnQgJ0Avc3R5bGVzL3ZhcmlhYmxlcy5sZXNzJztcbiAgICAgICAgICAvLyBgLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgaG9zdDogJzAuMC4wLjAnLFxuICAgICAgcG9ydDogODA4OCxcbiAgICAgIG9wZW46IHRydWUsXG4gICAgICBobXI6IHtcbiAgICAgICAgb3ZlcmxheTogZmFsc2UsXG4gICAgICB9LFxuICAgICAgcHJveHk6IHtcbiAgICAgICAgJ14vYXBpJzoge1xuICAgICAgICAgIC8vIHRhcmdldDogJ2h0dHBzOi8vbmVzdC1hcGkuYnVxaXl1YW4uc2l0ZScsXG4gICAgICAgICAgdGFyZ2V0OiAnaHR0cDovLzEyNy4wLjAuMTo3MDAxJyxcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaS8sICcnKSxcbiAgICAgICAgfSxcbiAgICAgICAgJ14vdXBsb2FkJzoge1xuICAgICAgICAgIC8vIHRhcmdldDogJ2h0dHBzOi8vbmVzdC1hcGkuYnVxaXl1YW4uc2l0ZS91cGxvYWQnLFxuICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly8xMjcuMC4wLjE6NzAwMS91cGxvYWQnLFxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKG5ldyBSZWdFeHAoYF4vdXBsb2FkYCksICcnKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICAvLyBcdTYzRDBcdTUyNERcdThGNkNcdTYzNjJcdTU0OENcdTdGMTNcdTVCNThcdTY1ODdcdTRFRjZcdTRFRTVcdThGREJcdTg4NENcdTk4ODRcdTcwRURcdTMwMDJcdTUzRUZcdTRFRTVcdTU3MjhcdTY3MERcdTUyQTFcdTU2NjhcdTU0MkZcdTUyQThcdTY1RjZcdTYzRDBcdTlBRDhcdTUyMURcdTU5Q0JcdTk4NzVcdTk3NjJcdTUyQTBcdThGN0RcdTkwMUZcdTVFQTZcdUZGMENcdTVFNzZcdTk2MzJcdTZCNjJcdThGNkNcdTYzNjJcdTcwMTFcdTVFMDNcdTMwMDJcbiAgICAgIHdhcm11cDoge1xuICAgICAgICAvLyBcdThCRjdcdTZDRThcdTYxMEZcdUZGMENcdTUzRUFcdTVFOTRcdThCRTVcdTk4ODRcdTcwRURcdTk4OTFcdTdFNDFcdTRGN0ZcdTc1MjhcdTc2ODRcdTY1ODdcdTRFRjZcdUZGMENcdTRFRTVcdTUxNERcdTU3MjhcdTU0MkZcdTUyQThcdTY1RjZcdThGQzdcdThGN0QgVml0ZSBcdTVGMDBcdTUzRDFcdTY3MERcdTUyQTFcdTU2NjhcbiAgICAgICAgLy8gXHU1M0VGXHU0RUU1XHU5MDFBXHU4RkM3XHU4RkQwXHU4ODRDIG5weCB2aXRlIC0tZGVidWcgdHJhbnNmb3JtIFx1NUU3Nlx1NjhDMFx1NjdFNVx1NjVFNVx1NUZEN1x1Njc2NVx1NjI3RVx1NTIzMFx1OTg5MVx1N0U0MVx1NEY3Rlx1NzUyOFx1NzY4NFx1NjU4N1x1NEVGNlxuICAgICAgICBjbGllbnRGaWxlczogWycuL2luZGV4Lmh0bWwnLCAnLi9zcmMve2NvbXBvbmVudHMsYXBpfS8qJ10sXG4gICAgICB9LFxuICAgIH0sXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICBpbmNsdWRlOiBbJ2xvZGFzaC1lcycsICdhbnQtZGVzaWduLXZ1ZS9lcy9sb2NhbGUvemhfQ04nLCAnYW50LWRlc2lnbi12dWUvZXMvbG9jYWxlL2VuX1VTJ10sXG4gICAgfSxcbiAgICBlc2J1aWxkOiB7XG4gICAgICBwdXJlOiBWSVRFX0RST1BfQ09OU09MRSA9PT0gJ3RydWUnID8gWydjb25zb2xlLmxvZycsICdkZWJ1Z2dlciddIDogW10sXG4gICAgICBzdXBwb3J0ZWQ6IHtcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3ZpdGVqcy92aXRlL3B1bGwvODY2NVxuICAgICAgICAndG9wLWxldmVsLWF3YWl0JzogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBidWlsZDoge1xuICAgICAgbWluaWZ5OiAnZXNidWlsZCcsXG4gICAgICBjc3NUYXJnZXQ6ICdjaHJvbWU4OScsXG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDIwMDAsXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIC8vIG1pbmlmeUludGVybmFsRXhwb3J0czogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICAgIG9ud2Fybih3YXJuaW5nLCByb2xsdXBXYXJuKSB7XG4gICAgICAgICAgLy8gaWdub3JlIGNpcmN1bGFyIGRlcGVuZGVuY3kgd2FybmluZ1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIHdhcm5pbmcuY29kZSA9PT0gJ0NZQ0xJQ19DUk9TU19DSFVOS19SRUVYUE9SVCcgJiZcbiAgICAgICAgICAgIHdhcm5pbmcuZXhwb3J0ZXI/LmluY2x1ZGVzKCdzcmMvYXBpLycpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIHJvbGx1cFdhcm4od2FybmluZyk7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH07XG59O1xuIiwgIntcbiAgXCJuYW1lXCI6IFwidnVlMy1hbnRkdi1hZG1pblwiLFxuICBcInZlcnNpb25cIjogXCIyLjAuMFwiLFxuICBcInBhY2thZ2VNYW5hZ2VyXCI6IFwicG5wbUA5LjQuMFwiLFxuICBcInR5cGVcIjogXCJtb2R1bGVcIixcbiAgXCJlbmdpbmVzXCI6IHtcbiAgICBcIm5vZGVcIjogXCI+PTE4XCIsXG4gICAgXCJwbnBtXCI6IFwiPj05LjAuMlwiXG4gIH0sXG4gIFwiYXV0aG9yXCI6IHtcbiAgICBcIm5hbWVcIjogXCJidXFpeXVhblwiLFxuICAgIFwiZW1haWxcIjogXCIxNzQzMzY5Nzc3QHFxLmNvbVwiLFxuICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL2J1cWl5dWFuXCJcbiAgfSxcbiAgXCJzY3JpcHRzXCI6IHtcbiAgICBcInByZWluc3RhbGxcIjogXCJucHggb25seS1hbGxvdyBwbnBtXCIsXG4gICAgXCJwb3N0aW5zdGFsbFwiOiBcInBucG0gbng6YnVpbGRcIixcbiAgICBcImJvb3RzdHJhcFwiOiBcInBucG0gaW5zdGFsbFwiLFxuICAgIFwic2VydmVcIjogXCJucG0gcnVuIGRldlwiLFxuICAgIFwiZGV2XCI6IFwidml0ZSBkZXZcIixcbiAgICBcImJ1aWxkXCI6IFwicmltcmFmIGRpc3QgJiYgY3Jvc3MtZW52IE5PREVfRU5WPXByb2R1Y3Rpb24gdml0ZSBidWlsZFwiLFxuICAgIFwiYnVpbGQ6d2F0Y2hcIjogXCJyaW1yYWYgZGlzdCAmJiBjcm9zcy1lbnYgTk9ERV9FTlY9cHJvZHVjdGlvbiB2aXRlIGJ1aWxkIC0td2F0Y2hcIixcbiAgICBcImJ1aWxkOnBrZ1wiOiBcInBucG0gLXIgLS1wYXJhbGxlIC0tZmlsdGVyPVxcXCIuL3BhY2thZ2VzLypcXFwiIHJ1biBidWlsZFwiLFxuICAgIFwibng6YnVpbGRcIjogXCJueCBydW4tbWFueSAtdCBidWlsZCAtLWV4Y2x1ZGUgQGFkbWluLXBrZy9jb21wb25lbnRzXCIsXG4gICAgXCJueDpidWlsZDp3YXRjaFwiOiBcIm54IHdhdGNoIC0tYWxsIC0tIG54IHJ1biBcXFxcJE5YX1BST0pFQ1RfTkFNRTpidWlsZFwiLFxuICAgIFwicHJldmlld1wiOiBcIm5wbSBydW4gYnVpbGQgLS13YXRjaCAmJiB2aXRlIHByZXZpZXdcIixcbiAgICBcInByZXZpZXc6ZGlzdFwiOiBcInZpdGUgcHJldmlld1wiLFxuICAgIFwib3BlbmFwaVwiOiBcIm5weCB0c3ggb3BlbmFwaS5jb25maWcudHNcIixcbiAgICBcImNsZWFuOmNhY2hlXCI6IFwibnB4IHJpbXJhZiBub2RlX21vZHVsZXMvLmNhY2hlLyAmJiBucHggcmltcmFmIG5vZGVfbW9kdWxlcy8udml0ZVwiLFxuICAgIFwiY2xlYW46bGliXCI6IFwibnB4IHJpbXJhZiBub2RlX21vZHVsZXMgcGFja2FnZXMvKi9ub2RlX21vZHVsZXNcIixcbiAgICBcImxpbnRcIjogXCJwbnBtIGxpbnQ6ZXNsaW50ICYmIHBucG0gbGludDpwcmV0dGllciAmJiBwbnBtIGxpbnQ6c3R5bGVsaW50XCIsXG4gICAgXCJsaW50OmVzbGludFwiOiBcImVzbGludCAtLWNhY2hlIC0tbWF4LXdhcm5pbmdzIDAgIFxcXCJ7c3JjLG1vY2tzfS8qKi8qLnt2dWUsdHMsdHN4fVxcXCIgLS1maXhcIixcbiAgICBcImxpbnQ6cHJldHRpZXJcIjogXCJwcmV0dGllciAtLXdyaXRlICBcXFwic3JjLyoqLyoue2pzLGpzb24sdHN4LGNzcyxsZXNzLHNjc3MsdnVlLGh0bWwsbWR9XFxcIlwiLFxuICAgIFwibGludDpzdHlsZWxpbnRcIjogXCJzdHlsZWxpbnQgLS1jYWNoZSAtLWZpeCBcXFwiKiovKi57dnVlLGxlc3MscG9zdGNzcyxjc3Msc2Nzc31cXFwiIC0tY2FjaGUgLS1jYWNoZS1sb2NhdGlvbiBub2RlX21vZHVsZXMvLmNhY2hlL3N0eWxlbGludC9cIixcbiAgICBcImxpbnQ6bGludC1zdGFnZWRcIjogXCJsaW50LXN0YWdlZFwiLFxuICAgIFwicHJlcGFyZVwiOiBcImh1c2t5XCIsXG4gICAgXCJyZWxlYXNlXCI6IFwiZ2l0IHB1c2ggJiYgZ2l0IHB1c2ggb3JpZ2luIC0tdGFnc1wiLFxuICAgIFwiZ2VuOmNoYW5nZWxvZ1wiOiBcImNvbnZlbnRpb25hbC1jaGFuZ2Vsb2cgLXAgYW5ndWxhciAtaSBDSEFOR0VMT0cubWQgLXMgJiYgZ2l0IGFkZCBDSEFOR0VMT0cubWRcIixcbiAgICBcInJlaW5zdGFsbFwiOiBcInJpbXJhZiBwbnBtLWxvY2sueWFtbCAmJiByaW1yYWYgcGFja2FnZS5sb2NrLmpzb24gJiYgcG5wbSBjbGVhbjpsaWIgJiYgbnBtIHJ1biBib290c3RyYXBcIixcbiAgICBcInRlc3Q6Z3ppcFwiOiBcIm5weCBodHRwLXNlcnZlciBkaXN0IC0tY29ycyAtLWd6aXAgLWMtMVwiLFxuICAgIFwidGVzdDpiclwiOiBcIm5weCBodHRwLXNlcnZlciBkaXN0IC0tY29ycyAtLWJyb3RsaSAtYy0xXCJcbiAgfSxcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQGFudC1kZXNpZ24vaWNvbnMtdnVlXCI6IFwifjcuMC4xXCIsXG4gICAgXCJAYnBtbi1pby9wcm9wZXJ0aWVzLXBhbmVsXCI6IFwiXjMuMjYuNFwiLFxuICAgIFwiQGljb25pZnkvdnVlXCI6IFwiXjQuMS4yXCIsXG4gICAgXCJAdGlueW1jZS90aW55bWNlLXZ1ZVwiOiBcIl42LjEuMFwiLFxuICAgIFwiQHZ1ZXVzZS9jb3JlXCI6IFwifjExLjEuMFwiLFxuICAgIFwiYW50LWRlc2lnbi12dWVcIjogXCJ+NC4yLjVcIixcbiAgICBcImF4aW9zXCI6IFwifjEuNy43XCIsXG4gICAgXCJicG1uLWpzXCI6IFwiXjE4LjEuMlwiLFxuICAgIFwiYnBtbi1qcy1wcm9wZXJ0aWVzLXBhbmVsXCI6IFwiXjUuMzAuMFwiLFxuICAgIFwiY3J5cHRvLWpzXCI6IFwiXjQuMi4wXCIsXG4gICAgXCJkYXlqc1wiOiBcIn4xLjExLjEzXCIsXG4gICAgXCJkaWFncmFtLWpzLWdyaWRcIjogXCJeMS4xLjBcIixcbiAgICBcImVjaGFydHNcIjogXCJeNS41LjFcIixcbiAgICBcImZpbGUtc2F2ZXJcIjogXCJ+Mi4wLjVcIixcbiAgICBcImxvZGFzaC1lc1wiOiBcIn40LjE3LjIxXCIsXG4gICAgXCJtaXR0XCI6IFwifjMuMC4xXCIsXG4gICAgXCJucHJvZ3Jlc3NcIjogXCJ+MS4wLjAtMVwiLFxuICAgIFwicGluaWFcIjogXCJ+Mi4yLjRcIixcbiAgICBcInBpbmlhLXBsdWdpbi1wZXJzaXN0ZWRzdGF0ZVwiOiBcIl40LjEuMVwiLFxuICAgIFwicWluaXUtanNcIjogXCJeMy40LjJcIixcbiAgICBcInFzXCI6IFwifjYuMTMuMFwiLFxuICAgIFwic29ydGFibGVqc1wiOiBcIn4xLjE1LjNcIixcbiAgICBcInN3ZWV0YWxlcnQyXCI6IFwiXjExLjE2LjBcIixcbiAgICBcInRpbnltY2VcIjogXCJeNy40LjFcIixcbiAgICBcInZ1ZVwiOiBcIn4zLjUuMTJcIixcbiAgICBcInZ1ZS1lY2hhcnRzXCI6IFwiXjcuMC4zXCIsXG4gICAgXCJ2dWUtaTE4blwiOiBcIn4xMC4wLjRcIixcbiAgICBcInZ1ZS1yb3V0ZXJcIjogXCJ+NC40LjVcIixcbiAgICBcInZ1ZS10eXBlc1wiOiBcIn41LjEuM1wiLFxuICAgIFwidnVlLXZpcnR1YWwtc2Nyb2xsZXJcIjogXCIyLjAuMC1iZXRhLjhcIixcbiAgICBcInhsc3hcIjogXCJ+MC4xOC41XCJcbiAgfSxcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQGFkbWluLXBrZy9jb21wb25lbnRzXCI6IFwid29ya3NwYWNlOipcIixcbiAgICBcIkBhZG1pbi1wa2cvdml0ZS1wbHVnaW4taHR0cDItcHJveHlcIjogXCJ3b3Jrc3BhY2U6KlwiLFxuICAgIFwiQGFkbWluLXBrZy92aXRlLXBsdWdpbi1tc3dcIjogXCJ3b3Jrc3BhY2U6KlwiLFxuICAgIFwiQGFkbWluLXBrZy92aXRlLXBsdWdpbi10aW55bWNlLXJlc291cmNlXCI6IFwid29ya3NwYWNlOipcIixcbiAgICBcIkBjb21taXRsaW50L2NsaVwiOiBcIn4xOS41LjBcIixcbiAgICBcIkBjb21taXRsaW50L2NvbmZpZy1jb252ZW50aW9uYWxcIjogXCJ+MTkuNS4wXCIsXG4gICAgXCJAZmFrZXItanMvZmFrZXJcIjogXCJeOS4wLjNcIixcbiAgICBcIkBpY29uaWZ5LWpzb24vYW50LWRlc2lnblwiOiBcIl4xLjIuMVwiLFxuICAgIFwiQGljb25pZnktanNvbi9lcFwiOiBcIl4xLjIuMFwiLFxuICAgIFwiQGljb25pZnkvanNvblwiOiBcIl4yLjIuMjU1XCIsXG4gICAgXCJAdHlwZXMvY3J5cHRvLWpzXCI6IFwiXjQuMi4yXCIsXG4gICAgXCJAdHlwZXMvbG9kYXNoLWVzXCI6IFwifjQuMTcuMTJcIixcbiAgICBcIkB0eXBlcy9ub2RlXCI6IFwifjIyLjcuNFwiLFxuICAgIFwiQHR5cGVzL3FzXCI6IFwiXjYuOS4xNlwiLFxuICAgIFwiQHR5cGVzL3NvcnRhYmxlanNcIjogXCJeMS4xNS44XCIsXG4gICAgXCJAdHlwZXNjcmlwdC1lc2xpbnQvZXNsaW50LXBsdWdpblwiOiBcIn44LjExLjBcIixcbiAgICBcIkB0eXBlc2NyaXB0LWVzbGludC9wYXJzZXJcIjogXCJ+OC4xMS4wXCIsXG4gICAgXCJAdW1panMvb3BlbmFwaVwiOiBcIl4xLjEzLjBcIixcbiAgICBcIkB2aXRlanMvcGx1Z2luLXZ1ZVwiOiBcIn41LjEuNFwiLFxuICAgIFwiQHZpdGVqcy9wbHVnaW4tdnVlLWpzeFwiOiBcIn40LjAuMVwiLFxuICAgIFwiQHZ1ZS90c2NvbmZpZ1wiOiBcIl4wLjUuMVwiLFxuICAgIFwiY29tbWl0aXplblwiOiBcIn40LjMuMVwiLFxuICAgIFwiY29udmVudGlvbmFsLWNoYW5nZWxvZy1jbGlcIjogXCJ+NC4xLjBcIixcbiAgICBcImNvcmUtanNcIjogXCJeMy4zOC4xXCIsXG4gICAgXCJjcm9zcy1lbnZcIjogXCJ+Ny4wLjNcIixcbiAgICBcImVzbGludFwiOiBcIn45LjEzLjBcIixcbiAgICBcImVzbGludC1jb25maWctcHJldHRpZXJcIjogXCJ+OS4xLjBcIixcbiAgICBcImVzbGludC1kZWZpbmUtY29uZmlnXCI6IFwifjIuMS4wXCIsXG4gICAgXCJlc2xpbnQtcGx1Z2luLWltcG9ydFwiOiBcIn4yLjMxLjBcIixcbiAgICBcImVzbGludC1wbHVnaW4tcHJldHRpZXJcIjogXCJ+NS4yLjFcIixcbiAgICBcImVzbGludC1wbHVnaW4tdW51c2VkLWltcG9ydHNcIjogXCJeNC4xLjRcIixcbiAgICBcImVzbGludC1wbHVnaW4tdnVlXCI6IFwifjkuMjkuMVwiLFxuICAgIFwiaHVza3lcIjogXCJ+OS4xLjZcIixcbiAgICBcImxlc3NcIjogXCJ+NC4yLjBcIixcbiAgICBcImxpbnQtc3RhZ2VkXCI6IFwifjE1LjIuMTBcIixcbiAgICBcIm1zd1wiOiBcIl4yLjQuOVwiLFxuICAgIFwibnhcIjogXCJeMjAuMC41XCIsXG4gICAgXCJwb3N0Y3NzXCI6IFwifjguNC40N1wiLFxuICAgIFwicG9zdGNzcy1odG1sXCI6IFwifjEuNy4wXCIsXG4gICAgXCJwb3N0Y3NzLWxlc3NcIjogXCJ+Ni4wLjBcIixcbiAgICBcInByZXR0aWVyXCI6IFwifjMuMy4zXCIsXG4gICAgXCJyaW1yYWZcIjogXCJ+NS4wLjlcIixcbiAgICBcInN0eWxlbGludFwiOiBcIn4xNi4xMC4wXCIsXG4gICAgXCJzdHlsZWxpbnQtY29uZmlnLXByb3BlcnR5LXNvcnQtb3JkZXItc21hY3NzXCI6IFwiXjEwLjAuMFwiLFxuICAgIFwic3R5bGVsaW50LWNvbmZpZy1yZWNvbW1lbmRlZFwiOiBcIn4xNC4wLjFcIixcbiAgICBcInN0eWxlbGludC1jb25maWctcmVjb21tZW5kZWQtdnVlXCI6IFwifjEuNS4wXCIsXG4gICAgXCJzdHlsZWxpbnQtY29uZmlnLXN0YW5kYXJkXCI6IFwifjM2LjAuMVwiLFxuICAgIFwic3R5bGVsaW50LW9yZGVyXCI6IFwifjYuMC40XCIsXG4gICAgXCJzdHlsZWxpbnQtcHJldHRpZXJcIjogXCJeNS4wLjJcIixcbiAgICBcInR5cGVzY3JpcHRcIjogXCJ+NS42LjNcIixcbiAgICBcInVub2Nzc1wiOiBcIl4wLjYzLjZcIixcbiAgICBcInVucGx1Z2luLXZ1ZS1jb21wb25lbnRzXCI6IFwifjAuMjcuNFwiLFxuICAgIFwidml0ZVwiOiBcIn41LjQuMTBcIixcbiAgICBcInZpdGUtcGx1Z2luLWNoZWNrZXJcIjogXCJ+MC44LjBcIixcbiAgICBcInZpdGUtcGx1Z2luLWluc3BlY3RcIjogXCJeMC44LjdcIixcbiAgICBcInZpdGUtcGx1Z2luLW1rY2VydFwiOiBcIl4xLjE3LjZcIixcbiAgICBcInZpdGUtcGx1Z2luLXN2Zy1pY29uc1wiOiBcIn4yLjAuMVwiLFxuICAgIFwidml0ZS1wbHVnaW4tdnVlLWluc3BlY3RvclwiOiBcIl41LjIuMFwiLFxuICAgIFwidnVlLWVzbGludC1wYXJzZXJcIjogXCJ+OS40LjNcIixcbiAgICBcInZ1ZS10c2NcIjogXCJ+Mi4xLjZcIlxuICB9LFxuICBcIl9fbnBtaW5zdGFsbF9kb25lXCI6IGZhbHNlLFxuICBcInJlcG9zaXRvcnlcIjoge1xuICAgIFwidHlwZVwiOiBcImdpdFwiLFxuICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL2J1cWl5dWFuL3Z1ZTMtYW50ZHYtYWRtaW5cIlxuICB9LFxuICBcImhvbWVwYWdlXCI6IFwiaHR0cHM6Ly9idXFpeXVhbi5naXRlZS5pby92dWUzLWFudGR2LWFkbWluXCIsXG4gIFwia2V5d29yZHNcIjogW1xuICAgIFwidnVlXCIsXG4gICAgXCJhbnQtZGVzaWduLXZ1ZVwiLFxuICAgIFwidnVlM1wiLFxuICAgIFwidHNcIixcbiAgICBcInRzeFwiLFxuICAgIFwiYWRtaW5cIixcbiAgICBcInR5cGVzY3JpcHRcIlxuICBdLFxuICBcImxpY2Vuc2VcIjogXCJNSVRcIixcbiAgXCJ0YXJnZXRcIjogXCJ3ZWJcIixcbiAgXCJwbnBtXCI6IHtcbiAgICBcIm92ZXJyaWRlc1wiOiB7fSxcbiAgICBcInBlZXJEZXBlbmRlbmN5UnVsZXNcIjoge1xuICAgICAgXCJhbGxvd2VkVmVyc2lvbnNcIjoge31cbiAgICB9XG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1EsU0FBUyxlQUFlO0FBQ3hSLFNBQVMsZUFBZTtBQUN4QixPQUFPLFlBQVk7QUFDbkIsT0FBTyxZQUFZO0FBQ25CLE9BQU8sU0FBUztBQUNoQixPQUFPLGFBQWE7QUFDcEIsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUyw0QkFBNEI7QUFDckMsT0FBTyxZQUFZO0FBQ25CLFNBQVMsNEJBQTRCO0FBQ3JDLE9BQU8sV0FBVztBQUNsQixPQUFPLHNCQUFzQjtBQUM3QixPQUFPLDJCQUEyQjtBQUNsQyxPQUFPLGdCQUFnQjtBQUN2QixPQUFPLGVBQWU7OztBQ2R0QjtBQUFBLEVBQ0UsTUFBUTtBQUFBLEVBQ1IsU0FBVztBQUFBLEVBQ1gsZ0JBQWtCO0FBQUEsRUFDbEIsTUFBUTtBQUFBLEVBQ1IsU0FBVztBQUFBLElBQ1QsTUFBUTtBQUFBLElBQ1IsTUFBUTtBQUFBLEVBQ1Y7QUFBQSxFQUNBLFFBQVU7QUFBQSxJQUNSLE1BQVE7QUFBQSxJQUNSLE9BQVM7QUFBQSxJQUNULEtBQU87QUFBQSxFQUNUO0FBQUEsRUFDQSxTQUFXO0FBQUEsSUFDVCxZQUFjO0FBQUEsSUFDZCxhQUFlO0FBQUEsSUFDZixXQUFhO0FBQUEsSUFDYixPQUFTO0FBQUEsSUFDVCxLQUFPO0FBQUEsSUFDUCxPQUFTO0FBQUEsSUFDVCxlQUFlO0FBQUEsSUFDZixhQUFhO0FBQUEsSUFDYixZQUFZO0FBQUEsSUFDWixrQkFBa0I7QUFBQSxJQUNsQixTQUFXO0FBQUEsSUFDWCxnQkFBZ0I7QUFBQSxJQUNoQixTQUFXO0FBQUEsSUFDWCxlQUFlO0FBQUEsSUFDZixhQUFhO0FBQUEsSUFDYixNQUFRO0FBQUEs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
