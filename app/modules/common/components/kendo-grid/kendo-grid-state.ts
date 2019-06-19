import { action, computed, observable, runInAction, toJS } from 'mobx';
import axios, { CancelToken } from 'axios';
import {
    CompositeFilterDescriptor,
    AggregateDescriptor,
    GroupDescriptor,
    GroupResult,
    State,
    SortDescriptor,
    // toODataString
} from '@progress/kendo-data-query';
import { ExcelExport, ExcelExportData, ExcelExportColumnProps } from '@progress/kendo-react-excel-export';
import {
    GridExpandChangeEvent,
    GridFilterChangeEvent,
    GridGroupChangeEvent,
    GridHeaderSelectionChangeEvent,
    GridPageChangeEvent,
    GridSelectionChangeEvent,
    GridSortChangeEvent
} from '@progress/kendo-react-grid';
import { GridPDFExport } from '@progress/kendo-react-pdf';
import { WorkbookOptions } from '@progress/kendo-ooxml';
import { FormState, FieldState } from 'formstate';
import { cloneDeep } from '../../utils/clone-deep';
import { formStateToJS } from '../../utils/form-helpers';
import { Preprocessors, filterBy, process } from './data-query';

export type Selectable<T> = { readonly selected: boolean | undefined } & T;
type Editable<T> = { inEdit: boolean | undefined } & T;

export type DataResult<T> = T[] | TypedGroupResult<T>[];

interface TypedGroupResult<T> extends GroupResult {
    items: DataResult<T>;
}

export interface ProcessedData<T> {
    data: DataResult<T>;
    /** Number of filtered rows (or total number of rows if there was no filter), regardless of paging */
    filteredCount: number;
}

interface ProcessedSelectableData<T> extends ProcessedData<T> {
    data: DataResult<Selectable<T>>;
}

export interface DataSource<T> {
    /**
     * Gets the table rows, applying filtering and paging.
     * @param skip The number of rows to skip, equal to (page * page size) with page numbering starting at 0
     * @param take The page size, or <= 0 to return all rows
     * @param sort The array of SortDescriptor's to apply, if any
     * @param filter The CompositeFilterDescriptor filter to apply, if any
     * @param group The array of GroupDescriptor's to apply, if any
     */
    getData(params: State): Promise<ProcessedData<T>>;
    /**
     * For persistent data stores (where objects persist across multiple getData calls),
     * gets all the data that is excluded by the filter. Undefined for non-persistent data stores.
     */
    getFilteredPersistentItems?: (filter: CompositeFilterDescriptor) => T[];
}

export class InMemoryDataSource<T> implements DataSource<T> {
    private data: T[];
    private preprocessors: Preprocessors<T>;

    constructor(data: T[], preprocessors: Preprocessors<T> = {}) {
        this.data = cloneDeep(toJS(data));
        this.preprocessors = preprocessors;
    }

    getData(state: State) {
        const processedData = process(
            cloneDeep(this.data),
            state,
            this.preprocessors
        );

        return Promise.resolve({
            data: processedData.data as DataResult<T>,
            filteredCount: processedData.total
        });
    }

    /** For use by KendoGridState only */
    addData(row: T) { this.data.push(cloneDeep(row)); }

    /** For use by KendoGridState only */
    updateData(compare: (item: T) => boolean, changes: Partial<T>) {
        const item = this.data.find(compare);

        if (item) {
            Object.assign(item, changes);
        }
    }

    /** For use by KendoGridState only */
    removeData(compare: (item: T) => boolean) {
        const index = this.data.findIndex(compare);

        if (index !== -1) {
            const row = this.data[index];
            this.data.splice(index, 1);
            return row;
        }
    }

    getFilteredPersistentItems(filter: CompositeFilterDescriptor) {
        const set = new Set(this.data);
        const inFilter = filterBy(this.data, filter, this.preprocessors);
        inFilter.forEach(dataItem => set.delete(dataItem));
        return cloneDeep(Array.from(set));
    }
}

export class AsyncDataSource<T> implements DataSource<T> {
    // private lastSuccess = '';
    // private cachedData: ProcessedData<T> | null = null;
    private loading = false;
    private source = axios.CancelToken.source();

    get isLoading() {
        return this.loading;
    }

    constructor(private dataFetcher: (state: State, cancelToken?: CancelToken) => Promise<ProcessedData<T>>) { }

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
        const items = toJS(await this.dataFetcher(state, this.source.token));
        this.loading = false;
        // this.cachedData = items;
        // this.lastSuccess = toODataString(state);
        return cloneDeep(items);
    }
}

