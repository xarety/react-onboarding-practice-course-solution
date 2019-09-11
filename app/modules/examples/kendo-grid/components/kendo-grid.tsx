import * as React from 'react';

import { provide, useDependencies } from '@servicetitan/react-ioc';

import { observer } from 'mobx-react';

import { Stack, ButtonGroup, Button } from '@servicetitan/design-system';

import { KendoGrid } from '../../../common/components/kendo-grid/kendo-grid';
import { GridColumn, GridCellProps } from '@progress/kendo-react-grid';
import {
    CurrencyRangeColumnMenuFilter,
    DateRangeColumnMenuFilter
} from '../../../common/components/kendo-grid/filters/range-filter/range-filter';
import { StandardColumnMenuFilter } from '../../../common/components/kendo-grid/filters/column-menu-filters';
import {
    TextEditableCell,
    NumericEditableCell,
    BooleanEditableCell,
    DateEditableCell,
    getSelectEditableCell
} from '../../../common/components/kendo-grid/editable-cell';

import { KendoGridStore } from '../stores/kendo-grid.store';

import { ActionsCell } from './actions-cell';

import { enumToOptions } from '../../../common/utils/form-helpers';
import { UserRole, Supplier } from '../utils/product';

const AvailableForEditableCell = getSelectEditableCell({
    options: enumToOptions(UserRole),
    viewer: ({ dataItem, field }) => {
        const value = dataItem[field!];

        return <td>{value && UserRole[value]}</td>;
    }
});

const SupplierCell: React.FC<GridCellProps> = ({ dataItem, field }) => {
    return <td>{Supplier[dataItem[field!]]}</td>;
};

export const KendoGridExample: React.FC = provide({ singletons: [KendoGridStore] })(
    observer(() => {
        const [{ gridState, inEdit, editAll, cancelAll, saveAll }] = useDependencies(
            KendoGridStore
        );

        return (
            <React.Fragment>
                <Stack justifyContent="flex-end" className="m-b-2">
                    {inEdit ? (
                        <ButtonGroup>
                            <Button small onClick={cancelAll} className="m-r-2">
                                Cancel All
                            </Button>

                            <Button small primary onClick={saveAll}>
                                Save All
                            </Button>
                        </ButtonGroup>
                    ) : (
                        <Button small primary onClick={editAll}>
                            Edit All
                        </Button>
                    )}
                </Stack>

                <KendoGrid gridState={gridState} selectable groupable sortable>
                    <GridColumn field="ProductID" title="ID" editable={false} width="100px" />

                    <GridColumn
                        field="ProductName"
                        title="Product Name"
                        cell={TextEditableCell}
                        columnMenu={StandardColumnMenuFilter}
                        width="240px"
                    />

                    <GridColumn
                        field="Supplier"
                        title="Supplier"
                        cell={SupplierCell}
                        columnMenu={StandardColumnMenuFilter}
                    />

                    <GridColumn
                        field="UnitsOnOrder"
                        title="First Ordered On"
                        cell={DateEditableCell}
                        columnMenu={DateRangeColumnMenuFilter}
                        format="{0:d}"
                    />

                    <GridColumn
                        field="UnitPrice"
                        title="Unit Price"
                        cell={NumericEditableCell}
                        columnMenu={CurrencyRangeColumnMenuFilter}
                        format="{0:c}"
                    />

                    <GridColumn
                        field="Discontinued"
                        title="Discontinued"
                        cell={BooleanEditableCell}
                        sortable={false}
                        width="125px"
                    />

                    <GridColumn
                        field="AvailableFor"
                        title="Available For"
                        cell={AvailableForEditableCell}
                    />

                    <GridColumn cell={ActionsCell} sortable={false} width="125px" />
                </KendoGrid>
            </React.Fragment>
        );
    })
);
