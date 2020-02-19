import { createStateLink, useStateLink } from '@hookstate/core';

const state = createStateLink({
    isEditableInline: true,
    isScopedUpdateEnabled: true,
    isHighlightUpdatesEnabled: true
})

export function useSettingsState() {
    return useStateLink(state,
    // This function wraps the state by an interface,
    // i.e. the state link is not accessible directly outside of this module.
    // The state for tasks in TasksState.ts exposes the state directly.
    // Both options are valid and you need to use one or another,
    // depending on your circumstances. Apply your engineering judgement
    // to choose the best option. If unsure, exposing the state directly
    // like it is done in the TasksState.ts is a safe bet.        
    s => ({
        get isEditableInline() {
            return s.nested.isEditableInline.get()
        },
        toogleEditableInline() {
            s.nested.isEditableInline.set(p => !p)
        },
        get isScopedUpdateEnabled() {
            return s.nested.isScopedUpdateEnabled.get()
        },
        toogleScopedUpdate() {
            s.nested.isScopedUpdateEnabled.set(p => !p)
        },
        get isHighlightUpdateEnabled() {
            return s.nested.isHighlightUpdatesEnabled.get()
        },
        toogleHighlightUpdate() {
            s.nested.isHighlightUpdatesEnabled.set(p => !p)
        }
    }))
}
