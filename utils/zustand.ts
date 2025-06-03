export type SetStateType<T extends object> = (
    stateOrFn: T | Partial<T> | ((state: T) => T | Partial<T>),
    replace?: false | undefined,
    action?: string // Add the action parameter, even if you don't use it.
) => void;

export type GetStateType<T extends object> = () => T;