export function isGroupItem<T>(item: T | TypedGroupResult<T>, groups: GroupDescriptor[]): item is TypedGroupResult<T> {
    const field: string | undefined = (item as TypedGroupResult<T>).field;

    return !!field && groups.some(g => g.field === field);
}

function addAggregatesToGroups(groups: GroupDescriptor[], aggregates: AggregateDescriptor[]) {
    return groups.map(group => ({
        ...group,
        aggregates
    }));
}

export type PossibleFormState<T> = FormState<{
    [P in keyof T]-?: FieldState<T[P]>;
}>;

interface KendoGridStateContructorParams<T, TId = never> {
    dataSource?: DataSource<T> | null;
    pageSize?: number;
    /** For use with grids that enable selection only. Specifies the property that will be added to `selectedIds`. */
    idSelector?: (row: T) => TId;
    /** For use with grids that enable selection only. Specifies if the item is selectable in the checkbox */
    isRowUnselectable?: (row: T) => boolean;
    singleSelection?: boolean;
    getFormState?(row: T): PossibleFormState<T>;
}

interface FetchDataParams {
    newSkip?: number;
    newSort?: SortDescriptor[];
    newFilter?: CompositeFilterDescriptor | null;
    newAggregates?: AggregateDescriptor[];
    newGroup?: GroupDescriptor[];
}

/** Interface for unit testing purposes.*/
export interface IKendoGridState<T> {
    totalCount?: number;
    selectedCount?: number;
    addToDataSource?: (row: T, select?: boolean | undefined) => Promise<void>;
    removeFromDataSource?: (compare: (item: T) => boolean) => Promise<T | undefined>;
    selectAll?: () => Promise<void>;
    deselectAll?: () => void;
    setDataSource?: (dataSource: DataSource<T> | null, reset?: boolean | undefined) => Promise<void>;
    isRowUnselectable?: (row: T) => boolean;
}

export class KendoGridState<T, TId = never> {
    @observable private innerDataSource: DataSource<T> | null;
    @computed get dataSource() { return this.innerDataSource; }

    @computed private get originalData() { return this.flatten(this.data); }

    private flatten(data: DataResult<Selectable<T>>) {
        const traverse = (items: DataResult<Selectable<T>>, callback: (item: Selectable<T>) => void) => {
            if (!items) {
                return;
            }

            for (const item of items) {
                if (isGroupItem(item, this.group)) {
                    traverse(item.items, callback);
                } else {
                    callback(item);
                }
            }
        };

        const result: Selectable<T>[] = [];

        traverse(
            data,
            (item) => {
                result.push(item);
            }
        );

        return result;
    }

    @observable selectedIds = new Set<TId>();
    @observable inEdit = new Map<TId, PossibleFormState<T>>();

    isRowUnselectable: (row: T) => boolean;
    idSelector?(row: T): TId;
    singleSelection: boolean;

    getFormState?(row: T): PossibleFormState<T>;

    @observable data: DataResult<Selectable<T>> = [];
    @observable totalCount = 0;
    @observable filteredCount = 0;
    @observable selectedCount = 0;
    @observable unselectableCount = 0;
    @computed get unselectedCount() { return this.totalCount - this.selectedCount; }
    @computed get totalSelectableCount() { return this.totalCount - this.unselectableCount; }
    @computed get filteredUnselectableCount() { return this.originalData.filter(this.isRowUnselectable).length; }
    @computed get filteredSelectableCount() { return this.originalData.length - this.filteredUnselectableCount; }
    @observable sort: SortDescriptor[] = [];
    @observable filter: CompositeFilterDescriptor | undefined;

    @observable innerAggregates: AggregateDescriptor[] = [];
    @computed
    get aggregates() { return this.innerAggregates; }
    set aggregates(value) {
        this.innerAggregates = value;
        this.innerGroup = addAggregatesToGroups(this.innerGroup, this.innerAggregates);
    }

    @observable innerGroup: GroupDescriptor[] = [];
    @computed
    get group() { return this.innerGroup; }
    set group(value) {
        this.innerGroup = addAggregatesToGroups(value, this.aggregates);
    }

    @observable skip = 0;
    pageSize?: number;

    private gridPdfExport: GridPDFExport | null = null;
    private gridExcelExport: ExcelExport | null = null;

