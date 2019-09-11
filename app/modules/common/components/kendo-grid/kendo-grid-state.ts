import { action, computed, observable, runInAction } from 'mobx';
import { fromPromise } from 'mobx-utils';
import {
    CompositeFilterDescriptor,
    AggregateDescriptor,
    GroupDescriptor,
    SortDescriptor
    // toODataString
} from '@progress/kendo-data-query';
import {
    ExcelExport,
    ExcelExportData,
    ExcelExportColumnProps
} from '@progress/kendo-react-excel-export';
import {
    GridExpandChangeEvent,
    GridFilterChangeEvent,
    GridGroupChangeEvent,
    GridPageChangeEvent,
    GridSelectionChangeEvent,
    GridSortChangeEvent
} from '@progress/kendo-react-grid';
import { GridPDFExport } from '@progress/kendo-react-pdf';
import { WorkbookOptions } from '@progress/kendo-ooxml';
import { ProcessedData, DataResult, GroupResult, DataSource, IdType } from './data-sources';
import { FormState, FieldState } from 'formstate';
import { formStateToJS } from '../../utils/form-helpers';

export type Selectable<T> = { readonly selected: boolean | undefined } & T;
export type Editable<T> = { readonly inEdit: boolean | undefined } & T;

interface ProcessedSelectableData<T> extends ProcessedData<T> {
    data: DataResult<Selectable<T>>;
}

export function isGroupItem<T>(
    item: T | GroupResult<T>,
    groups: GroupDescriptor[]
): item is GroupResult<T> {
    const field: string | undefined = (item as GroupResult<T>).field;

    return !!field && groups.some(g => g.field === field);
}

function addAggregatesToGroups(groups: GroupDescriptor[], aggregates: AggregateDescriptor[]) {
    return groups.map(group => ({
        ...group,
        aggregates
    }));
}

export type PossibleFormState<T> = FormState<
    {
        [P in keyof T]-?: FieldState<T[P]>;
    }
>;

interface KendoGridStateContructorParams<T, TId extends IdType = never> {
    dataSource?: DataSource<T, TId> | null;
    pageSize?: number;
    /** For use with grids that enable selection only. Specifies if the item is selectable in the checkbox */
    isRowUnselectable?: (row: T) => boolean;
    selectionLimit?: number;
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
export interface IKendoGridState<T, TId extends IdType = never> {
    totalCount?: number;
    selectedCount?: number;
    addToDataSource?: (row: T, select?: boolean | undefined) => Promise<void>;
    removeFromDataSource?: (id: TId) => Promise<T | undefined>;
    selectAll?: () => Promise<void>;
    deselectAll?: () => void;
    setDataSource?: (
        dataSource: DataSource<T, TId> | null,
        reset?: boolean | undefined
    ) => Promise<void>;
    isRowUnselectable?: (row: T) => boolean;
}

export class KendoGridState<T, TId extends IdType = never> {
    @observable private innerDataSource: DataSource<T, TId> | null;
    @computed get dataSource() {
        return this.innerDataSource;
    }

    @computed private get originalData() {
        return this.flatten(this.data);
    }

