import { GroupDescriptor, GroupResult, normalizeGroups } from '@progress/kendo-data-query';
import { Reducer } from '@progress/kendo-data-query/dist/npm/common.interfaces';
import { exec } from '@progress/kendo-data-query/dist/npm/transducers';
import { identity } from '@progress/kendo-data-query/dist/npm/funcs';
import { filterBy } from '../filtering/filter-expression.factory';
import { aggregateBy } from './aggregate.operators';
import { Preprocessors } from '../common.interfaces';
import { groupCombinator } from '../transducers';

export function groupBy<T>(
    data: T[],
    initialDescriptors: GroupDescriptor[] = [],
    preprocessors: Preprocessors<T> = {},
    transformers: Reducer = identity,
    originalData: T[] = data
) {
    const descriptors: GroupDescriptor[] = normalizeGroups(initialDescriptors);

    if (!descriptors.length) {
        return data;
    }

    const descriptor = descriptors[0];
    const initialValue: any = {}; // TODO: improve typings
    const view = exec(transformers(groupCombinator(descriptor.field, preprocessors)), initialValue, data);

    const result: GroupResult[] | T[] = [];

    Object.keys(view).forEach((field) => {
        Object.keys(view[field]).forEach((value) => {
            const group = view[field][value];

            let aggregateResult = {};
            let filteredData = originalData;
            if (descriptor.aggregates) {
                filteredData = filterBy(
                    originalData,
                    {
                        field: descriptor.field,
                        ignoreCase: false,
                        operator: 'eq',
                        value: group.value
                    },
                    preprocessors
                );

                aggregateResult = aggregateBy(filteredData, descriptor.aggregates, preprocessors);
            }

            result[group.__position] = {
                field,
                aggregates: aggregateResult,
                items: descriptors.length > 1
                    ? groupBy(group.items, descriptors.slice(1), preprocessors, identity, filteredData)
                    : group.items,
                value: group.value
            };
        });
    });

    return result;
}
