<script setup lang="ts">
import useStore from "@src/shared/store/store.ts";

import NoContacts from "@src/ui/states/empty-states/NoContacts.vue";
import Circle2Lines from "@src/ui/states/loading-states/Circle2Lines.vue";
import SearchInput from "@src/ui/inputs/SearchInput.vue";
import ContactItem from "@src/shared/components/blocks/ContactItem.vue";
import ScrollBox from "@src/ui/utils/ScrollBox.vue";

const store = useStore();
</script>

<template>
  <div class="pb-6">
    <!--search-->
    <div class="mx-5 mb-5">
      <SearchInput />
    </div>

    <!--contacts-->
    <ScrollBox class="overflow-y-scroll max-h-[12.5rem]">
      <Circle2Lines
        v-if="store.status === 'loading' || store.delayLoading"
        v-for="item in 3"
      />

      <ContactItem
        v-else-if="
          store.status === 'success' &&
          !store.delayLoading &&
          store.user &&
          store.user.contacts.length > 0
        "
        v-for="(contact, index) in store.user.contacts"
        :key="index"
        :contact="contact"
      />

      <NoContacts vertical v-else />
    </ScrollBox>
  </div>
</template>
