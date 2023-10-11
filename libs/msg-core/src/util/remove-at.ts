export function removeAt<T>(arr: T[], index: number): T[] {
    if (index >= arr.length) {
        return [...arr]
    }

    const newArr = [
        ...arr.slice(0, index),
        ...arr.slice(index + 1),
    ]

    return newArr;
}