    private flatten(data: DataResult<Selectable<T>>) {
        const traverse = (
            items: DataResult<Selectable<T>>,
            callback: (item: Selectable<T>) => void
        ) => {
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

        traverse(data, item => {
            result.push(item);
        });

        return result;
    }

    @observable selectedIds = new Set<TId>();
    @observable inEdit = new Map<TId, PossibleFormState<T>>();

    isRowUnselectable: (row: T) => boolean;
    selectionLimit: number;

    getFormState?(row: T): PossibleFormState<T>;

    @observable data: DataResult<Selectable<T>> = [];
    @observable totalCount = 0;
    @observable filteredCount = 0;
    @observable selectedCount = 0;
    @observable unselectableCount = 0;
    @computed get unselectedCount() {
        return this.totalCount - this.selectedCount;
    }
    @computed get selectableCount() {
        return this.totalCount - this.unselectableCount;
    }
    @computed get filteredUnselectableCount() {
        return this.originalData.filter(this.isRowUnselectable).length;
    }
    @computed get filteredSelectableCount() {
        return this.originalData.length - this.filteredUnselectableCount;
    }
    @computed private get totalFilteredSelectableCountPromise() {
        return fromPromise(
            new Promise<number>(async (resolve, reject) => {
                if (!this.dataSource) {
                    return reject();
                }

                const filteredData = await this.dataSource.getData({
                    filter: this.filter
                });

                resolve(
                    (filteredData.data as T[]).filter(row => !this.isRowUnselectable(row)).length
                );
            })
        );
    }
    @computed get totalFilteredSelectableCount(): number {
        return this.totalFilteredSelectableCountPromise.value || 0;
    }
    @observable sort: SortDescriptor[] = [];
    @observable filter: CompositeFilterDescriptor | undefined;

    @observable innerAggregates: AggregateDescriptor[] = [];
    @computed
    get aggregates() {
        return this.innerAggregates;
    }
    set aggregates(value) {
        this.innerAggregates = value;
        this.innerGroup = addAggregatesToGroups(this.innerGroup, this.innerAggregates);
    }

    @observable innerGroup: GroupDescriptor[] = [];
    @computed
    get group() {
        return this.innerGroup;
    }
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
        isRowUnselectable = () => false,
        selectionLimit = Infinity,
        getFormState
    }: KendoGridStateContructorParams<T, TId> = {}) {
        this.innerDataSource = dataSource;
        this.pageSize = pageSize;
        this.isRowUnselectable = isRowUnselectable;
        this.selectionLimit = selectionLimit;
        this.selectedIds = new Set();

        this.getFormState = getFormState;

        this.fetchInitialData();
    }

    async addToDataSource(row: T, select?: boolean) {
        if (!this.dataSource) {
            return;
        }

        if (!this.dataSource.addData) {
            throw 'missing addData in the data source';
        }

        await this.dataSource.addData(row);
        runInAction(() => {
            this.totalCount += 1;

            if (select) {
                if (!this.dataSource!.idSelector) {
                    throw 'missing idSelector in the data source';
                }

                this.selectedIds.add(this.dataSource!.idSelector(row));
                this.selectedCount += 1;
            }
        });

        await this.fetchData();
    }

    async removeFromDataSource(id: TId): Promise<T | undefined> {
        if (!this.dataSource) {
            return;
        }

        if (!this.dataSource.removeData) {
            throw 'missing removeData in the data source';
        }

        const row = (await this.dataSource.removeData(id)) as Editable<Selectable<T>> | undefined;
        if (!row) {
            return;
        }

        runInAction(() => {
            this.totalCount -= 1;

            if (this.selectedIds.has(id)) {
                this.selectedIds.delete(id);
                this.selectedCount -= 1;
            }

            if (this.inEdit.has(id)) {
                this.inEdit.delete(id);
            }
        });

        await this.fetchData();

        return row;
    }

    @action
    private setRowsSelection(rows: T[], value: boolean) {
        if (!this.dataSource) {
            return;
        }

        if (!this.dataSource.idSelector) {
            throw 'missing idSelector in the data source';
        }

        for (const row of rows) {
            if (!this.isRowUnselectable(row)) {
                if (value) {
                    this.selectedIds.add(this.dataSource.idSelector(row));
                } else {
                    this.selectedIds.delete(this.dataSource.idSelector(row));
                }
            }
        }

        this.selectedCount = this.selectedIds.size;

        this.data = this.data.slice();
    }

    selectPage() {
        this.setRowsSelection(this.originalData, true);
    }

    deselectPage() {
        this.setRowsSelection(this.originalData, false);
    }

    private async setAllSelection(value: boolean) {
        if (!this.dataSource) {
            return;
        }

        const filteredData = await this.dataSource.getData({
            filter: this.filter
        });

        this.setRowsSelection(filteredData.data as T[], value);
    }

    async selectAll() {
        if (this.selectionLimit !== Infinity) {
            throw 'selectAll isn\'t supported for limited selection';
        }

        await this.setAllSelection(true);
    }

