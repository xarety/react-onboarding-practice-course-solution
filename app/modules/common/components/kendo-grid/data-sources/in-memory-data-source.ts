import { State, CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { Preprocessors, filterBy, process } from '../data-query';
import { DataSource, ProcessedData, IdType } from './data-source';
import { cloneDeep } from '../../../utils/clone-deep';
import { toJS } from 'mobx';

export class InMemoryDataSource<T, TId extends IdType = never> implements DataSource<T, TId> {
    private data: T[];
    private preprocessors: Preprocessors<T>;

    constructor(data: T[], idSelector?: (row: T) => TId, preprocessors: Preprocessors<T> = {}) {
        this.data = cloneDeep(toJS(data));
        this.idSelector = idSelector;
        this.preprocessors = preprocessors;
    }

    async getData(state: State) {
        const processedData = process(cloneDeep(this.data), state, this.preprocessors);

        return Promise.resolve({
            data: processedData.data,
            filteredCount: processedData.total
        } as ProcessedData<T>);
    }

    async addData(row: T) {
        this.data.push(cloneDeep(row));

        return Promise.resolve(cloneDeep(row));
    }

    async updateData(id: TId, changes: Partial<T>) {
        if (!this.idSelector) {
            throw 'missing idSelector';
        }

        const row = this.data.find(row => this.idSelector!(row) === id);

        if (row) {
            Object.assign(row, changes);
        }
    }

    async removeData(id: TId) {
        if (!this.idSelector) {
            throw 'missing idSelector';
        }

        const index = this.data.findIndex(row => this.idSelector!(row) === id);

        if (index !== -1) {
            const row = this.data[index];
            this.data.splice(index, 1);
            return Promise.resolve(row);
        }
    }

    idSelector?: (row: T) => TId;

    getFilteredPersistentItems(filter: CompositeFilterDescriptor) {
        const set = new Set(this.data);
        const inFilter = filterBy(this.data, filter, this.preprocessors);
        inFilter.forEach(dataItem => set.delete(dataItem));
        return cloneDeep(Array.from(set));
    }
}
