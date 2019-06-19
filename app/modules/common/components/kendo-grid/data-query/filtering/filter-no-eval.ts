import { CompositeFilterDescriptor, isCompositeFilterDescriptor, FilterDescriptor, getter } from '@progress/kendo-data-query';
import { Predicate } from '@progress/kendo-data-query/dist/npm/common.interfaces';
import { Preprocessors } from '../common.interfaces';
import { isNumeric, isDate } from '../utils';

const logic = {
    or: {
        concat(acc: Predicate, fn: Predicate): Predicate {
            return a => acc(a) || fn(a);
        },
        identity() {
            return false;
        }
    },
    and: {
        concat(acc: Predicate, fn: Predicate): Predicate {
            return a => acc(a) && fn(a);
        },
        identity() {
            return true;
        }
    }
};

const operatorsMap = {
    contains(a: string, b: string) {
        return (a || '').indexOf(b) >= 0;
    },
    doesnotcontain(a: string, b: string) {
        return (a || '').indexOf(b) === -1;
    },
    doesnotendwith(a: string, b: string) {
        return (a || '').indexOf(b, (a || '').length - (b || '').length) < 0;
    },
    doesnotstartwith(a: string, b: string) {
        return (a || '').lastIndexOf(b, 0) === -1;
    },
    endswith(a: string, b: string) {
        return (a || '').indexOf(b, (a || '').length - (b || '').length) >= 0;
    },
    eq(a: any, b: any) {
        return a === b;
    },
    gt(a: any, b: any) {
        return a > b;
    },
    gte(a: any, b: any) {
        return a >= b;
    },
    isempty(a: string) {
        return a === '';
    },
    isnotempty(a: string) {
        return a !== '';
    },
    isnotnull(a: any) {
        return a != null;
    },
    isnull(a: any) {
        return a == null;
    },
    lt(a: any, b: any) {
        return a < b;
    },
    lte(a: any, b: any) {
        return a <= b;
    },
    neq(a: any, b: any) {
        // tslint:disable-next-line: triple-equals
        return a != b;
    },
    startswith(a: string, b: string) {
        return (a || '').lastIndexOf(b, 0) === 0;
    }
};

const dateRegExp = /^\/Date\((.*?)\)\/$/;
function convertValue<T>(value: T, ignoreCase: boolean) {
    if (typeof value === 'string') {
        const date = dateRegExp.exec(value);

        if (date) {
            return new Date(+date[1]).getTime();
        } else if (ignoreCase) {
            return value.toLowerCase();
        }
    }

    if (isDate(value)) {
        return value.getTime();
    }

    return value;
}

function typedGetter(prop: Function, initialValue: any, ignoreCase: boolean) {
    if (initialValue == null) {
        return prop;
    }

    let acc = prop;
    let value = initialValue;

    if (typeof value === 'string') {
        const date = dateRegExp.exec(value);

        if (date) {
            value = new Date(+date[1]);
        } else {
            acc = (a: any) => {
                const x = prop(a);

                if (typeof x === 'string' && ignoreCase) {
                    return x.toLowerCase();
                } else {
                    return isNumeric(x) ? x + '' : x;
                }
            };
        }
    }

    if (isDate(value)) {
        return (a: any) => {
            const x = acc(a);
            
            return isDate(x) ? x.getTime() : x;
        };
    }

    return acc;
}

function transformFilter<T>(
    { field: initialField, ignoreCase: initialIgnoreCase, value: initialValue, operator: initialOperator }: FilterDescriptor,
    preprocessors: Preprocessors<T> = {}
) {
    const field = initialField == null ? (a: T) => a : initialField;
    const ignoreCase = initialIgnoreCase != null ? initialIgnoreCase! : true;
    const itemProp = typedGetter(
        typeof field === 'function'
            ? field
            : (() => {
                const prop = getter(field, true);

                return (a: T) => {
                    const preprocessor = preprocessors[field as keyof T];
                    const value = prop(a);

                    return preprocessor
                        ? preprocessor(value)
                        : value;
                };
            })(),
        initialValue,
        ignoreCase
    );
    const value = convertValue(initialValue, ignoreCase);
    const operator = typeof initialOperator === 'function'
        ? initialOperator
        : operatorsMap[initialOperator as keyof typeof operatorsMap];

    return (
        (a: T) => operator(itemProp(a), value, ignoreCase)
    ) as Predicate;
}

export function transformCompositeFilter<T>(filter: CompositeFilterDescriptor, preprocessors: Preprocessors<T> = {}): Predicate {
    const combiner = logic[filter.logic];

    return filter.filters.filter(
        x => x
    ).map(
        x => isCompositeFilterDescriptor(x)
            ? transformCompositeFilter(x, preprocessors)
            : transformFilter(x, preprocessors)
    ).reduce(combiner.concat, combiner.identity);
}
