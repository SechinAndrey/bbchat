<script setup lang="ts">
import { computed, ref } from "vue";

import SlideTransition from "@src/ui/transitions/SlideTransition.vue";
import PasswordSection from "@src/features/auth/components/RegisterForm/PasswordSection.vue";
import PersonalSection from "@src/features/auth/components/RegisterForm/PersonalSection.vue";
import { RouterLink } from "vue-router";

defineEmits(["activeSectionChange"]);

// determines what form section to use.
const activeSectionName = ref("personal-section");

// determines what direction the slide animation should use.
const animation = ref("slide-left");

// get the active section component from the section name
const ActiveSection = computed((): any => {
  if (activeSectionName.value === "personal-section") {
    return PersonalSection;
  } else if (activeSectionName.value === "password-section") {
    return PasswordSection;
  }
});

// (event) to move between modal pages
const changeActiveSection = (event: {
  sectionName: string;
  animationName: string;
}) => {
  animation.value = event.animationName;
  activeSectionName.value = event.sectionName;
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
          class="w-[1.375rem] h-[1.125rem] mb-5 opacity-70"
        />
        <p class="mb-4">Get started with Avian</p>
        <p class="text-opacity-75 font-light">
          Sign in to start using messaging!
        </p>
      </div>

      <!--form section-->
      <SlideTransition :animation="animation">
        <component
          :is="ActiveSection"
          @active-section-change="changeActiveSection"
        />
      </SlideTransition>

      <!--bottom text-->
      <div class="flex justify-center">
        <p>
          Already have an account?
          <RouterLink to="/access/sign-in/" class="text-primary opacity-100">
            Sign in
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
