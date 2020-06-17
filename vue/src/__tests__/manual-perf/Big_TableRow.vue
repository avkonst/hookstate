<template>
  <tr>
    <table-cell v-for="(s, i) in state" :key="i" :state="s" />
  </tr>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useState } from "../hookstate";
import TableCell from "./Big_TableCell.vue";

export default defineComponent({
  props: {
    state: Array,
  },
  components: {
    TableCell,
  },
  setup(props) {
    const state = useState(props.state);

    return {
      state,
    };
  },
});
</script>
