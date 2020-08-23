import { Plugin, State } from '@hookstate/core';
import {
  Downgraded,
  PluginCallbacks,
  PluginCallbacksOnBatchArgument,
  PluginCallbacksOnDestroyArgument,
  PluginCallbacksOnSetArgument, useState,
} from '@hookstate/core/dist';

export const ValidationId = Symbol('Validation');

type ValidateFn<T> = (value: T) => boolean;
type Path = readonly (string | number | symbol)[];

interface CommonValidator {
  isValid(): boolean;
}

interface SingleValidator<T> extends CommonValidator {
  validate: (validator: ValidateFn<T>, message?: string) => void;
}

type NestedValidator<T> = T extends string ? SingleValidator<T> : T extends any[] ? ArrayValidator<T[0]> : ObjectValidator<T>;

type ObjectValidator<T> = {
  [Key in keyof T]: NestedValidator<T[Key]>
} & CommonValidator;

type ArrayValidator<T> = CommonValidator & ObjectValidator<T> & {
  validate(validator: ValidateFn<T[]>, message?: string): void;

  forEach(fn: (validator: NestedValidator<T>) => void): void;
};

interface Validator {
  fn: ValidateFn<any>;
  path: Path;
  message?: string;
}

type ReturnType<T> = ObjectValidator<T> | ArrayValidator<T> | SingleValidator<T>;

class ValidatorInstance<T> implements PluginCallbacks {
  validators: Validator[] = [];

  onBatchFinish(_: PluginCallbacksOnBatchArgument): void {
  }

  onBatchStart(_: PluginCallbacksOnBatchArgument): void {
  }

  onDestroy(_: PluginCallbacksOnDestroyArgument): void {
  }

  onSet(_: PluginCallbacksOnSetArgument): void {
  }

  isValid(state: State<T>, downgraded: State<T>) {
    for (const validator of this.validators) {
      const paths = [...validator.path];

      let match = true;

      for (const path of state.path) {
        if (typeof path === 'string') {
          if (paths.length === 0) {
            break;
          }

          if (paths.shift() !== path) {
            match = false;
            break;
          }

          //data = data.nested(path as keyof T);
          //target = target.nested(path as keyof T);
        } else if (typeof path === 'number') {
          if (paths.length === 0) {
            match = false;

            break;
          }

          //const nextPath = paths.shift();

          //data = data.nested(nextPath as keyof T);
          //target = target.nested(nextPath as keyof T);
        }
      }

      if (!match) {
        continue;
      }

      if (paths.length && isArrayState(state)) {
        // if an array, run validation through each
        if (!state.every((item, index) => this.isValidNested(paths, item, downgraded[index], validator))) {
          return false;
        }
      } else if (!this.isValidNested(paths, state, downgraded, validator)) {
        return false;
      }
    }

    return true;
  }

  private isValidNested<T>(paths: Path, state: State<T>, downgrade: State<T>, validator: Validator) {
    let data: State<any> = downgrade;
    let target: State<any> = state;

    // drill down any unmatched paths
    for (const path of paths) {
      data = data.nested(path as keyof T);
      target = target.nested(path as keyof T);
    }

    if (isPrimitiveState(target)) {
      if (!validator.fn(target.get())) {
        return false;
      }
    } else if (!validator.fn(data.get())) {
      return false;
    }

    return true;
  }
}

function isPrimitiveState<T>(state: any): state is State<T> {
  return state.keys === undefined;
}

function isObjectState<T>(state: any): state is State<T> {
  return Array.isArray(state.keys) && state.keys.every(k => typeof k === 'string');
}

function isArrayState<T>(state: any): state is ReadonlyArray<State<T>> {
  return !isPrimitiveState(state) && !isObjectState(state);
}

function forEach(instance: ValidatorInstance<any>, state: State<any>, downgraded: State<any>, path?: (string | number | symbol)[]) {
  const realPath = path || state.path;

  return (fn: (validator: any) => void) => {
    fn(
      new Proxy({}, {
        get(target, prop) {
          const getter = (fieldValidator: ValidateFn<any>, message?: string) => {
            instance.validators.push({
              fn: fieldValidator,
              path: [...realPath, prop],
              message,
            });
          };

          return new Proxy(getter, {
            apply(t: (fieldValidator: ValidateFn<any>) => void, thisArg: any, argArray?: any): any {
              t.apply(thisArg, argArray);
            },
            get(_, nestedProp) {
              const nestedPath = [...realPath, prop];

              if (nestedProp === 'isValid') {
                return instance.isValid(state, downgraded);
              }

              if (nestedProp === 'validate') {
                return (nestedValidator: ValidateFn<any>, message?: string) => {
                  instance.validators.push({
                    fn: nestedValidator,
                    path: nestedPath,
                    message,
                  });
                };
              }

              if (nestedProp === 'forEach') {
                return forEach(instance, state, downgraded, nestedPath);
              }

              throw new Error(`Unsupported property.`);
            },
          });
        },
      }),
    );
  };
}

function stateToApi<T>(instance: ValidatorInstance<any>, state: State<any>, downgraded: State<any>): ReturnType<T> {
  if (isPrimitiveState(state)) {
    return {
      validate: (fn: ValidateFn<any>, message?: string) => {
        instance.validators.push({
          fn,
          path: state.path,
          message,
        });
      },
      isValid: () => instance.isValid(state, downgraded),
    } as SingleValidator<any>;
  }

  if (isObjectState(state)) {
    // object field type
    const api = { isValid: () => instance.isValid(state, downgraded) } as ObjectValidator<T>;

    for (const field of state.keys) {
      api[field] = stateToApi(instance, state.nested(field), downgraded.nested(field));
    }

    return api;
  }

  // array field type
  return {
    isValid: () => instance.isValid(state, downgraded),
    forEach: forEach(instance, state, downgraded),
    validate(fn: (value: any, message?: string) => boolean, message: string | undefined): void {
      instance.validators.push({
        fn,
        path: state.path,
        message,
      });
    },
  } as ArrayValidator<T>;
}

export function Validation(): Plugin;
export function Validation(input: State<string>): SingleValidator<string>;
export function Validation(input: State<number>): SingleValidator<number>;
export function Validation<T>(input: State<T[]>): ArrayValidator<T>;
export function Validation<T>(input: State<T>): ObjectValidator<T>;
export function Validation<T>(input?: State<T>): Plugin | ReturnType<T> {
  if (input === undefined) {
    return {
      id: ValidationId,
      init: () => {
        return new ValidatorInstance();
      },
    };
  }

  const [instance] = input.attach(ValidationId);

  if (instance instanceof Error) {
    throw new Error(`Forgot to run state.attach(Validation())`);
  }

  if (!(instance instanceof ValidatorInstance)) {
    throw new Error('Expected plugin to be of ValidatorInstance');
  }

  const downgraded: State<T> = useState(input);
  downgraded.attach(Downgraded);

  return stateToApi(instance, input, downgraded);
}