    constructor({
        dataSource = null,
        pageSize,
        idSelector,
        isRowUnselectable,
        singleSelection = false,
        getFormState
    }: KendoGridStateContructorParams<T, TId> = {}) {
        this.innerDataSource = dataSource;
        this.pageSize = pageSize;
        this.idSelector = idSelector;
        this.isRowUnselectable = isRowUnselectable ? isRowUnselectable : () => false;
        this.singleSelection = singleSelection;
        this.selectedIds = new Set();

        this.getFormState = getFormState;

        this.fetchInitialData();
    }

    @action
    async addToDataSource(row: T, select?: boolean) {
        if (!(this.dataSource instanceof InMemoryDataSource)) {
            throw 'addToDataSource only supported for InMemoryDataSource';
        }

        if (!this.idSelector) {
            throw 'missing idSelector';
        }

        this.addPropertiesToRows([row]);
        this.dataSource.addData(row);
        this.totalCount += 1;

        if (select) {
            this.selectedIds.add(this.idSelector(row));
            this.selectedCount += 1;
        }

        await this.fetchData();
    }

    @action
    async removeFromDataSource(compare: (item: T) => boolean): Promise<T | undefined> {
        if (!(this.dataSource instanceof InMemoryDataSource)) {
            throw 'removeFromDataSource only supported for InMemoryDataSource';
        }

        if (!this.idSelector) {
            throw 'missing idSelector';
        }

        const row = this.dataSource.removeData(compare) as Editable<Selectable<T>> | undefined;

        if (!row) { return; }

        this.totalCount -= 1;

        if (row.selected) {
            this.selectedIds.delete(this.idSelector(row));
            this.selectedCount -= 1;
        }

        if (row.inEdit) {
            this.inEdit.delete(this.idSelector(row));
        }

        await this.fetchData();
        return row;
    }

    async selectAll() {
        if (this.singleSelection) {
            throw 'selectAll only supported for multiple selection';
        }

        if (!(this.dataSource instanceof InMemoryDataSource)) {
            throw 'selectAll only supported for InMemoryDataSource';
        }

        if (!this.idSelector) {
            throw 'missing idSelector';
        }

        const groupedData = await this.dataSource.getData({});
        runInAction(() => {
            const data = this.flatten(groupedData.data);
            for (const row of data) {
                this.selectedIds.add(this.idSelector!(row));
            }
            this.selectedCount = data.length;
        });
    }

    @action deselectAll() {
        if (!(this.dataSource instanceof InMemoryDataSource)) {
            throw 'deselectAll only supported for InMemoryDataSource';
        }

        this.selectedIds.clear();
        this.selectedCount = 0;
    }

    @action
    async edit(row: T) {
        if (!(this.dataSource instanceof InMemoryDataSource)) {
            throw 'edit only supported for InMemoryDataSource';
        }

        if (!this.idSelector) {
            throw 'missing idSelector';
        }

        if (!this.getFormState) {
            throw 'missing getFormState';
        }

        this.inEdit.set(this.idSelector(row), this.getFormState(row));

        await this.fetchData();
    }

    @action
    async saveEdit(row: T, beforeSave?: (changed: T) => Promise<void>) {
        if (!(this.dataSource instanceof InMemoryDataSource)) {
            throw 'saveEdit only supported for InMemoryDataSource';
        }

        if (!this.idSelector) {
            throw 'missing idSelector';
        }

        const form = this.inEdit.get(this.idSelector(row));

        if (!form) {
            return;
        }

        const changed = formStateToJS(form) as unknown as T; // FIXME: incompatible types

        if (beforeSave) {
            await beforeSave(changed);
        }

        await this.dataSource.updateData(
            v => this.idSelector!(v) === this.idSelector!(row),
            changed
        );

        runInAction(() => {
            this.inEdit.delete(this.idSelector!(row));
        });

        await this.fetchData();
    }

    @action
    cancelEdit(row: T) {
        if (!(this.dataSource instanceof InMemoryDataSource)) {
            throw 'cancelEdit only supported for InMemoryDataSource';
        }

        if (!this.idSelector) {
            throw 'missing idSelector';
        }

        this.inEdit.delete(this.idSelector(row));

        this.data = this.data.slice();
    }

    async editAll() {
        if (!(this.dataSource instanceof InMemoryDataSource)) {
            throw 'editAll only supported for InMemoryDataSource';
        }

        if (!this.idSelector) {
            throw 'missing idSelector';
        }

        if (!this.getFormState) {
            throw 'missing getFormState';
        }

        const rows = this.flatten(
            (await this.dataSource.getData({})).data
        );

        runInAction(() => {
            this.inEdit = new Map(
                rows.map<[TId, PossibleFormState<T>]>(
                    row => [this.idSelector!(row), this.getFormState!(row)]
                )
            );

            this.data = this.data.slice();
        });
    }

