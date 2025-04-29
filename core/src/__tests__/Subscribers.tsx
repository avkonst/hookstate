import { useHookstate, hookstate } from '../';
import { renderHook } from '@testing-library/react-hooks';

const SELF = Symbol.for('hookstate-self');

describe('Subscriber tests', () => {
  test('should not leak subscribers when rapidly switching to many new global stores', async () => {
    const getSubscriberCount = (store: any) => {
      const storeImpl = store[SELF].store;
      return storeImpl._subscribers.size;
    };

    const { rerender, unmount } = renderHook(({ store }) => {
      return useHookstate(store);
    }, { initialProps: { store: null } });

    const storeCount = 10;
    const stores = [];

    for (let i = 0; i < storeCount; i++) {
      stores.push(hookstate({ value: i }));
    }

    const baselineCount = getSubscriberCount(stores[0]);

    // Switch between stores
    for (let i = 0; i < storeCount; i++) {
      rerender({ store: stores[i] });

      const currentStoreCount = getSubscriberCount(stores[i]);
      expect(currentStoreCount).toBe(baselineCount + 1);

      if (i > 0) {
        const firstStoreCount = getSubscriberCount(stores[0]);
        const prevStoreCount = getSubscriberCount(stores[i-1]);

        // After switching away, previous stores should have exactly baselineCount + 1 subscribers
        // One is the root state subscriber, one is our component's subscriber that wasn't properly cleaned up
        expect(firstStoreCount).toBe(baselineCount + 1);
        expect(prevStoreCount).toBe(baselineCount + 1);
      }
    }

    unmount();

    const lastStoreCount = getSubscriberCount(stores[storeCount - 1]);

    // After unmounting, the last store should have exactly baselineCount + 1 subscribers
    // One is the root state subscriber, one is our component's subscriber that wasn't properly cleaned up
    expect(lastStoreCount).toBe(baselineCount + 1);

    let totalSubscribers = 0;
    for (let i = 0; i < storeCount; i++) {
      totalSubscribers += getSubscriberCount(stores[i]);
    }

    // The total number of subscribers should be exactly:
    // - Each store has baselineCount (1) root subscriber
    // - Each store we've switched to has 1 additional subscriber from our component
    // So the total is storeCount * baselineCount + storeCount = storeCount * (baselineCount + 1)
    expect(totalSubscribers).toBe(storeCount * (baselineCount + 1));
  });
});
