<template>
  <div :attr="markUsed">
    <p><span>Elapsed: {{ stats.elapsed }}s</span></p>
    <p><span>Total cells sum: {{ stats.totalSum }}</span></p>
    <p><span>Total matrix state updates: {{ stats.totalCalls }}</span></p>
    <p><span>Average update rate: {{ stats.rate }}cells/s</span></p>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useState, self, State, Downgraded } from "../hookstate";

const PerformanceViewPluginID = Symbol('PerformanceViewPlugin');
export default defineComponent({
  props: {
    state: Array,
  },
  setup(props) {
    const stats = {
      startTime: (new Date()).getTime(),
      totalSum: 0,
      totalCalls: 0,
      elapsed: 0,
      rate: 0
    };

    (props.state as unknown as State<number[][]>)[self].attach(() => ({
        id: PerformanceViewPluginID,
        init: () => ({
            onSet: (p) => {
                if (p.path.length === 2) {
                    // new value can be only number in this example
                    // and path can contain only 2 elements: row and column indexes
                    stats.totalSum += p.value - p.previous;
                }
                stats.totalCalls += 1;
                
                const elapsedMs = (new Date()).getTime() - stats.startTime;
                stats.elapsed = Math.floor(elapsedMs / 1000);
                stats.rate = Math.floor(stats.totalCalls / elapsedMs * 1000);
            }
        })
    }))
    const scopedState = useState(props.state)
    // mark the value of the whole matrix as 'used' by this component
    scopedState[self].attach(Downgraded);
    const markUsed = computed(() => {
      scopedState[self].get();
      return 0
    })
    
    return {
      stats,
      markUsed
    };
  },
});
</script>