    async saveEditAll(beforeSave?: (changed: T[]) => Promise<void>) {
        if (!(this.dataSource instanceof InMemoryDataSource)) {
            throw 'saveEditAll only supported for InMemoryDataSource';
        }

        if (!this.idSelector) {
            throw 'missing idSelector';
        }

        const changes = this.flatten(
            (await this.dataSource.getData({})).data
        ).map((row) => {
            const form = this.inEdit.get(this.idSelector!(row));

            return {
                row,
                changed: form && formStateToJS(form) as unknown as T // FIXME: incompatible types
            };
        }).filter(
            change => change.changed
        ) as { row: T; changed: T }[];

        if (beforeSave) {
            await beforeSave(
                changes.map(change => change.changed)
            );
        }

        for (const { row, changed } of changes) {
            await this.dataSource.updateData(
                v => this.idSelector!(v) === this.idSelector!(row),
                changed
            );

            runInAction(() => {
                this.inEdit.delete(this.idSelector!(row));
            });
        }

        await this.fetchData();
    }

    @action
    cancelEditAll() {
        if (!(this.dataSource instanceof InMemoryDataSource)) {
            throw 'cancelEditAll only supported for InMemoryDataSource';
        }

        this.inEdit = new Map();

        this.data = this.data.slice();
    }

    @action reset() {
        this.totalCount = 0;
        this.filteredCount = 0;
        this.data = [];
        this.selectedCount = 0;
        this.selectedIds = new Set();
        this.inEdit = new Map();
        this.sort = [];
        this.filter = undefined;
        this.innerAggregates = [];
        this.innerGroup = [];
    }

    @action
    async setDataSource(dataSource: DataSource<T> | null, reset?: boolean) {
        this.innerDataSource = dataSource;
        this.skip = 0;
        if (reset) { this.reset(); }
        await this.fetchInitialData();
    }

    @action
    private fetchInitialData = async () => {
        if (!this.dataSource) {
            return;
        }

        const initial = await this.dataSource.getData({
            skip: 0,
            take: this.pageSize,
            filter: this.filter,
            sort: [...this.sort],
            group: [...this.group]
        });

        runInAction(() => {
            this.totalCount = initial.filteredCount;
            this.filteredCount = initial.filteredCount;
            this.data = initial.data as DataResult<Selectable<T>>;
            this.addPropertiesToRows(this.originalData);
            this.unselectableCount = this.originalData.filter(this.isRowUnselectable).length;
        });
    }

    private addPropertiesToRows(data: T[]) {
        const idSelector = this.idSelector;
        if (!idSelector) {
            return;
        }

        for (const row of data) {
            if (!('selected' in row)) {
                Object.defineProperty(row, 'selected', {
                    get: () => this.selectedIds.has(idSelector(row))
                });
            }

            if (!('inEdit' in row)) {
                Object.defineProperty(row, 'inEdit', {
                    get: () => this.inEdit.has(idSelector(row))
                });
            }
        }
    }

    @action
    handleFilterChange = (ev: GridFilterChangeEvent) => {
        // ev.filter is null when unsetting the filter - using a local for fixed type definiton
        const filter: CompositeFilterDescriptor | null = ev.filter;

        this.fetchData({
            newFilter: filter
        });
    }

    @action
    handleGroupChange = (ev: GridGroupChangeEvent) => {
        this.fetchData({
            newGroup: ev.group
        });
    }

    @action
    handleExpandChange = (ev: GridExpandChangeEvent) => {
        ev.dataItem.expanded = ev.value;

        this.data = this.data.slice();
    }

    @action
    handleSortChange = (ev: GridSortChangeEvent) => {
        this.fetchData({
            newSort: ev.sort
        });
    }

    @action
    handlePageChange = (ev: GridPageChangeEvent) => {
        this.fetchData({
            newSkip: ev.page.skip
        });
    }

