import * as React from 'react';
import { Checkbox } from '@servicetitan/design-system';
import { GridCellProps, GridHeaderCellProps } from '@progress/kendo-react-grid';
import * as Styles from './select-cell.less';

interface SelectColumnCellProps extends GridCellProps {
    isRowUnselectable?: (item: any) => boolean;
}

interface SelectHeaderCellProps extends GridHeaderCellProps {
    isSomeRowsSelected?: boolean;
}

interface SelectCellProps {
    checked: boolean;
    disabled?: boolean;
    indeterminate?: boolean;
    selectionChange?: (event: { syntheticEvent: React.SyntheticEvent<any> }) => void;
}

export const SelectCell: React.FC<SelectCellProps> = (props: SelectCellProps) => {
    const onChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
        if (!props.selectionChange) { return; }
        props.selectionChange({ syntheticEvent: event });
    };

    return (
        <Checkbox
            className={Styles.checkbox}
            onChange={onChange}
            {...props}
        />
    );
};

export const SelectColumnCell: React.FC<SelectColumnCellProps> = (props: SelectColumnCellProps) => {
    if (props.rowType === 'groupHeader') {
        return null;
    }

    if (props.rowType === 'groupFooter') {
        return <td />;
    }

    return (
        <td>
            <SelectCell
                checked={props.dataItem.selected}
                disabled={props.isRowUnselectable && props.isRowUnselectable(props.dataItem)}
                selectionChange={props.selectionChange}
            />
        </td>
    );
};

export const SelectHeaderCell: React.FC<SelectHeaderCellProps> = (props: SelectHeaderCellProps) => (
    <SelectCell
        checked={props.selectionValue}
        indeterminate={props.isSomeRowsSelected}
        selectionChange={props.selectionChange}
    />
);
