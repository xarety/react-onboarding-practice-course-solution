import { State } from '@progress/kendo-data-query';
import axios, { CancelToken } from 'axios';
import { DataSource, ProcessedData, IdType } from './data-source';
import { cloneDeep } from '../../../utils/clone-deep';
import { toJS } from 'mobx';

interface Operations<T, TId> {
    get(state: State, cancelToken?: CancelToken): Promise<ProcessedData<T>>;
    add?(item: T): Promise<T>;
    update?(id: TId, changes: Partial<T>): Promise<void>;
    remove?(id: TId): Promise<T | undefined>;
}

export class AsyncDataSource<T, TId extends IdType = never> implements DataSource<T, TId> {
    // private lastSuccess = '';
    // private cachedData: ProcessedData<T> | null = null;
    private loading = false;
    private source = axios.CancelToken.source();

    get isLoading() {
        return this.loading;
    }

    constructor({ get, add, update, remove }: Operations<T, TId>, idSelector?: (row: T) => TId) {
        this.fetch = get;
        this.addData = add;
        this.updateData = update;
        this.removeData = remove;
        this.idSelector = idSelector;
    }

    private fetch: (state: State, cancelToken?: CancelToken) => Promise<ProcessedData<T>>;

    async getData(state: State) {
        if (this.isLoading) {
            this.source.cancel();
        }
        // FIXME: `toODataString` doesn't save groups information
        // if (this.cachedData && (toODataString(state) === this.lastSuccess)) {
        //     return cloneDeep(this.cachedData);
        // }
        this.source = axios.CancelToken.source();
        this.loading = true;
        const items = toJS(await this.fetch(state, this.source.token));
        this.loading = false;
        // this.cachedData = items;
        // this.lastSuccess = toODataString(state);
        return cloneDeep(items);
    }

    addData?: (row: T) => Promise<T>;

    updateData?: (id: TId, changes: Partial<T>) => Promise<void>;

    removeData?: (id: TId) => Promise<T | undefined>;

    idSelector?: (row: T) => TId;
}
