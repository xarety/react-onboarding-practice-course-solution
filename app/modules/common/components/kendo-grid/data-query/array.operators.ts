import { State, SortDescriptor, DataResult, normalizeFilters, normalizeGroups } from '@progress/kendo-data-query';
import { exec, skip as skipTransformer, take as takeTransformer, filter as filterTransformer, concat as concatTransformer } from '@progress/kendo-data-query/dist/npm/transducers';
import { count } from '@progress/kendo-data-query/dist/npm/array.operators';
import { Predicate } from '@progress/kendo-data-query/dist/npm/common.interfaces';
import { sort } from '@progress/kendo-data-query/dist/npm/sorting/sort';
import { compose } from '@progress/kendo-data-query/dist/npm/funcs';
import { compileFilter } from './filtering/filter-expression.factory';
import { composeSortDescriptors } from './sorting/sort-array.operator';
import { groupBy } from './grouping/group.operators';
import { Preprocessors } from './common.interfaces';

export function orderBy<T>(initialData: T[], descriptors: SortDescriptor[], preprocessors: Preprocessors<T> = {}) {
    let data = initialData;

    if (descriptors.some(x => !!x.dir)) {
        data = data.slice();
        const comparer = composeSortDescriptors(descriptors, preprocessors);
        sort(data, 0, data.length, comparer);
    }

    return data;
}

export function limit<T>(data: T[], predicate: Predicate | undefined) {
    if (predicate) {
        return data.filter(predicate);
    }
    return data;
}

export function process<T>(data: T[], state: State, preprocessors: Preprocessors<T> = {}): DataResult {
    const { skip, take, filter, sort, group } = state;

    let total = data.length;

    const sortDescriptors = [
        ...normalizeGroups(group || []),
        ...sort || []
    ];
    const orderedData = sortDescriptors.length
        ? orderBy(data, sortDescriptors, preprocessors)
        : data;

    const hasFilters = filter && filterTransformer.length; // TODO: I have no idea about filterTransformer.length check
    const hasGroups = group && group.length;
    if (!hasFilters && !hasGroups) {
        return {
            total,
            data: take != null
                ? orderedData.slice(skip, skip! + take)
                : orderedData
        };
    }

    let predicate: Predicate | undefined;
    const transformers = [];

    if (hasFilters) {
        predicate = compileFilter(
            normalizeFilters(filter!),
            preprocessors
        );
        transformers.push(filterTransformer(predicate));
        total = count(orderedData, predicate);
    }

    if (skip != null && take != null) {
        transformers.push(skipTransformer(skip));
        transformers.push(takeTransformer(take));
    }

    if (transformers.length) {
        const transform = compose(...transformers);
        const result = hasGroups
            ? groupBy(orderedData, group, preprocessors, transform, limit(orderedData, predicate))
            : exec(transform(concatTransformer), [], orderedData);

        return {
            total,
            data: result
        };
    }

    return {
        total,
        data: hasGroups
            ? groupBy(orderedData, group, preprocessors)
            : orderedData
    };
}
