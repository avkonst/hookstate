<template>
  <div style="padding: 10px; margin: 10px; background: purple;">
    <h2>{{ title }}: {{ new Date() }}</h2>
    {{ console.warn('started template', title) }}
      A value: {{ state }}, A value + 1: {{ state + 1 }}
    {{ console.warn('finished template', title) }}
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useState } from '../hookstate';

import { globalState } from './Dashboard.vue';

const title = "Ex1_Child_GlobalStateHooked_AUsed";

const vm = defineComponent({
  name: title,
  setup() {
    const state = useState(globalState).A
    return {
      console,
      title,
      state
    }
  }
});

export default vm;
</script>