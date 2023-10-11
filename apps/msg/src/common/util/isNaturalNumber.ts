export const isNaturalNumber = (value: any) => {
    if (typeof value !== 'string' && typeof value !== 'number') {
        return false;
    }

    const n = Math.floor(Number(value));
    return n !== Infinity && String(n) === String(value) && n > 0;
}