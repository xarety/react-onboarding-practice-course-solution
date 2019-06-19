import { AggregateDescriptor, AggregateResult } from '@progress/kendo-data-query';
import { exec, expandAggregates } from '@progress/kendo-data-query/dist/npm/transducers';
import { Reducer } from '@progress/kendo-data-query/dist/npm/common.interfaces';
import { identity } from '@progress/kendo-data-query/dist/npm/funcs';
import { aggregatesCombinator } from '../transducers';
import { Preprocessors } from '../common.interfaces';

export function aggregateBy<T>(
    data: T[],
    descriptors: AggregateDescriptor[] = [],
    preprocessors: Preprocessors<T> = {},
    transformers: Reducer = identity
): AggregateResult {
    const initialValue = {};

    if (!descriptors.length) {
        return initialValue;
    }

    const result = exec(transformers(aggregatesCombinator(descriptors, preprocessors)), initialValue, data);

    return expandAggregates(result);
}
