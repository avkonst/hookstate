<template>
  <p>
    Last render at: {{ new Date().toISOString() }}

    <input :value="scopedState.get()" @input="change" />
  </p>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useState, self } from "../hookstate";

export default defineComponent({
  props: {
    fieldState: Object,
  },
  setup(props) {
    const scopedState = useState(props.fieldState);

    const change = (e: any) => {
      scopedState[self].set(e.target.value);
    };

    return {
      scopedState,
      change,
    };
  },
});
</script>
