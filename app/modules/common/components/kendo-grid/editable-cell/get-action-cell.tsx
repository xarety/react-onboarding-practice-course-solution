import * as React from 'react';

import { GridCell } from '@progress/kendo-react-grid';
import { KendoGridCellProps } from '../kendo-grid';

import { PossibleFormState } from '../kendo-grid-state';

export interface EditActionProps<T> extends KendoGridCellProps<T> {
    formState: PossibleFormState<T>;
}

interface GetActionCellParams<T> {
    view: React.ComponentType<KendoGridCellProps<T>>;
    edit: React.ComponentType<EditActionProps<T>>;
}

export function getActionCell<T>({ view: ViewAction, edit: EditAction }: GetActionCellParams<T>) {
    return (props: KendoGridCellProps<T>) => {
        const { gridState, dataItem, rowType } = props;

        if (rowType !== 'data') {
            return <GridCell {...props} />;
        }

        const form =
            gridState &&
            gridState.dataSource &&
            gridState.dataSource.idSelector &&
            gridState.inEdit.get(gridState.dataSource.idSelector(dataItem));

        if (form) {
            return <EditAction {...props} formState={form} />;
        }

        return <ViewAction {...props} />;
    };
}