    async deselectAll() {
        await this.setAllSelection(false);
    }

    @action
    edit(row: T) {
        if (!this.dataSource) {
            return;
        }

        if (!this.dataSource.idSelector) {
            throw 'missing idSelector in the data source';
        }

        if (!this.getFormState) {
            throw 'missing getFormState';
        }

        this.inEdit.set(this.dataSource.idSelector(row), this.getFormState(row));

        this.data = this.data.slice();
    }

    @action
    async saveEdit(row: T, beforeSave?: (changed: T) => Promise<void>) {
        if (!this.dataSource) {
            return;
        }

        if (!this.dataSource.idSelector) {
            throw 'missing idSelector in the data source';
        }

        if (!this.dataSource.updateData) {
            throw 'missing updateData in the data source';
        }

        const id = this.dataSource.idSelector(row);
        const form = this.inEdit.get(id);

        if (!form) {
            return;
        }

        const changed = (formStateToJS(form) as unknown) as T; // FIXME: incompatible types

        if (beforeSave) {
            await beforeSave(changed);
        }

        await this.dataSource.updateData(id, changed);

        runInAction(() => {
            this.inEdit.delete(id);
        });

        await this.fetchData();
    }

    @action
    cancelEdit(row: T) {
        if (!this.dataSource) {
            return;
        }

        if (!this.dataSource.idSelector) {
            throw 'missing idSelector in the data source';
        }

        this.inEdit.delete(this.dataSource.idSelector(row));

        this.data = this.data.slice();
    }

    async editAll() {
        if (!this.dataSource) {
            return;
        }

        if (!this.dataSource.idSelector) {
            throw 'missing idSelector in the data source';
        }

        if (!this.getFormState) {
            throw 'missing getFormState';
        }

        const rows = this.flatten((await this.dataSource.getData({})).data as DataResult<
            Selectable<T>
        >);

        runInAction(() => {
            this.inEdit = new Map(
                rows.map<[TId, PossibleFormState<T>]>(row => [
                    this.dataSource!.idSelector!(row),
                    this.getFormState!(row)
                ])
            );

            this.data = this.data.slice();
        });
    }

    async saveEditAll(beforeSave?: (changed: T[]) => Promise<void>) {
        if (!this.dataSource) {
            return;
        }

        if (!this.dataSource.updateData) {
            throw 'missing updateData in the data source';
        }

        const changes = Array.from(this.inEdit).map(([id, form]) => ({
            id,
            changed: (formStateToJS(form) as unknown) as T // FIXME: incompatible types
        }));

        if (beforeSave) {
            await beforeSave(changes.map(change => change.changed));
        }

        for (const { id, changed } of changes) {
            await this.dataSource.updateData(id, changed);
        }

        this.inEdit = new Map();

        await this.fetchData();
    }

