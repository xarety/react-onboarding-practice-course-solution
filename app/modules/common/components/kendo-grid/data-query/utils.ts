export function isNumeric(value: any): value is number {
    return !isNaN(value - parseFloat(value));
}

export function isDate(value: any): value is Date {
    return value && value.getTime;
}
