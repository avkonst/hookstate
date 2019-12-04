import { Path } from './Declarations';

export class StateLinkInvalidUsageError extends Error {
    constructor(op: string, path: Path, hint?: string) {
        super(`StateLink is used incorrectly. Attempted '${op}' at '/${path.join('/')}'` +
            (hint ? `. Hint: ${hint}` : ''))
    }
}

function extractSymbol(s: symbol) {
    let result = s.toString();
    const symstr = 'Symbol('
    if (result.startsWith(symstr) && result.endsWith(')')) {
        result = result.substring(symstr.length, result.length - 1)
    }
    return result;
}

export class PluginInvalidRegistrationError extends Error {
    constructor(id: symbol, path: Path) {
        super(`Plugin with onInit, which overrides initial value, ` +
        `should be attached to StateRef instance, but not to StateLink instance. ` +
        `Attempted 'with(${extractSymbol(id)})' at '/${path.join('/')}'`)
    }
}

export class PluginUnknownError extends Error {
    constructor(s: symbol) {
        super(`Plugin '${extractSymbol(s)}' has not been attached to the StateRef or StateLink. ` +
            `Hint: you might need to register the required plugin using 'with' method. ` +
            `See https://github.com/avkonst/hookstate#plugins for more details`)
    }
}
