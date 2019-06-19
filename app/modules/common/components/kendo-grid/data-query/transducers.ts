import { getter, AggregateDescriptor } from '@progress/kendo-data-query';
import { Preprocessors } from './common.interfaces';
import { isNumeric, isDate } from './utils';

const valueToString = (initialValue: any) => {
    const value = initialValue != null && initialValue.getTime ? initialValue.getTime() : initialValue;
    return value + '';
};

export function groupCombinator<T>(field: string, preprocessors: Preprocessors<T> = {}) {
    const prop = getter(field, true);
    const preprocessor = preprocessors[field as keyof T];
    const itemProp: Function = (a: T) => {
        const value = prop(a);

        return preprocessor
            ? preprocessor(value)
            : value;
    };

    let position = 0;
    return (agg: any, value: any) => {
        agg[field] = agg[field] || {};

        const groupValue = itemProp(value);
        const key = valueToString(groupValue);
        const values = agg[field][key] || {
            // tslint:disable-next-line: no-increment-decrement
            __position: position++,
            aggregates: {},
            items: [],
            value: groupValue
        };

        values.items.push(value);

        agg[field][key] = values;

        return agg;
    };
}

type AggregateFunction = 'average' | 'count' | 'max' | 'min' | 'sum';

const aggregatesFuncs = (name: AggregateFunction) => ({
    average: () => {
        let value = 0;
        let count = 0;
        return {
            calc: (curr: any) => {
                if (isNumeric(curr)) {
                    value += curr;
                    count += 1;
                } else {
                    value = curr;
                }
            },
            result: () => isNumeric(value) ? value / count : value
        };
    },
    count: () => {
        let state = 0;
        return {
            calc: () => state += 1,
            result: () => state
        };
    },
    max: () => {
        let state: number | Date = Number.NEGATIVE_INFINITY;
        return {
            calc: (value: any) => {
                state = isNumeric(state) || isDate(state) ? state : value;
                if (state < value && (isNumeric(value) || isDate(value))) {
                    state = value;
                }
            },
            result: () => state
        };
    },
    min: () => {
        let state: number | Date = Number.POSITIVE_INFINITY;
        return {
            calc: (value: any) => {
                state = isNumeric(state) || isDate(state) ? state : value;
                if (state > value && (isNumeric(value) || isDate(value))) {
                    state = value;
                }
            },
            result: () => state
        };
    },
    sum: () => {
        let state = 0;
        return {
            calc: (value: number) => state += value,
            result: () => state
        };
    }
}[name]());

export function aggregatesCombinator<T>(descriptors: AggregateDescriptor[], preprocessors: Preprocessors<T> = {}) {
    const functions = descriptors.map((descriptor) => {
        const prop = getter(descriptor.field, true);
        const preprocessor = preprocessors[descriptor.field as keyof T];
        const fieldAccessor: Function = (a: T) => {
            const value = prop(a);

            return preprocessor
                ? preprocessor(value)
                : value;
        };

        const aggregateName = (descriptor.aggregate || '').toLowerCase() as AggregateFunction;
        const aggregateAccessor = getter(aggregateName, true);

        return (state: any, value: any) => {
            const fieldAggregates = state[descriptor.field] || {};
            const aggregateFunction = aggregateAccessor(fieldAggregates) || aggregatesFuncs(aggregateName);

            aggregateFunction.calc(fieldAccessor(value));
            fieldAggregates[descriptor.aggregate] = aggregateFunction;
            state[descriptor.field] = fieldAggregates;

            return state;
        };
    });

    return (state: any, value: any) => functions.reduce((agg, calc) => calc(agg, value), state);
}
