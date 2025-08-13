<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import Button from "@src/ui/inputs/Button.vue";
import LabeledTextInput from "@src/ui/inputs/LabeledTextInput.vue";
import PasswordInput from "@src/ui/inputs/PasswordInput.vue";
import { RouterLink } from "vue-router";
import { useAuthStore } from "@src/features/auth/store/auth-store";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const loginError = ref("");

const handleLogin = async () => {
  if (!email.value || !password.value) {
    loginError.value = "Please fill in all fields";
    return;
  }

  isLoading.value = true;
  loginError.value = "";

  try {
    const success = await authStore.login({
      email: email.value,
      password: password.value,
    });

    if (success) {
      router.push("/chat/");
    } else {
      loginError.value =
        authStore.error || "Login failed. Please check your credentials.";
    }
  } catch (error) {
    if (error instanceof Error) {
      loginError.value = error.message;
    } else {
      loginError.value = "Unknown error";
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div
    class="p-5 md:basis-1/2 xs:basis-full flex flex-col justify-center items-center"
  >
    <div class="w-full md:px-[26%] xs:px-[10%]">
      <!--header-->
      <div class="mb-6 flex flex-col">
        <img
          src="@src/shared/assets/vectors/logo-gradient.svg"
          class="w-[1.375rem] h-[1.125rem] mb-4 opacity-70"
          alt="bird logo"
        />
        <p class="mb-4">Welcome back</p>
        <p class="text-opacity-75 font-light">Sign in to start messaging!</p>
      </div>

      <!-- Error message -->
      <div
        v-if="loginError"
        class="mb-4 p-3 bg-danger/20 dark:bg-danger/20 rounded text-danger dark:text-danger"
      >
        {{ loginError }}
      </div>

      <!--form-->
      <div class="mb-6">
        <LabeledTextInput
          v-model="email"
          label="Email"
          placeholder="Enter your email"
          class="mb-5"
        />
        <PasswordInput
          v-model="password"
          label="Password"
          placeholder="Enter your password"
        />
      </div>

      <!--local controls-->
      <div class="mb-6">
        <Button class="w-full mb-4" :loading="isLoading" @click="handleLogin">
          Sign in
        </Button>
      </div>

      <!--divider-->
      <div class="mb-6 flex items-center">
        <span
          class="w-full border border-dashed border-gray-100 dark:border-gray-600 rounded-[.0625rem]"
        ></span>
        <p class="px-4 text-opacity-75 font-light">or</p>
        <span
          class="w-full border border-dashed border-gray-100 dark:border-gray-600 rounded-[.0625rem]"
        ></span>
      </div>

      <!--oauth controls-->
      <div>
        <Button class="w-full mb-5">
          <span class="flex">
            <img
              src="@src/shared/assets/vectors/google-logo.svg"
              class="mr-3"
              alt="google logo"
            />
            Sign in with Google
          </span>
        </Button>

        <!--bottom text-->
        <div class="flex justify-center">
          <p>
            Don't have an account?
            <RouterLink to="/access/sign-up/" class="text-primary opacity-100">
              Sign up
            </RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
