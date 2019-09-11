import * as React from 'react';

import { FieldState } from 'formstate';

import { GridCell } from '@progress/kendo-react-grid';
import { KendoGridCellProps } from '../kendo-grid';

export interface EditorProps<T> extends KendoGridCellProps<any> {
    fieldState: FieldState<T>;
}

interface GetEditableCellParams<T> {
    viewer?: React.ComponentType<KendoGridCellProps<any>>;
    editor: React.ComponentType<EditorProps<T>>;
}

export function getEditableCell<T>({
    viewer: Viewer = GridCell,
    editor: Editor
}: GetEditableCellParams<T>) {
    return (props: KendoGridCellProps<any>) => {
        const { gridState, field, dataItem, rowType } = props;

        if (rowType !== 'data') {
            return <GridCell {...props} />;
        }

        const form =
            gridState &&
            gridState.dataSource &&
            gridState.dataSource.idSelector &&
            gridState.inEdit.get(gridState.dataSource.idSelector(dataItem));

        if (field && form) {
            return <Editor {...props} fieldState={form.$[field]} />;
        }

        return <Viewer {...props} />;
    };
}
