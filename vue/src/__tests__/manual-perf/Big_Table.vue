<template>
  <div style="overflow: scroll">
        <table-meter :state="state" />
        <table
            style="border: solid; borderWidth: 1px; borderColor: grey; color: #00FF00; backgroundColor: black"
        >
            <tbody>
              <table-row v-for="(s, i) in state" :key="i" :state="s" />
            </tbody>
        </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, watchEffect } from "vue";
import { useState } from "../hookstate";
import TableRow from "./Big_TableRow.vue";
import TableMeter from "./Big_TableMeter.vue";

export default defineComponent({
  components: {
    TableRow,
    TableMeter,
  },

  setup() {
    const totalRows = 100;
    const totalColumns = 100;
    const callsPerInterval = 50
    const interval = 1
    
    const state = useState(
        Array.from(Array(totalRows).keys())
            .map(i => Array.from(Array(totalColumns).keys()).map(j => 0)));
    
    watchEffect(() => {
        const t = setInterval(() => {
            function randomInt(min: number, max: number) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min)) + min;
            }
            for (let i = 0; i < callsPerInterval; i += 1) {
                state
                    [randomInt(0, totalRows)]
                    [randomInt(0, totalColumns)]
                    .set(p => p + randomInt(0, 5))
            }
        }, interval)
        return () => clearInterval(t);
    })
    
    return {
      state,
    };
  },
});
</script>