    /** Call without params if unchanged */
    fetchData = async ({ newSkip, newSort, newFilter, newAggregates, newGroup }: FetchDataParams = {}) => {
        if (!this.dataSource) {
            return;
        }

        const sort = newSort || [...this.sort];
        const filter = newFilter === null ? undefined : newFilter || this.filter;
        const aggregates = newAggregates || this.aggregates;
        const group = addAggregatesToGroups(newGroup || this.group, aggregates);
        const skip = newSort || newFilter !== undefined || newGroup
            ? 0
            : (newSkip !== undefined ? newSkip : this.skip);

        const newData = await this.dataSource.getData({
            skip,
            sort,
            filter,
            group: [...group],
            take: this.pageSize
        }) as ProcessedSelectableData<T>;

        runInAction(() => {
            if (!this.dataSource) {
                return;
            }

            if (newFilter !== undefined) {
                // When a new filter is applied, deselect items that don't match the filter
                if (this.dataSource.getFilteredPersistentItems) {
                    // For persistent items, deselect everything in the persistent array that's been filtered out
                    if (newFilter !== null) {
                        let delta = 0;
                        const filteredData = this.dataSource.getFilteredPersistentItems(newFilter) as Editable<Selectable<T>>[];
                        filteredData.forEach((dataItem) => {
                            if (this.idSelector) {
                                if (dataItem.selected) {
                                    this.selectedIds.delete(this.idSelector(dataItem));
                                }

                                if (dataItem.inEdit) {
                                    this.inEdit.delete(this.idSelector(dataItem));
                                }
                            }

                            if (dataItem.selected) {
                                delta += 1;
                            }
                        });
                        this.selectedCount -= delta;
                    }
                } else {
                    // For non-peristent items, everything is deselected by default
                    this.selectedCount = 0;
                }
            }

            this.data = newData.data;
            this.addPropertiesToRows(this.originalData);
            this.filteredCount = newData.filteredCount;
            this.sort = sort;
            this.filter = filter;
            this.innerAggregates = aggregates;
            this.innerGroup = group;
            this.skip = skip;
        });
    }

    @action
    handleSelectionChange = (ev: GridSelectionChangeEvent) => {
        if (!this.idSelector) {
            throw 'missing idSelector';
        }

        this.selectRow(this.idSelector(ev.dataItem));

        this.data = this.data.slice();
    }

    @action
    selectRow(id: TId) {
        if (this.singleSelection) { // for single-selection mode
            if (this.selectedIds.has(id)) {
                return;
            } else {
                this.selectedIds.clear();
                this.selectedIds.add(id);
                this.selectedCount = 1;
            }
        } else { // multi-selection mode
            if (this.selectedIds.has(id)) {
                this.selectedIds.delete(id);
            } else {
                this.selectedIds.add(id);
            }

            this.selectedCount += this.selectedIds.has(id) ? 1 : -1;
        }
    }

    @action
    handleHeaderSelectionChange = (ev: GridHeaderSelectionChangeEvent) => {
        const idSelector = this.idSelector;
        if (!idSelector) {
            throw 'missing idSelector';
        }

        const checked = (ev.syntheticEvent.currentTarget.firstElementChild as HTMLInputElement).checked;

        this.originalData.forEach((item) => {
            if (!this.isRowUnselectable(item)) {
                if (!checked) { // The state before click
                    this.selectedIds.add(idSelector(item));
                } else {
                    this.selectedIds.delete(idSelector(item));
                }
            }
        });
        this.selectedCount = this.selectedIds.size;

        this.data = this.data.slice();
    }

    @computed get isAllRowsSelected() {
        this.selectedCount; // observe extra variable to trigger change for selectAll
        return this.originalData.every(dataItem => this.isRowUnselectable(dataItem) || !!dataItem.selected) &&
            (this.idSelector === undefined || this.originalData.some(dataItem => this.selectedIds.has(this.idSelector!(dataItem as T))));
    }

    @computed get isSomeRowsSelected() {
        return this.selectedIds.size > 0 && this.selectedIds.size < this.filteredSelectableCount;
    }

    setGridPdfExportRef = (el: GridPDFExport | null) => this.gridPdfExport = el;
    setGridExcelExportRef = (el: ExcelExport | null) => this.gridExcelExport = el;

    exportPdf = async () => {
        if (this.dataSource && this.gridPdfExport) {
            const { data } = await this.dataSource.getData({}) as ProcessedSelectableData<T>; // fetch all data
            this.gridPdfExport.save(data);
        }
    }

    exportExcel = async (
        data?: any[] | ExcelExportData | WorkbookOptions,
        columns?: ExcelExportColumnProps[] | React.ReactElement<ExcelExportColumnProps>[]
    ) => {
        if (this.gridExcelExport) {
            this.gridExcelExport.save(data || (await this.filteredSortedUnpaginatedData()).data, columns);
        }
    }

    filteredSortedUnpaginatedData = () => {
        if (!this.dataSource) {
            throw 'missing dataSource';
        }
        return this.dataSource.getData({
            filter: this.filter,
            sort: [...this.sort],
            group: [...this.group]
        });
    }
}
