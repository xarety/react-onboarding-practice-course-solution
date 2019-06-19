import * as React from 'react';

import { FieldState } from 'formstate';

import { GridCell } from '@progress/kendo-react-grid';
import { KendoGridCellProps } from '../kendo-grid';

export interface EditorProps<T> {
    field: FieldState<T>;
}

interface GetEditableCellParams<T> {
    viewer?: React.ComponentType<KendoGridCellProps>;
    editor: React.ComponentType<EditorProps<T>>;
}

export function getEditableCell<T>({ viewer: Viewer = GridCell, editor: Editor }: GetEditableCellParams<T>) {
    return (props: KendoGridCellProps) => {
        const { gridState, field, dataItem, rowType } = props;

        if (rowType !== 'data') {
            return <GridCell {...props} />;
        }

        const form = gridState && gridState.idSelector && gridState.inEdit.get(
            gridState.idSelector(dataItem)
        );

        if (field && form) {
            return <Editor field={form.$[field]} />;
        }

        return <Viewer {...props} />;
    };
}
