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
import { useState, self, Downgraded, State } from '../hookstate';

import { globalState } from './Dashboard.vue';

const title = "Ex3_Child_PropsState_BUsed_Scoped_Downgraded";

const vm = defineComponent({
  name: title,
  props: {
    state: {
      type: Object,   
    }
  },
  setup(this, props) {
    const state = useState(props.state as State<number>).attach(Downgraded)
    return {
      console,
      title,
      state
    }
  }
});

export default vm;
</script>