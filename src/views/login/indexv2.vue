<template>
  <div class="login-container">
    <div class="logo" />
    <div class="logo-left">
      <div class="logo-title">
        <p>力求以优良的服务态度、先进的理念</p>
        <h2>满足客户对施工服务的所有要求</h2>
      </div>
    </div>
    <div class="logo-right">
      <div class="logo-contennt">
        <div class="logo-info">
          <h2>欢迎回来</h2>
          <p>请输入您的帐户信息以开始管理您的项目</p>
        </div>
        <a-form
          class="logo-form"
          layout="horizontal"
          :model="loginFormModel"
          @submit.prevent="handleSubmit"
        >
          <a-form-item>
            <a-input v-model:value="loginFormModel.username" size="large" placeholder="admin">
              <template #prefix> <Icon icon="ant-design:user-outlined" /> </template>
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-input
              v-model:value="loginFormModel.password"
              size="large"
              type="password"
              placeholder="a123456"
              autocomplete="new-password"
            >
              <template #prefix> <Icon icon="ant-design:lock-outlined" /></template>
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-input
              v-model:value="loginFormModel.verifyCode"
              placeholder="验证码"
              :maxlength="4"
              size="large"
            >
              <template #prefix> <Icon icon="ant-design:safety-outlined" /> </template>
              <template #suffix>
                <img
                  :src="captcha"
                  class="absolute right-0 h-full cursor-pointer"
                  @click="updateCaptcha"
                />
              </template>
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit" size="large" :loading="loading" block>
              登录
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { message, Modal } from 'ant-design-vue';
  import { Icon } from '@/components/basic/icon';
  import { useUserStore } from '@/store/modules/user';
  import Api from '@/api/';
  import { to } from '@/utils/awaitTo';

  const route = useRoute();
  const router = useRouter();
  const userStore = useUserStore();

  const loading = ref(false);
  const captcha = ref('');
  const loginFormModel = ref({
    username: 'admin',
    password: 'a123456',
    verifyCode: '',
    captchaId: '',
  });

  const updateCaptcha = async () => {
    const data = await Api.captcha.captchaCaptchaByImg({ width: 100, height: 50 });
    captcha.value = data.img;
    loginFormModel.value.captchaId = data.id;
  };
  updateCaptcha();

  const handleSubmit = async () => {
    const { username, password, verifyCode } = loginFormModel.value;
    if (username.trim() == '' || password.trim() == '') {
      return message.warning('用户名或密码不能为空！');
    }
    if (!verifyCode) {
      return message.warning('请输入验证码！');
    }
    message.loading('登录中...', 0);
    loading.value = true;
    console.log(loginFormModel.value);
    // params.password = md5(password)

    const [err] = await to(userStore.login(loginFormModel.value));
    if (err) {
      Modal.error({
        title: () => '提示',
        content: () => err.message,
      });
      updateCaptcha();
    } else {
      message.success('登录成功！');
      setTimeout(() => router.replace((route.query.redirect as string) || '/'));
    }
    loading.value = false;
    message.destroy();
  };
</script>

<style lang="less" scoped>
  .login-container {
    display: flex;
    position: relative;
    width: 100vw;
    height: 100vh;
    color: inherit;
    overscroll-behavior: none;

    .logo {
      position: absolute;
      top: 16px;
      left: 16px;
      width: 185px;
      height: 55px;
      background-image: url('@/assets/images/logo-white.png');
    }

    .logo-left {
      display: flex;
      flex: 1 1 0%;
      align-items: center;
      justify-content: center;
      background: url('@/assets/images/logo-bg.jpg');
      background-size: cover;

      .logo-title {
        margin-top: -200px;
        color: #fff;

        p {
          font-size: 32px;
        }

        h2 {
          font-size: 54px;
        }
      }
    }

    .logo-right {
      display: flex;
      flex: 0 1 auto;
      width: 34%;

      .logo-contennt {
        width: 450px;
        margin: auto;

        .logo-info {
          margin-bottom: 80px;

          h2 {
            color: #323639;
            font-size: 36px;
            font-weight: 700;
          }

          p {
            color: #71717a;
            font-size: 14px;
          }
        }
      }
    }
  }
</style>
