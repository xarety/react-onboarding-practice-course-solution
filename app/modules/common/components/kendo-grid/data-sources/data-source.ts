import {
    GroupResult as KendoGroupResult,
    State,
    CompositeFilterDescriptor
} from '@progress/kendo-data-query';

export type IdType = string | number;

export interface ProcessedData<T> {
    /**
     * The data that will be rendered by the Grid as an array.
     */
    data: DataResult<T>;
    /**
     * The total number of records that are available.
     */
    filteredCount: number;
}

export type DataResult<T> = T[] | GroupResult<T>[];

export interface GroupResult<T> extends KendoGroupResult {
    items: DataResult<T>;
}

export interface DataSource<T, TId extends IdType = never> {
    /**
     * Gets the table rows, applying the specified operation descriptors.
     * @param {State} state - The operation descriptors that will be applied to the data.
     */
    getData(params: State): Promise<ProcessedData<T>>;

    addData?(row: T): Promise<T>;

    updateData?(id: TId, changes: Partial<T>): Promise<void>;

    removeData?(id: TId): Promise<T | undefined>;

    idSelector?(row: T): TId;

    /**
     * For persistent data stores (where objects persist across multiple getData calls),
     * gets all the data that is excluded by the filter. Undefined for non-persistent data stores.
     */
    getFilteredPersistentItems?: (filter: CompositeFilterDescriptor) => T[];
}
