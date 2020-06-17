<template>
  <div style="padding: 10px; margin: 10px; color: black; background: gray;">
    <h2>{{ title }}: {{ new Date() }}</h2>
    {{ console.warn('started template', title) }}
    <input :value="state" @input="(e) => state.set(e.target.value)" />
    Current value: {{ state }}, computed X2: {{ countX2 }}
    {{ console.warn('finished template', title) }}
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from "vue";
import { useState } from '../hookstate';

const title = "Ex0_InputField_LocalStateHooked_Computed"

const vm = defineComponent({
  name: title,
  setup() {
    // make it with nested for testing children usage tracking chain
    const state = useState({ count: 0 })
    
    const countX2 = computed(() => {
      return state.count.value * 2
    })
    
    return {
      console,
      title,
      state: state.count, // pass only state of count for rendering
      countX2
    }
  }
});

export default vm;
</script>