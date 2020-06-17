<template>
  <div class="bg-white h-screen">
    Parent Last render at: {{ new Date().toISOString() }}<br/>
    
    <JsonDump :state="state" />
    <field-editor v-for="(s, i) in state" :key="i" :fieldState="s" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useState } from "../hookstate";
import JsonDump from "./Big_JsonDump.vue";
import FieldEditor from "./Big_FieldEditor.vue";

export default defineComponent({
  components: {
    JsonDump,
    FieldEditor,
  },

  setup() {
    const state = useState(
      Array.from(Array(5000).keys()).map((i) => `Field #${i + 1} value`)
    );

    return {
      state,
    };
  },
});
</script>