    @action
    cancelEditAll() {
        if (!this.dataSource) {
            return;
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
    async setDataSource(dataSource: DataSource<T, TId> | null, reset?: boolean) {
        this.innerDataSource = dataSource;
        this.skip = 0;
        if (reset) {
            this.reset();
        }
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
    };

    private addPropertiesToRows(data: T[]) {
        if (!this.dataSource) {
            return;
        }

        if (!this.dataSource.idSelector) {
            return;
        }

        for (const row of data) {
            if (!('selected' in row)) {
                Object.defineProperty(row, 'selected', {
                    get: () => this.selectedIds.has(this.dataSource!.idSelector!(row))
                });
            }

            if (!('inEdit' in row)) {
                Object.defineProperty(row, 'inEdit', {
                    get: () => this.inEdit.has(this.dataSource!.idSelector!(row))
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
    };

    @action
    handleGroupChange = (ev: GridGroupChangeEvent) => {
        this.fetchData({
            newGroup: ev.group
        });
    };

    @action
    handleExpandChange = (ev: GridExpandChangeEvent) => {
        ev.dataItem.expanded = ev.value;

        this.data = this.data.slice();
    };

    @action
    handleSortChange = (ev: GridSortChangeEvent) => {
        this.fetchData({
            newSort: ev.sort
        });
    };

    @action
    handlePageChange = (ev: GridPageChangeEvent) => {
        this.fetchData({
            newSkip: ev.page.skip
        });
    };

    /** Call without params if unchanged */
    fetchData = async ({
        newSkip,
        newSort,
        newFilter,
        newAggregates,
        newGroup
    }: FetchDataParams = {}) => {
        if (!this.dataSource) {
            return;
        }

        const sort = newSort || [...this.sort];
        const filter = newFilter === null ? undefined : newFilter || this.filter;
        const aggregates = newAggregates || this.aggregates;
        const group = addAggregatesToGroups(newGroup || this.group, aggregates);
        const skip =
            newSort || newFilter !== undefined || newGroup
                ? 0
                : newSkip !== undefined
                ? newSkip
                : this.skip;

        const newData = (await this.dataSource.getData({
            skip,
            sort,
            filter,
            group: [...group],
            take: this.pageSize
        })) as ProcessedSelectableData<T>;

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
                        const filteredData = this.dataSource.getFilteredPersistentItems(
                            newFilter
                        ) as Editable<Selectable<T>>[];
                        filteredData.forEach(dataItem => {
                            if (this.dataSource!.idSelector) {
                                if (dataItem.selected) {
                                    this.selectedIds.delete(this.dataSource!.idSelector!(dataItem));
                                }

                                if (dataItem.inEdit) {
                                    this.inEdit.delete(this.dataSource!.idSelector!(dataItem));
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
    };

    handleSelectionChange = (ev: GridSelectionChangeEvent) => {
        if (!this.dataSource) {
            return;
        }

        if (!this.dataSource.idSelector) {
            throw 'missing idSelector in the data source';
        }

        this.selectRow(this.dataSource.idSelector(ev.dataItem));
    };

    @action
    selectRow(id: TId) {
        if (this.selectedIds.has(id)) {
            this.selectedIds.delete(id);
            this.selectedCount -= 1;
        } else if (this.selectedCount < this.selectionLimit) {
            this.selectedIds.add(id);
            this.selectedCount += 1;
        }

        this.data = this.data.slice();
    }

    @computed get isAllPageRowsSelected() {
        return (
            this.originalData.some(row => row.selected) &&
            this.originalData.every(row => this.isRowUnselectable(row) || row.selected)
        );
    }

    @computed get isSomePageRowsSelected() {
        return this.originalData.some(row => row.selected) && !this.isAllPageRowsSelected;
    }

    @computed get isAllRowsSelected() {
        if (!this.selectedIds.size) {
            return false;
        }

        return this.selectedIds.size === this.totalFilteredSelectableCount;
    }

    @computed get isSomeRowsSelected() {
        if (!this.selectedIds.size) {
            return false;
        }

        return !this.isAllRowsSelected;
    }

    setGridPdfExportRef = (el: GridPDFExport | null) => (this.gridPdfExport = el);
    setGridExcelExportRef = (el: ExcelExport | null) => (this.gridExcelExport = el);

    exportPdf = async () => {
        if (this.dataSource && this.gridPdfExport) {
            const { data } = (await this.dataSource.getData({})) as ProcessedSelectableData<T>; // fetch all data
            this.gridPdfExport.save(data);
        }
    };

    exportExcel = async (
        data?: any[] | ExcelExportData | WorkbookOptions,
        columns?: ExcelExportColumnProps[] | React.ReactElement<ExcelExportColumnProps>[]
    ) => {
        if (this.gridExcelExport) {
            this.gridExcelExport.save(
                data || (await this.filteredSortedUnpaginatedData()).data,
                columns
            );
        }
    };

    filteredSortedUnpaginatedData = () => {
        if (!this.dataSource) {
            throw 'missing dataSource';
        }
        return this.dataSource.getData({
            filter: this.filter,
            sort: [...this.sort],
            group: [...this.group]
        });
    };
}
