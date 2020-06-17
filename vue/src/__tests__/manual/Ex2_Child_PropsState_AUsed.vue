<template>
  <div style="padding: 10px; margin: 10px; background: purple;">
    <h2>{{ title }}: {{ new Date() }}</h2>
    {{ console.warn('started template', title) }}
      A value: {{ state }}
    {{ console.warn('finished template', title) }}
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useState, State, self } from '../hookstate';

import { globalState } from './Dashboard.vue';

const title = "Ex2_Child_PropsState_AUsed";

const vm = defineComponent({
  name: title,
  props: {
    state: {
      type: Object,   
    }
  },
  setup(this, props) {
    const state = (props.state as State<number>)
    return {
      console,
      title,
      state
    }
  }
});

export default vm;
</script>