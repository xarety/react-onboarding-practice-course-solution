import * as React from 'react';

import { observer } from 'mobx-react';

import { EditorProps, getEditableCell } from '../../common/components/kendo-grid/editable-cell/get-editable-cell';
import { GridCellProps } from '@progress/kendo-react-grid';
import { Input } from '@progress/kendo-react-inputs';

const Viewer: React.FC<GridCellProps> = ({ rowType }) => {
    if (rowType === 'groupHeader') {
        return null;
    }

    return <td />;
};

const Editor: React.FC<EditorProps<string>> = observer(
    ({ field: { value, onChange } }) => {
        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            onChange(event.target.value);
        };

        return (
            <td>
                <Input
                    value={value}
                    onChange={handleChange}
                    type="password"
                />
            </td>
        );
    }
);

export const PasswordEditableCell = getEditableCell({
    viewer: Viewer,
    editor: Editor
});
