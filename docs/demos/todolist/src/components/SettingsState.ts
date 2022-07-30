import { hookstate, useHookstate } from '@hookstate/core';

const settingsState = hookstate({
    isEditableInline: true,
    isScopedUpdateEnabled: true,
    isHighlightUpdatesEnabled: true
})

export function useSettingsState() {
    const state = useHookstate(settingsState)

    // This function wraps the state by an interface,
    // i.e. the state link is not accessible directly outside of this module.
    // The state for tasks in TasksState.ts exposes the state directly.
    // Both options are valid and you need to use one or another,
    // depending on your circumstances. Apply your engineering judgement
    // to choose the best option. If unsure, exposing the state directly
    // like it is done in the TasksState.ts is a safe bet.        
    return ({
        get isEditableInline() {
            return state.isEditableInline.get()
        },
        toggleEditableInline() {
            state.isEditableInline.set(p => !p)
        },
        get isScopedUpdateEnabled() {
            return state.isScopedUpdateEnabled.get()
        },
        toggleScopedUpdate() {
            state.isScopedUpdateEnabled.set(p => !p)
        },
        get isHighlightUpdateEnabled() {
            return state.isHighlightUpdatesEnabled.get()
        },
        toggleHighlightUpdate() {
            state.isHighlightUpdatesEnabled.set(p => !p)
        }
    })
}
