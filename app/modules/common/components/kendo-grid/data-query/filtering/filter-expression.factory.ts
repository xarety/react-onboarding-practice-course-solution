import { CompositeFilterDescriptor, isCompositeFilterDescriptor, FilterDescriptor, normalizeFilters } from '@progress/kendo-data-query';
import { transformCompositeFilter } from './filter-no-eval';
import { Preprocessors } from '../common.interfaces';

export function compileFilter<T>(descriptor: CompositeFilterDescriptor, preprocessors: Preprocessors<T> = {}) {
    if (!descriptor || descriptor.filters.length === 0) {
        return () => true;
    }

    return transformCompositeFilter(descriptor, preprocessors);
}

export function filterBy<T>(data: T[], descriptor: FilterDescriptor | CompositeFilterDescriptor, preprocessors: Preprocessors<T> = {}) {
    if (!descriptor || (isCompositeFilterDescriptor(descriptor) && descriptor.filters.length === 0)) {
        return data;
    }

    return data.filter(compileFilter(normalizeFilters(descriptor), preprocessors));
}
