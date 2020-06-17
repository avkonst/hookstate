<template>
  <div style="padding: 10px; margin: 10px; background: gray;">
    <h2>{{ title }}: {{ new Date() }}</h2>
    {{ console.warn('started template', title) }}
      <ChildA :state="state.A" />
      <ChildB :state="state.B" />
    {{ console.warn('finished template', title) }}
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useState } from '../hookstate';

import { globalState } from './Dashboard.vue';
import { default as ChildA } from './Ex3_Child_PropsState_AUsed_Scoped.vue';
import { default as ChildB } from './Ex3_Child_PropsState_BUsed_Scoped_Downgraded.vue';

const title = "Ex3_Parent_GlobalStateHooked"

const vm = defineComponent({
  name: title,
  components: {
    ChildA,
    ChildB
  },
  setup() {
    const state = useState(globalState)
    
    return {
      console,
      title,
      state
    }
  }
});

export default vm;
</script>