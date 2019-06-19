import { SortDescriptor, getter, Comparer } from '@progress/kendo-data-query';
import { Preprocessors } from '../common.interfaces';

function hasLocaleCompare<T extends any>(value: T): value is T & { localeCompare: Function } {
    return !!value.localeCompare;
}

const compare: Comparer = (a, b) => {
    if (a == null) {
        return a === b ? 0 : -1;
    }

    if (b == null) {
        return 1;
    }

    if (hasLocaleCompare(a)) {
        return a.localeCompare(b);
    }

    return a > b ? 1 : (a < b ? -1 : 0);
};

const compareDesc: Comparer = (a, b) => compare(b, a);

function descriptorAsFunc<T>(descriptor: SortDescriptor, preprocessors: Preprocessors<T> = {}): Comparer {
    const prop = getter(descriptor.field, true);
    const preprocessor = preprocessors[descriptor.field as keyof T];
    const itemProp: Function = (a: T) => {
        const value = prop(a);

        return preprocessor
            ? preprocessor(value)
            : value;
    };

    return (a, b) => (descriptor.dir === 'asc' ? compare : compareDesc)(itemProp(a), itemProp(b));
}

const initial: Comparer = (_0, _1) => 0;

export function composeSortDescriptors<T>(descriptors: SortDescriptor[], preprocessors: Preprocessors<T> = {}) {
    return descriptors.filter(
        x => !!x.dir
    ).map(
        descriptor => descriptorAsFunc(descriptor, preprocessors)
    ).reduce(
        (acc, curr) => (a, b) => acc(a, b) || curr(a, b), initial
    );
}
