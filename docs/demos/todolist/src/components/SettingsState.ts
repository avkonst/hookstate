import { createState, useState, self } from '@hookstate/core';

export const useSettingsState = createState({
    isEditableInline: true,
    isScopedUpdateEnabled: true,
    isHighlightUpdatesEnabled: true
})[self].map(s => () => {
    const state = useState(s)

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
        toogleEditableInline() {
            state.isEditableInline.set(p => !p)
        },
        get isScopedUpdateEnabled() {
            return state.isScopedUpdateEnabled.get()
        },
        toogleScopedUpdate() {
            state.isScopedUpdateEnabled.set(p => !p)
        },
        get isHighlightUpdateEnabled() {
            return state.isHighlightUpdatesEnabled.get()
        },
        toogleHighlightUpdate() {
            state.isHighlightUpdatesEnabled.set(p => !p)
        }
    })   
})
