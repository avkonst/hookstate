<template>
  <p>
    JSON dump Last render at: {{ new Date().toISOString() }}

    (<b>JSON dump of the first 3 fields</b>) :<br />
    {{ JSON.stringify(state.slice(0, 3), undefined, 4) }}
  </p>
</template>

<script lang="ts">
import { defineComponent, watch, watchEffect, ref } from "vue";
import { useState, self } from "../hookstate";

export default defineComponent({
  props: {
    state: Array,
  },
  setup(props) {
    const state = useState(props.state);

    return {
      state,
      self,
    };
  },
});
</script>
