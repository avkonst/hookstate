<template>
  <div style="padding: 10px; margin: 10px; background: gray;">
    <h2>{{ title }}: {{ new Date() }}</h2>
    {{ console.warn('started template', title) }}
      <ChildA />
      <ChildB />
    {{ console.warn('finished template', title) }}
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useState } from '../hookstate';

import { globalState } from './Dashboard.vue';
import { default as ChildA } from './Ex1_Child_GlobalStateHooked_AUsed.vue';
import { default as ChildB } from './Ex1_Child_GlobalStateHooked_BUsed_Downgraded.vue';

const title = "Ex1_Parent_GlobalStateNotHooked"

const vm = defineComponent({
  name: title,
  components: {
    ChildA,
    ChildB
  },
  setup() {
    return {
      console,
      title
    }
  }
});

export default vm;
</script>