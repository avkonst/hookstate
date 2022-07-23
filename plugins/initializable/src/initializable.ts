import { Extension, State, __State } from '@hookstate/core';

export interface Initializable {}

export function initializable<S, E>(initializer: (s: State<S, E>) => (s: State<S, E>) => void): (_?: __State<S, E>) => Extension<Initializable> {
    let uninitializer: ((s: State<S, E>) => void) | undefined = undefined;
    return () => ({
        onInit: (s) => {
            uninitializer = initializer(s as unknown as State<S, E>)
        },
        onDestroy: (s) => {
            if (uninitializer) {
                uninitializer(s as unknown as State<S, E>)
            }
        }
    })
}

// TODO document this sample
// // creating reusable combo
// let e = () => extend(
//     clonable(v => v),
//     clonable(v => v),
//     // clonable(v => v),
//     // clonable(v => v),
//     initializable(s => {
//         return ''
//     })
// )();
// // double initialize
// let a = createHookstate([1], extend(e, initializable(s => {
//     s.initialized
//     return ''
// })))
// a.initialized

// let b = createHookstate([1], initializable(s => {
//     return s.get()
// }))