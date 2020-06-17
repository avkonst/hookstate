<template>
  <div style="padding: 10px; margin: 10px; background: purple;">
    <h2>{{ title }}: {{ new Date() }}</h2>
    {{ console.warn('started template', title) }}
      B value: {{ state }}
    {{ console.warn('finished template', title) }}
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useState, self, Downgraded } from '../hookstate';

import { globalState } from './Dashboard.vue';

const title = "Ex1_Child_GlobalStateHooked_BUsed_Downgraded";

const vm = defineComponent({
  name: title,
  setup() {
    const state = useState(globalState)[self].attach(Downgraded).B
    return {
      console,
      title,
      state
    }
  }
});

export default vm;
</script>