export const appendIfAny = <T>(arr: T[], newItems: T[] | undefined | null) =>
    newItems?.length ? [...arr, ...newItems] : arr;
