import * as React from 'react';
import { Checkbox } from '@servicetitan/design-system';
import { GridCellProps, GridHeaderCellProps } from '@progress/kendo-react-grid';
import * as Styles from './select-cell.less';

interface SelectColumnCellProps extends GridCellProps {
    isRowUnselectable?: (item: any) => boolean;
    limitReached?: boolean;
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

export const SelectCell: React.FC<SelectCellProps> = ({
    selectionChange,
    ...props
}: SelectCellProps) => {
    const onChange = (_0: never, _1: boolean, event: React.SyntheticEvent<HTMLInputElement>) => {
        if (!selectionChange) {
            return;
        }
        selectionChange({ syntheticEvent: event });
    };

    return <Checkbox className={Styles.checkbox} onChange={onChange} {...props} />;
};

export const SelectColumnCell: React.FC<SelectColumnCellProps> = (props: SelectColumnCellProps) => {
    if (props.rowType === 'groupHeader') {
        return null;
    }

    if (props.rowType === 'groupFooter') {
        return <td />;
    }

    const disabled =
        (props.isRowUnselectable && props.isRowUnselectable(props.dataItem)) ||
        (!props.dataItem.selected && props.limitReached);

    return (
        <td style={props.style}>
            <SelectCell
                checked={props.dataItem.selected}
                disabled={disabled}
                selectionChange={
                    !disabled // FIXME: https://github.com/servicetitan/anvil/issues/501
                        ? props.selectionChange
                        : undefined
                }
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
