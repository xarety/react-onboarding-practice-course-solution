import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
    Grid,
    GridProps,
    GridRowProps,
    GridColumn,
    GridColumnProps,
    GridCellProps,
    GridHeaderCellProps,
    GridHeaderSelectionChangeEvent,
    GridColumnMenuFilter
} from '@progress/kendo-react-grid';
import { GridPDFExport } from '@progress/kendo-react-pdf';
import { ExcelExport } from '@progress/kendo-react-excel-export';
import { observer } from 'mobx-react';

import { IdType } from './data-sources';
import { KendoGridState } from './kendo-grid-state';
import { SelectColumnCell, SelectHeaderCell } from './select-cell/select-cell';

import memoizeOne from 'memoize-one';

import * as classNames from 'classnames';
import * as Styles from './kendo-grid.less';

export interface KendoGridCellProps<T = never> extends GridCellProps {
    gridState?: KendoGridState<T, any>;
}

interface KendoGridColumnProps<T = never> extends GridColumnProps {
    cell?: React.ComponentType<KendoGridCellProps<T>>;
    children?:
        | React.ReactElement<KendoGridColumnProps<T>>[]
        | React.ReactElement<KendoGridColumnProps<T>>;
}

type ExcludedGridProps =
    | 'data'
    | 'editField'
    | 'filter'
    | 'onFilterChange'
    | 'group'
    | 'onGroupChange'
    | 'onExpandChange'
    | 'expandField'
    | 'sort'
    | 'onSortChange'
    | 'onHeaderSelectionChange'
    | 'onSelectionChange'
    | 'selectedField'
    | 'pageable'
    | 'pageSize'
    | 'skip'
    | 'onPageChange'
    | 'total';

export interface KendoGridProps<T, TId extends IdType = any>
    extends Omit<GridProps, ExcludedGridProps> {
    selectable?: boolean;
    exportable?: boolean;
    hideSelectAll?: boolean;
    exportFileName?: string;
    loading?: boolean;
    gridState: KendoGridState<T, TId>;
    className?: string;
}

@observer
export class KendoGrid<T> extends React.Component<KendoGridProps<T>> {
    private gridState = this.props.gridState;

    private selectColumnCell: React.FC<GridCellProps> = observer((props: GridCellProps) => (
        <SelectColumnCell
            {...props}
            isRowUnselectable={this.gridState.isRowUnselectable}
            limitReached={this.gridState.selectedCount >= this.gridState.selectionLimit}
        />
    ));

    private selectHeaderCell: React.FC<GridHeaderCellProps> = observer(
        (props: GridHeaderCellProps) => {
            if (this.props.hideSelectAll || this.gridState.selectionLimit !== Infinity) {
                return null;
            }

            return (
                <SelectHeaderCell
                    {...props}
                    isSomeRowsSelected={
                        this.props.scrollable !== 'virtual'
                            ? this.gridState.isSomePageRowsSelected
                            : this.gridState.isSomeRowsSelected
                    }
                />
            );
        }
    );

    rowRender = (row: React.ReactElement, rowProps: GridRowProps) => {
        let result = row;

        if (this.props.detail) {
            if (rowProps.rowType === 'groupHeader') {
                result = React.cloneElement(row, {
                    children: row.props.children.map((child: React.ReactElement) =>
                        React.cloneElement(child, {
                            columnsCount: child.props.columnsCount - 1
                        })
                    )
                });
            }
        }

        return this.props.rowRender ? this.props.rowRender(result, rowProps) : result;
    };

    private enhanceColumn(
        column: React.ReactElement<KendoGridColumnProps<T>>
    ): React.ReactElement<KendoGridColumnProps<T>> {
        const { field = '' } = column.props;
        const isFiltersActive = GridColumnMenuFilter.active(field, this.gridState.filter);

        const Cell = column.props.cell;
        const children = column.props.children;
        return React.cloneElement(column, {
            cell:
                Cell &&
                ((props: KendoGridCellProps<T>) => <Cell {...props} gridState={this.gridState} />),
            children: children && React.Children.map(children, child => this.enhanceColumn(child)),
            headerClassName: classNames(
                column.props.headerClassName,
                isFiltersActive && Styles.activeFilter
            )
        });
    }

    // TODO: rid of "memoizeOne" after migration on React.FC
    private enhanceChildren = memoizeOne((children: React.ReactNode) =>
        React.Children.map(children, child => {
            if (!React.isValidElement(child) || (child as React.ReactElement).type !== GridColumn) {
                return child;
            }

            return this.enhanceColumn(child);
        })
    );

    handleHeaderSelectionChange = (ev: GridHeaderSelectionChangeEvent) => {
        const checked = ev.syntheticEvent.currentTarget.checked;

        if (this.props.scrollable !== 'virtual') {
            if (checked) {
                this.gridState.selectPage();
            } else {
                this.gridState.deselectPage();
            }
        } else {
            if (checked) {
                this.gridState.selectAll();
            } else {
                this.gridState.deselectAll();
            }
        }
    };

    private grid = () => (
        <Grid
            {...this.props}
            data={[...this.gridState.data]}
            rowRender={this.rowRender}
            editField="inEdit"
            filter={this.gridState.filter}
            onFilterChange={this.gridState.handleFilterChange}
            group={[...this.gridState.group]}
            onGroupChange={this.gridState.handleGroupChange}
            onExpandChange={this.gridState.handleExpandChange}
            expandField="expanded"
            sort={[...this.gridState.sort]}
            onSortChange={this.gridState.handleSortChange}
            onHeaderSelectionChange={this.handleHeaderSelectionChange}
            onSelectionChange={this.gridState.handleSelectionChange}
            selectedField="selected"
            pageable={this.props.scrollable !== 'virtual' ? !!this.gridState.pageSize : false}
            pageSize={this.gridState.pageSize}
            skip={this.gridState.skip}
            onPageChange={this.gridState.handlePageChange}
            total={this.gridState.filteredCount}
        >
            {this.props.selectable && (
                <GridColumn
                    field="selected"
                    width="50px"
                    filterable={false}
                    resizable={false}
                    headerSelectionValue={
                        this.props.scrollable !== 'virtual'
                            ? this.gridState.isAllPageRowsSelected
                            : this.gridState.isAllRowsSelected
                    }
                    headerCell={this.selectHeaderCell}
                    cell={this.selectColumnCell}
                />
            )}
            {this.enhanceChildren(this.props.children)}
        </Grid>
    );

    render() {
        const grid = this.grid();
        return (
            <div
                className={classNames(
                    Styles.grid,
                    this.props.detail && Styles.hideHierarchyCell,
                    this.props.className
                )}
            >
                {grid}
                {this.props.loading && <LoadingPanel />}
                {this.props.exportable && (
                    <>
                        <GridPDFExport
                            ref={this.gridState.setGridPdfExportRef}
                            fileName={this.props.exportFileName}
                        >
                            {this.props.children}
                            {grid}
                        </GridPDFExport>
                        <ExcelExport
                            ref={this.gridState.setGridExcelExportRef}
                            fileName={this.props.exportFileName}
                        >
                            {this.props.children}
                        </ExcelExport>
                    </>
                )}
            </div>
        );
    }
}

const LoadingPanel: React.FC = () => {
    const loadingPanel = (
        <div className="k-loading-mask">
            <div className="k-loading-image" />
            <div className="k-loading-color" />
        </div>
    );

    const gridContent = document && document.querySelector('.k-widget.k-grid');
    return gridContent ? ReactDOM.createPortal(loadingPanel, gridContent) : loadingPanel;
};
