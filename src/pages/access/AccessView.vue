<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed } from "vue";

import LoginForm from "@src/features/auth/components/LoginForm.vue";
import RegisterForm from "@src/features/auth/components/RegisterForm/RegisterForm.vue";
import Cover from "@src/pages/access/Cover.vue";
import FadeTransition from "@src/ui/transitions/FadeTransition.vue";

const route = useRoute();

const ActiveMethod = computed((): any => {
  if (route.params.method === "sign-up") {
    return RegisterForm;
  } else if (route.params.method === "sign-in") {
    return LoginForm;
  }
});
</script>

<template>
  <div class="w-full h-full">
    <div class="w-full h-full flex dark:bg-gray-800">
      <!--login and register forms-->
      <FadeTransition>
        <component :is="ActiveMethod" />
      </FadeTransition>
      <Cover />
    </div>
  </div>
</template>
