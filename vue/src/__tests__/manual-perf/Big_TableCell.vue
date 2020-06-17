<template>
  <td>{{ state.value.toString(16) }}</td>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useState } from "../hookstate";

export default defineComponent({
  props: {
    state: Object,
  },
  setup(props) {
    const state = useState(props.state);

    return {
      state,
    };
  },
});
</script>
