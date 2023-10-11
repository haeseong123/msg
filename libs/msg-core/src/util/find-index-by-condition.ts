export function findIndexByCondition<T>(arr: T[], condition: (element: T) => boolean): number {
    const index = arr.findIndex(item => condition(item));

    return index;
}